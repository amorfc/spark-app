import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { BottomSheet, BottomSheetProps, BottomSheetRef } from "./bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { useFeatureMetadata } from "@/hooks/useFeatureMetadata";

type FeatureInfoBottomSheetProps = Omit<BottomSheetProps, "children"> & {
	feature: GeoJSON.Feature;
};

export const FeatureInfoBottomSheet = forwardRef<
	BottomSheetRef,
	FeatureInfoBottomSheetProps
>(({ feature, ...bottomSheetProps }, ref) => {
	const { colorScheme } = useColorScheme();

	const isDark = colorScheme === "dark";
	const snapPoints = useMemo(() => ["20%"], []);
	const bottomSheetRef = useRef<BottomSheetRef>(null);
	const { icon, label } = useFeatureMetadata(feature);

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
			<View className="flex-row items-center px-2 py-2 rounded bg-muted">
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
			snapPoints={snapPoints}
			initialSnapIndex={0}
			containerStyle={{ zIndex: 2000 }}
			scrollable={true}
			{...bottomSheetProps}
		>
			{feature && (
				<View className="flex-1">
					<View className="flex-1">
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
						</View>

						<View className="flex flex-row flex-wrap gap-1">
							{featureInfoData
								.filter((item) => item.content)
								.map((item) => renderFeatureInfo(item))}
						</View>
					</View>
				</View>
			)}
		</BottomSheet>
	);
});

FeatureInfoBottomSheet.displayName = "FeatureInfoBottomSheet";

export default FeatureInfoBottomSheet;
