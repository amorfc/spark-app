import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/context/supabase-provider";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

export default function ProtectedLayout() {
	const { initialized, session, isGuest } = useAuth();

	if (!initialized) {
		return null;
	}

	// Allow both authenticated users and guests
	if (!session && !isGuest) {
		return <Redirect href="/welcome" />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="modal" options={{ presentation: "modal" }} />
		</Stack>
	);
}
