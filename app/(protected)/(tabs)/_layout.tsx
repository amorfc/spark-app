import React from "react";
import { Tabs } from "expo-router";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useProtectedAppInit } from "@/hooks/useProtectedAppInit";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();
	useProtectedAppInit();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
				},
				tabBarActiveTintColor: "#FF69B4",
				tabBarInactiveTintColor: "#9CA3AF",
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
					marginTop: 2,
				},
			}}
		>
			<Tabs.Screen
				name="map-screen"
				options={{
					title: "Map",
					tabBarIcon: ({ focused }) => (
						<MaterialIcons
							name="map"
							size={24}
							color={focused ? "#FF69B4" : "#9CA3AF"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="blog-screen"
				options={{
					title: "Blog",
					tabBarIcon: ({ focused }) => (
						<MaterialIcons
							name="article"
							size={24}
							color={focused ? "#FF69B4" : "#9CA3AF"}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="settings-screen"
				options={{
					title: "Settings",
					tabBarIcon: ({ focused }) => (
						<MaterialIcons
							name="settings"
							size={24}
							color={focused ? "#FF69B4" : "#9CA3AF"}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
