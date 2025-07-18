import { Stack } from "expo-router";

export default function FeedLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen
				name="[id]"
				options={{
					presentation: "modal",
					headerShown: false,
					gestureEnabled: true,
					animation: "slide_from_bottom",
				}}
			/>
			<Stack.Screen
				name="create-post"
				options={{
					presentation: "modal",
					headerShown: false,
					gestureEnabled: true,
					animation: "slide_from_bottom",
				}}
			/>
			<Stack.Screen
				name="[id]/update-post"
				options={{
					presentation: "modal",
					headerShown: false,
					gestureEnabled: true,
					animation: "slide_from_bottom",
				}}
			/>
		</Stack>
	);
}
