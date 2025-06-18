import React from "react";
import { Tabs } from "expo-router";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useProtectedAppInit } from "@/hooks/useProtectedAppInit";
import { useTranslation } from "@/lib/i18n/hooks";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	useProtectedAppInit();

	const getTabBarIconProps = (focused: boolean) => ({
		size: 24,
		color: focused ? "#FF69B4" : "#9CA3AF",
	});

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
					title: t("navigation.map"),
					tabBarIcon: ({ focused }) => (
						<MaterialIcons name="map" {...getTabBarIconProps(focused)} />
					),
				}}
			/>
			<Tabs.Screen
				name="feed-screen"
				options={{
					title: t("navigation.feed"),
					tabBarIcon: ({ focused }) => (
						<MaterialIcons
							name="dynamic-feed"
							{...getTabBarIconProps(focused)}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="blog-screen"
				options={{
					title: t("navigation.blog"),
					tabBarIcon: ({ focused }) => (
						<MaterialIcons name="article" {...getTabBarIconProps(focused)} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings-screen"
				options={{
					title: t("navigation.settings"),
					tabBarIcon: ({ focused }) => (
						<MaterialIcons name="settings" {...getTabBarIconProps(focused)} />
					),
				}}
			/>
		</Tabs>
	);
}
