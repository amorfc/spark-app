import React from "react";
import { Tabs } from "expo-router";

import { colors } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useProtectedAppInit } from "@/hooks/useProtectedAppInit";
import { useTranslation } from "@/lib/i18n/hooks";

export default function TabsLayout() {
	const { t } = useTranslation();
	useProtectedAppInit();

	const getTabBarIconProps = (focused: boolean) => ({
		size: 24,
		color: focused ? colors.light.primary : colors.light.mutedForeground,
	});

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: colors.light.background,
				},
				tabBarActiveTintColor: colors.light.primary,
				tabBarInactiveTintColor: colors.light.mutedForeground,
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
					marginTop: 2,
				},
			}}
		>
			<Tabs.Screen
				name="map"
				options={{
					title: t("navigation.map"),
					tabBarIcon: ({ focused }) => (
						<MaterialIcons name="map" {...getTabBarIconProps(focused)} />
					),
				}}
			/>
			<Tabs.Screen
				name="feed"
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
