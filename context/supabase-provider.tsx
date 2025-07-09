import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { SplashScreen, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Session } from "@supabase/supabase-js";

import { supabase } from "@/config/supabase";
import { useTranslation } from "react-i18next";
import { useMapSearch } from "@/hooks/useMapSearch";

SplashScreen.preventAutoHideAsync();

const GUEST_MODE_KEY = "spark_guest_mode";

type AuthState = {
	initialized: boolean;
	session: Session | null;
	isGuest: boolean;
	signUp: (
		email: string,
		password: string,
		userData: { firstName: string; lastName: string },
	) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	deleteUser: () => Promise<void>;
	continueAsGuest: () => Promise<void>;
	exitGuestMode: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	isGuest: false,
	signUp: async () => {},
	signIn: async () => {},
	signOut: async () => {},
	deleteUser: async () => {},
	continueAsGuest: async () => {},
	exitGuestMode: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const [isGuest, setIsGuest] = useState(false);
	const router = useRouter();
	const { t } = useTranslation();
	const { resetMap } = useMapSearch();

	const signUp = async (
		email: string,
		password: string,
		userData: { firstName: string; lastName: string },
	) => {
		// Clear guest mode when signing up
		await exitGuestMode();
		resetMap();

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
		// Clear guest mode when signing in
		await exitGuestMode();
		resetMap();
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
		await exitGuestMode();
		resetMap();
		if (error) {
			return;
		}
	};

	const deleteUser = async () => {
		await supabase.functions.invoke("delete-user", {
			body: { userId: session?.user.id! },
		});
		await exitGuestMode();
		resetMap();
		router.replace("/welcome");
	};

	const continueAsGuest = async () => {
		try {
			await AsyncStorage.setItem(GUEST_MODE_KEY, "true");
			setIsGuest(true);
		} catch (error) {
			console.error("Failed to set guest mode:", error);
		}
	};

	const exitGuestMode = async () => {
		try {
			await AsyncStorage.removeItem(GUEST_MODE_KEY);
			setIsGuest(false);
		} catch (error) {
			console.error("Failed to exit guest mode:", error);
		}
	};

	const checkGuestMode = async () => {
		try {
			const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
			return guestMode === "true";
		} catch (error) {
			console.error("Failed to check guest mode:", error);
			return false;
		}
	};

	useEffect(() => {
		const initializeAuth = async () => {
			// Check guest mode first
			const guestModeActive = await checkGuestMode();
			setIsGuest(guestModeActive);

			// Get session
			supabase.auth.getSession().then(({ data: { session } }) => {
				setSession(session);
			});

			// Set up auth state change listener
			supabase.auth.onAuthStateChange((_event, session) => {
				setSession(session);
				// If user signs in, exit guest mode
				if (session) {
					exitGuestMode();
				}
			});

			setInitialized(true);
		};

		initializeAuth();
	}, []);

	useEffect(() => {
		if (initialized) {
			SplashScreen.hideAsync();
			// Navigate based on auth/guest state
			if (session || isGuest) {
				// Authenticated user and Guest can access app
				router.replace("/map");
			} else {
				// Not authenticated and not guest
				router.replace("/welcome");
			}
		}
		// eslint-disable-next-line
	}, [initialized, session, isGuest]);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session,
				isGuest,
				signUp,
				signIn,
				signOut,
				deleteUser,
				continueAsGuest,
				exitGuestMode,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
