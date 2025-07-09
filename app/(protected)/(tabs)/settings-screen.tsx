import { ActivityIndicator, Alert, View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted, P } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useProfile } from "@/hooks/useProfile";
import { getFullName } from "@/lib/profile";
import { LangSelect } from "@/components/select/lang-select";
import { useTranslation } from "@/lib/i18n/hooks";
import { routes } from "@/lib/routes";
import { useState } from "react";

export default function Settings() {
	const { signOut, deleteUser, isGuest } = useAuth();
	const { profile, isLoading } = useProfile();
	const [isDeleting, setIsDeleting] = useState(false);
	const { t } = useTranslation();
	const fullName = getFullName(profile);
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return t("greetings.good_morning");
		if (hour < 18) return t("greetings.good_afternoon");
		return t("greetings.good_evening");
	};

	const handleTermsPress = () => router.push(routes.tos());

	const showDeleteAccountAlert = () => {
		Alert.alert(
			t("settings.delete_account"),
			t("settings.delete_account_description"),
			[
				{ text: t("common.cancel"), style: "cancel" },
				{
					text: t("common.delete"),
					onPress: async () => {
						setIsDeleting(true);
						await deleteUser();
						setIsDeleting(false);
					},
				},
			],
		);
	};

	// Handle guest user
	if (isGuest) {
		return (
			<SafeAreaView className="flex-1 bg-background p-4">
				<H1>{t("settings.title")}</H1>
				<View className="flex-1 justify-center gap-4">
					<H2>Guest Mode</H2>
					<P>
						You&apos;re browsing as a guest. Sign up for full access to all
						features.
					</P>

					<Button onPress={() => router.push(routes.signUp())}>
						<Text>{t("auth.sign_up")}</Text>
					</Button>

					<Button
						variant="secondary"
						onPress={() => router.push(routes.signIn())}
					>
						<Text>{t("auth.sign_in")}</Text>
					</Button>
				</View>

				<LangSelect style={{ borderRadius: 0 }} clearable={false} />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			{isDeleting && <ActivityIndicator className="self-center" />}
			{/* Top Section - User Greeting */}
			<View className="p-6 pt-8">
				<H1 className="text-left mb-2">{t("settings.title")}</H1>
				{isLoading ? (
					<Muted>{t("common.loading")}</Muted>
				) : fullName ? (
					<>
						<H2 className="text-left mb-1">{getGreeting()},</H2>
						<H2 className="text-left text-primary">{fullName}!</H2>
					</>
				) : (
					<Muted>{t("settings.welcome_message")}</Muted>
				)}
			</View>

			{/* Middle Section - Settings Options (for future expansion) */}
			<View className="flex-1 px-6">
				{/* This space can be used for additional settings options in the future */}
				<View className="flex-1 justify-center items-center opacity-50">
					<Muted className="text-center"></Muted>
				</View>
			</View>

			{/* Bottom Section - Sign Out */}
			<LangSelect style={{ borderRadius: 0 }} clearable={false} />
			<View className="px-6 pb-2 pt-4 border-t border-border">
				<View className="mb-4">
					<Text className="text-lg font-semibold">{t("settings.account")}</Text>
					<View className="flex-row items-center justify-between">
						<Muted className="text-sm">
							{t("settings.sign_out_description")}
						</Muted>
						<Button
							className="w-min"
							size="sm"
							variant="link"
							onPress={showDeleteAccountAlert}
						>
							<Text>{t("settings.delete_account")}</Text>
						</Button>
					</View>
				</View>

				<Button
					className="w-full"
					size="default"
					variant="default"
					onPress={async () => {
						await signOut();
					}}
				>
					<Text>{t("auth.sign_out")}</Text>
				</Button>
				<Button
					className="w-min"
					size="sm"
					variant="link"
					onPress={handleTermsPress}
				>
					<Text>{t("auth.terms_and_privacy_link")}</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
