import "../global.css";

import { Stack } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";
import { initializeMapbox } from "@/lib/mapbox";
import { ErrorBoundary } from "@/components/error-boundary";

import { AuthProvider } from "@/context/supabase-provider";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function AppLayout() {
	const { colorScheme } = useColorScheme();

	useEffect(() => {
		try {
			initializeMapbox();
		} catch (error) {
			console.error("Failed to initialize Mapbox:", error);
		}
	}, []);

	return (
		<AuthProvider>
			<ErrorBoundary
				fallback={({ error }) => (
					<View
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							padding: 20,
						}}
					>
						<Text
							style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
						>
							Something went wrong
						</Text>
						<Text style={{ color: "red" }}>{error?.message}</Text>
					</View>
				)}
			>
				<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
					<Stack.Screen name="(protected)" />
					<Stack.Screen name="welcome" />
					<Stack.Screen
						name="sign-up"
						options={{
							presentation: "modal",
							headerShown: true,
							headerTitle: "Sign Up",
							headerStyle: {
								backgroundColor:
									colorScheme === "dark"
										? colors.dark.background
										: colors.light.background,
							},
							headerTintColor:
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground,
							gestureEnabled: true,
						}}
					/>
					<Stack.Screen
						name="sign-in"
						options={{
							presentation: "modal",
							headerShown: true,
							headerTitle: "Sign In",
							headerStyle: {
								backgroundColor:
									colorScheme === "dark"
										? colors.dark.background
										: colors.light.background,
							},
							headerTintColor:
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground,
							gestureEnabled: true,
						}}
					/>
				</Stack>
			</ErrorBoundary>
		</AuthProvider>
	);
}
