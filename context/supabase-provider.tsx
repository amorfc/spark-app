import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { SplashScreen, useRouter } from "expo-router";

import { Session } from "@supabase/supabase-js";

import { supabase } from "@/config/supabase";
import { useTranslation } from "react-i18next";

SplashScreen.preventAutoHideAsync();

type AuthState = {
	initialized: boolean;
	session: Session | null;
	signUp: (
		email: string,
		password: string,
		userData: { firstName: string; lastName: string },
	) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	signUp: async () => {},
	signIn: async () => {},
	signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const router = useRouter();
	const { t } = useTranslation();

	const signUp = async (
		email: string,
		password: string,
		userData: { firstName: string; lastName: string },
	) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					firstName: userData.firstName,
					lastName: userData.lastName,
				},
			},
		});

		if (error) {
			if (error.message === "User already registered") {
				throw new Error(t("errors.user_already_registered"));
			}

			throw error;
		}

		if (data.session) {
			setSession(data.session);
		} else {
			throw new Error("Email already in use or invalid password/email");
		}
	};

	const signIn = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			if (error.message === "Invalid login credentials") {
				throw new Error(t("errors.invalid_login_credentials"));
			}

			throw error;
		}

		if (!data.user.user_metadata.email_verified) {
			throw new Error("Email not verified");
		}

		if (data.session) {
			setSession(data.session);
		} else {
			throw new Error("Email already in use or invalid password/email");
		}
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();

		if (error) {
			return;
		}
	};

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		setInitialized(true);
	}, []);

	useEffect(() => {
		if (initialized) {
			SplashScreen.hideAsync();
			if (session) {
				router.replace("/map");
			} else {
				router.replace("/welcome");
			}
		}
		// eslint-disable-next-line
	}, [initialized, session]);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session,
				signUp,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
