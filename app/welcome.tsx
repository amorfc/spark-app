import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useTranslation } from "@/lib/i18n/hooks";
import { routes } from "@/lib/routes";

export default function WelcomeScreen() {
	const router = useRouter();
	const { t } = useTranslation();
	const appIcon = require("@/assets/icon.png");

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<View className="flex flex-1 items-center justify-center gap-y-4 web:m-4">
				<Image source={appIcon} className="size-32 rounded-xl" />
				<H1 className="text-center">{t("app.title")}</H1>
				<Muted className="text-center">{t("app.description")}</Muted>
			</View>
			<View className="flex flex-col gap-y-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={() => {
						router.push(routes.signUp());
					}}
				>
					<Text>{t("auth.sign_up")}</Text>
				</Button>
				<Button
					size="default"
					variant="secondary"
					onPress={() => {
						router.push(routes.signIn());
					}}
				>
					<Text>{t("auth.sign_in")}</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
