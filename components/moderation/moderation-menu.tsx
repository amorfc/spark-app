import React, { useState, useRef } from "react";
import {
	View,
	TouchableOpacity,
	Modal,
	Pressable,
	Alert,
	ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { colors } from "@/constants/colors";
import { useTranslation } from "@/lib/i18n/hooks";
import { useReportContent, useBlockUser } from "@/hooks/useModeration";
// ReportForm will be imported when we use it
import { ReportType } from "@/types/moderation";

interface ModerationMenuProps {
	// Content to moderate
	contentType: "post" | "review" | "post_review";
	contentId: string;
	authorId: string;
	authorName: string;

	// UI props
	iconColor?: string;
	size?: number;
}

export const ModerationMenu: React.FC<ModerationMenuProps> = ({
	contentType,
	contentId,
	authorId,
	authorName,
	iconColor = colors.light.mutedForeground,
	size = 20,
}) => {
	const { t } = useTranslation();
	const [showMenu, setShowMenu] = useState(false);
	const [showReportForm, setShowReportForm] = useState(false);
	const buttonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

	const {
		reportPost,
		reportReview,
		reportPostReview,
		isLoading: isReporting,
	} = useReportContent();
	const blockUserMutation = useBlockUser();

	const handleReport = () => {
		setShowMenu(false);
		setShowReportForm(true);
	};

	const handleBlock = () => {
		setShowMenu(false);
		Alert.alert(
			t("moderation.block_confirmation.title"),
			t("moderation.block_confirmation.message"),
			[
				{
					text: t("moderation.block_confirmation.cancel"),
					style: "cancel",
				},
				{
					text: t("moderation.block_confirmation.block"),
					style: "destructive",
					onPress: async () => {
						try {
							await blockUserMutation.mutateAsync({ blocked_id: authorId });
							Alert.alert(t("common.success"), t("moderation.user_blocked"));
						} catch (error) {
							Alert.alert(
								t("common.error"),
								error instanceof Error
									? error.message
									: t("errors.general_error"),
							);
						}
					},
				},
			],
		);
	};

	const handleReportSubmit = async (data: {
		report_type: ReportType;
		description?: string;
	}) => {
		try {
			if (contentType === "post") {
				await reportPost(contentId, data);
			} else if (contentType === "review") {
				await reportReview(contentId, data);
			} else if (contentType === "post_review") {
				await reportPostReview(contentId, data);
			}

			Alert.alert(t("common.success"), t("moderation.report_submitted"));
			setShowReportForm(false);
		} catch (error) {
			Alert.alert(
				t("common.error"),
				error instanceof Error ? error.message : t("errors.general_error"),
			);
		}
	};

	const getContentType = () => {
		if (contentType === "post") {
			return t("moderation.content_types.post");
		} else if (contentType === "review") {
			return t("moderation.content_types.review");
		} else if (contentType === "post_review") {
			return t("moderation.content_types.post_review");
		}
	};

	return (
		<>
			{/* Three-dot menu button */}
			<TouchableOpacity
				ref={buttonRef}
				onPress={() => setShowMenu(true)}
				className="p-2 rounded-full"
				accessibilityLabel="More options"
				accessibilityRole="button"
			>
				{isReporting || blockUserMutation.isPending ? (
					<ActivityIndicator size="small" color={iconColor} />
				) : (
					<MaterialIcons name="more-vert" size={size} color={iconColor} />
				)}
			</TouchableOpacity>

			{/* Menu Modal */}
			<Modal
				visible={showMenu}
				transparent
				animationType="fade"
				onRequestClose={() => setShowMenu(false)}
			>
				<Pressable
					style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
					onPress={() => setShowMenu(false)}
				>
					<View className="flex-1 justify-center items-center p-4">
						<View className="bg-background rounded-lg p-4 w-64 max-w-full shadow-lg">
							<Text className="text-lg font-semibold mb-4 text-center">
								{t("moderation.moderation_options")}
							</Text>

							{/* Report Content Option */}
							<TouchableOpacity
								onPress={handleReport}
								className="flex-row items-center p-3 rounded-lg active:bg-muted"
							>
								<MaterialIcons
									name="flag"
									size={20}
									color={colors.light.destructive}
								/>
								<Text className="ml-3 text-base">
									{t("moderation.report_content")}
								</Text>
							</TouchableOpacity>

							{/* Block User Option */}
							<TouchableOpacity
								onPress={handleBlock}
								className="flex-row items-center p-3 rounded-lg active:bg-muted"
							>
								<MaterialIcons
									name="block"
									size={20}
									color={colors.light.destructive}
								/>
								<Text className="ml-3 text-base">
									{t("moderation.block_user")}
								</Text>
							</TouchableOpacity>

							{/* Cancel */}
							<TouchableOpacity
								onPress={() => setShowMenu(false)}
								className="flex-row items-center justify-center p-3 mt-2 rounded-lg bg-muted"
							>
								<Text className="text-base font-medium">
									{t("common.cancel")}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Pressable>
			</Modal>

			{/* Report Form Modal */}
			<Modal
				visible={showReportForm}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowReportForm(false)}
			>
				<View className="flex-1 bg-background">
					<View className="flex-row justify-between items-center px-4 py-3 border-b border-border">
						<Text className="text-xl font-semibold">
							{t("moderation.report_content")}
						</Text>
						<TouchableOpacity
							onPress={() => setShowReportForm(false)}
							disabled={isReporting}
							className="p-2"
						>
							<MaterialIcons
								name="close"
								size={24}
								color={colors.light.mutedForeground}
							/>
						</TouchableOpacity>
					</View>
					<View className="flex-1 p-4">
						<Text className="text-sm text-muted-foreground mb-4">
							{t("moderation.reporting_content_by", {
								contentType: getContentType(),
								authorName: authorName,
							})}
						</Text>
						<TouchableOpacity
							onPress={async () => {
								try {
									await handleReportSubmit({
										report_type: "inappropriate_content",
										description: "Reported via quick action",
									});
								} catch {
									// Error already handled in handleReportSubmit
								}
							}}
							disabled={isReporting}
							className="bg-destructive rounded-lg p-4 mb-3"
						>
							<Text className="text-white text-center font-medium">
								{isReporting
									? t("common.submitting")
									: t("moderation.report_as_inappropriate")}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</>
	);
};
