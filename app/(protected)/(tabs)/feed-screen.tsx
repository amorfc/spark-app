import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { useTranslation } from "@/lib/i18n/hooks";

export default function FeedScreen() {
	const { t } = useTranslation();

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<View className="flex-1 items-center justify-center p-4">
				<Text className="text-2xl font-semibold mb-2">
					{t("navigation.feed")}
				</Text>
				<Text className="text-center text-muted-foreground">
					Feed functionality coming soon!
				</Text>
			</View>
		</SafeAreaView>
	);
}
