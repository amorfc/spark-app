import "../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/app-error-fallback";

import { AuthProvider } from "@/context/supabase-provider";
import { colors } from "@/constants/colors";
import { setupLogBox } from "@/utils/ignoreLogs";
import { queryClient } from "@/lib/query-client";
import { store } from "@/store";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/i18n";
import { Appearance } from "react-native";

// Force light mode globally
Appearance.getColorScheme = () => "light";

setupLogBox();

export default function AppLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<I18nextProvider i18n={i18n}>
				<ReduxProvider store={store}>
					<QueryClientProvider client={queryClient}>
						<AuthProvider>
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
											headerShown: false,
											headerTitle: "Sign Up",
											headerStyle: {
												backgroundColor: colors.light.background,
											},
											headerTintColor: colors.light.foreground,
											gestureEnabled: true,
										}}
									/>
									<Stack.Screen
										name="tos"
										options={{
											presentation: "modal",
											headerShown: false,
											headerTitle: "Terms of Service and Privacy Policy",
											headerStyle: {
												backgroundColor: colors.light.background,
											},
											headerTintColor: colors.light.foreground,
											gestureEnabled: true,
										}}
									/>
									<Stack.Screen
										name="sign-in"
										options={{
											presentation: "modal",
											headerShown: false,
											headerTitle: "Sign In",
											headerStyle: {
												backgroundColor: colors.light.background,
											},
											headerTintColor: colors.light.foreground,
											gestureEnabled: true,
										}}
									/>
								</Stack>
							</ErrorBoundary>
						</AuthProvider>
					</QueryClientProvider>
				</ReduxProvider>
			</I18nextProvider>
		</GestureHandlerRootView>
	);
}
