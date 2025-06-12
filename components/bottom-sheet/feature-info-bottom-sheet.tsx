import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { BottomSheet, BottomSheetProps, BottomSheetRef } from "./bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

type FeatureInfoBottomSheetProps = Omit<BottomSheetProps, "children">;

export const FeatureInfoBottomSheet = forwardRef<
	BottomSheetRef,
	FeatureInfoBottomSheetProps
>(({ ...bottomSheetProps }, ref) => {
	const { colorScheme } = useColorScheme();
	const { feature, isLoading, isError } = {
		feature: {
			name: "Test",
			feature_type: "test",
			center_coordinate: {
				coordinates: [1, 1],
			},
			ref_id: 1,
		},
		isLoading: false,
		isError: false,
	};

	const isDark = colorScheme === "dark";
	const snapPoints = useMemo(() => ["16%"], []);
	const bottomSheetRef = useRef<BottomSheetRef>(null);

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
		if (isError) {
			bottomSheetRef.current?.close();
		}
	}, [isError]);

	return (
		<BottomSheet
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			initialSnapIndex={0}
			containerStyle={{ zIndex: 2000 }}
			scrollable={true}
			{...bottomSheetProps}
		>
			{isLoading && <ActivityIndicator size="large" color="#3B82F6" />}
			{feature && (
				<View className="flex-1">
					<View className="flex-1">
						<View className="pb-3 border-b border-gray-200 mb-3">
							<View className="flex-row justify-between">
								<View className="flex-1">
									<Text className="text-lg font-semibold" numberOfLines={1}>
										{feature?.name}
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

						<View className="flex-1">
							<View className="mb-6">
								<View className="flex-row items-start mb-4 px-1">
									<MaterialIcons
										name="location-on"
										size={20}
										color={iconColor}
									/>
									<View className="ml-3 flex-1">
										<Text className="text-sm font-medium">Type</Text>
										<Text className="text-sm text-muted-foreground capitalize">
											{feature.feature_type}
										</Text>
									</View>
								</View>

								<View className="flex-row items-start mb-4 px-1">
									<MaterialIcons name="place" size={20} color={iconColor} />
									<View className="ml-3 flex-1">
										<Text className="text-sm font-medium">Location</Text>
										<Text className="text-sm text-muted-foreground">
											{feature.center_coordinate?.coordinates[1]?.toFixed(6)},{" "}
											{feature.center_coordinate?.coordinates[0]?.toFixed(6)}
										</Text>
									</View>
								</View>

								{feature.ref_id && (
									<View className="flex-row items-start mb-4 px-1">
										<MaterialIcons name="info" size={20} color={iconColor} />
										<View className="ml-3 flex-1">
											<Text className="text-sm font-medium">Place ID</Text>
											<Text className="text-sm text-muted-foreground">
												{feature.ref_id}
											</Text>
										</View>
									</View>
								)}
							</View>
						</View>
					</View>
				</View>
			)}
		</BottomSheet>
	);
});

FeatureInfoBottomSheet.displayName = "FeatureInfoBottomSheet";

export default FeatureInfoBottomSheet;
