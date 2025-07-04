import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { useBannedKeywords } from "@/hooks/useModeration";
import { getContentVisibility } from "@/utils/content-filter";
import { useTranslation } from "@/lib/i18n/hooks";

interface FilteredContentProps {
	children: React.ReactNode;
	text: string;
	className?: string;
	showWarning?: boolean;
}

export const FilteredContent: React.FC<FilteredContentProps> = ({
	children,
	text,
	className,
	showWarning = true,
}) => {
	const { t } = useTranslation();
	const { data: keywords = [] } = useBannedKeywords();
	const [showHidden, setShowHidden] = React.useState(false);

	const { shouldShow, shouldFilter, warning } = getContentVisibility(
		text,
		keywords,
	);

	if (!shouldShow && !showHidden) {
		return (
			<View className={className}>
				<View className="bg-muted rounded-lg p-4 border border-border">
					<Text className="text-muted-foreground text-center mb-2">
						{t("moderation.content_hidden")}
					</Text>
					<TouchableOpacity
						onPress={() => setShowHidden(true)}
						className="bg-background rounded px-3 py-2 self-center"
					>
						<Text className="text-xs text-muted-foreground">Show anyway</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View className={className}>
			{shouldFilter && showWarning && warning && (
				<View className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 mb-2">
					<Text className="text-destructive text-xs">
						{t("moderation.content_filtered")}
					</Text>
				</View>
			)}
			{children}
		</View>
	);
};

interface FilteredTextProps {
	text: string;
	className?: string;
	numberOfLines?: number;
	showWarning?: boolean;
}

export const FilteredText: React.FC<FilteredTextProps> = ({
	text,
	className,
	numberOfLines,
	showWarning = true,
}) => {
	const { t } = useTranslation();
	const { data: keywords = [] } = useBannedKeywords();
	const [showHidden, setShowHidden] = React.useState(false);

	const { shouldShow, shouldFilter, filteredText, warning } =
		getContentVisibility(text, keywords);

	if (!shouldShow && !showHidden) {
		return (
			<View className="bg-muted rounded-lg p-3 border border-border">
				<Text className="text-muted-foreground text-center text-sm mb-2">
					{t("moderation.content_hidden")}
				</Text>
				<TouchableOpacity
					onPress={() => setShowHidden(true)}
					className="bg-background rounded px-3 py-1 self-center"
				>
					<Text className="text-xs text-muted-foreground">Show anyway</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<>
			{shouldFilter && showWarning && warning && (
				<View className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 mb-2">
					<Text className="text-destructive text-xs">
						{t("moderation.content_filtered")}
					</Text>
				</View>
			)}
			<Text className={className} numberOfLines={numberOfLines}>
				{shouldFilter ? filteredText : text}
			</Text>
		</>
	);
};
