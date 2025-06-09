import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/app-error-fallback";

import { AuthProvider } from "@/context/supabase-provider";
import { SearchProvider } from "@/context/search-provider";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { setupLogBox } from "@/utils/ignoreLogs";

setupLogBox();

export default function AppLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AuthProvider>
				<SearchProvider>
					<ErrorBoundary
						fallback={({ error }) => <ErrorFallback error={error} />}
					>
						<Stack
							screenOptions={{ headerShown: false, gestureEnabled: false }}
						>
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
				</SearchProvider>
			</AuthProvider>
		</GestureHandlerRootView>
	);
}
