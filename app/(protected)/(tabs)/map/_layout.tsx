import { Stack } from "expo-router";

export default function MapLayout() {
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
		</Stack>
	);
}
