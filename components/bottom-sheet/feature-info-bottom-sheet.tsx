import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";
import {
	View,
	TouchableOpacity,
	ActivityIndicator,
	Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { BottomSheet, BottomSheetProps, BottomSheetRef } from "./bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { useFeatureMetadata } from "@/hooks/useFeatureMetadata";
import { useFeatureReviewsInfinite, useUserReview } from "@/hooks/useReviews";
import { router } from "expo-router";
import { GenericFlatList } from "@/components/ui/generic-flatlist";
import { Review } from "@/types/reviews";
import { ReviewItem } from "@/components/reviews/review-item";
import { useTranslation } from "@/lib/i18n/hooks";

type FeatureInfoBottomSheetProps = Omit<BottomSheetProps, "children"> & {
	feature: GeoJSON.Feature;
};

export const FeatureInfoBottomSheet = forwardRef<
	BottomSheetRef,
	FeatureInfoBottomSheetProps
>(({ feature, ...bottomSheetProps }, ref) => {
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();

	const isDark = colorScheme === "dark";
	const bottomSheetRef = useRef<BottomSheetRef>(null);
	const { icon, label } = useFeatureMetadata(feature);
	const {
		data: reviewsData,
		isLoading: reviewsLoading,
		isRefetching: reviewsRefetching,
		refetch: reviewsRefetch,
	} = useFeatureReviewsInfinite(feature?.id as string);
	const { data: userReview, isLoading: userReviewLoading } = useUserReview(
		feature?.id as string,
	);

	// Expose methods to parent via ref
	useImperativeHandle(
		ref,
		() => ({
			...bottomSheetRef.current!,
		}),
		[],
	);

	const iconColor = isDark
		? colors.dark.mutedForeground
		: colors.light.mutedForeground;

	useEffect(() => {
		if (!feature) {
			bottomSheetRef.current?.close();
		}
	}, [feature]);

	const locationString =
		feature.geometry?.type === "Point"
			? `${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}`
			: "N/A";
	const featureInfoData = [
		{
			icon: icon,
			header: "Type",
			content: label,
			type: "type",
		},
		{
			icon: "📍",
			header: "Location",
			content: locationString,
			type: "location",
		},
		{
			icon: "🕸️",
			header: "Network",
			content: feature.properties?.network,
			type: "network",
		},
		{
			icon: "🚀",
			header: "Operator",
			content: feature.properties?.operator,
			type: "operator",
		},
		{
			icon: "🌐",
			header: "Source",
			content: feature.properties?.source,
			type: "source",
		},
	];

	const renderReviewItem = ({ item }: { item: Review }) => {
		return <ReviewItem review={item} />;
	};

	const renderFeatureInfo = ({
		icon,
		header,
		content,
	}: {
		icon: string;
		header: string;
		content: string;
	}) => {
		return (
			<View
				key={`${header}-${content}`}
				className="flex-row items-center px-2 py-2 rounded bg-muted"
			>
				<Text className="text-xl font-medium">{icon}</Text>
				<View className="ml-2">
					<Text className="text-sm font-medium">{header}</Text>
					<Text className="text-sm text-muted-foreground capitalize">
						{content}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<BottomSheet
			ref={bottomSheetRef}
			scrollable={false}
			enablePanDownToClose={false}
			style={{ zIndex: 2000 }}
			snapPoints={["85%"]}
			index={0}
			showBackdrop={false}
			{...bottomSheetProps}
		>
			{feature && (
				<View style={{ flex: 1 }}>
					{/* Fixed Header Section */}
					<View style={{ flexShrink: 0 }}>
						<View className="pb-3 border-b border-gray-200 mb-3">
							<View className="flex-row justify-between">
								<View className="flex-1">
									<Text className="text-xl font-semibold" numberOfLines={1}>
										{feature?.properties?.name}
									</Text>
								</View>
								<TouchableOpacity
									className="px-1"
									onPress={() => bottomSheetRef.current?.close()}
								>
									<MaterialIcons name="close" size={24} color={iconColor} />
								</TouchableOpacity>
							</View>
							<TouchableOpacity
								className="mt-2 items-center py-1.5 bg-primary web:hover:opacity-90 active:opacity-90 rounded-lg"
								onPress={() => router.push(`/review-upsert-screen`)}
							>
								{userReviewLoading ? (
									<ActivityIndicator size="small" color="white" />
								) : userReview ? (
									<Text className="text-white font-medium">
										{t("reviews.edit_review_button")}
									</Text>
								) : (
									<Text className="text-white font-medium">
										{t("reviews.add_review")}
									</Text>
								)}
							</TouchableOpacity>
						</View>

						<View className="flex flex-row flex-wrap gap-1 mb-3">
							{featureInfoData
								.filter((item) => item.content)
								.map((item) => renderFeatureInfo(item))}
						</View>
					</View>

					{/* Scrollable Reviews Section */}
					<View style={{ flex: 1, minHeight: 0 }}>
						<GenericFlatList
							data={reviewsData?.pages[0].data.reviews ?? []}
							loading={reviewsLoading}
							onRefresh={reviewsRefetch}
							refreshing={reviewsRefetching}
							emptyStateMessage={t("empty_states.no_reviews")}
							emptyStateSubtitle={t("empty_states.be_first_reviewer")}
							renderItem={renderReviewItem}
							showsVerticalScrollIndicator={true}
							contentContainerStyle={{
								paddingBottom: 20,
								flexGrow: 1,
								maxHeight: Dimensions.get("window").height * 0.8 - 50,
							}}
							style={{ flex: 1 }}
						/>
					</View>
				</View>
			)}
		</BottomSheet>
	);
});

FeatureInfoBottomSheet.displayName = "FeatureInfoBottomSheet";

export default FeatureInfoBottomSheet;
