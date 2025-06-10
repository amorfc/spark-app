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
import { useSelectedFeature } from "@/hooks/useSelectedFeature";

type FeatureInfoBottomSheetProps = Omit<BottomSheetProps, "children">;

export const FeatureInfoBottomSheet = forwardRef<
	BottomSheetRef,
	FeatureInfoBottomSheetProps
>(({ ...bottomSheetProps }, ref) => {
	const { colorScheme } = useColorScheme();
	const { feature, isLoading, isError } = useSelectedFeature();

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
										{feature.name}
									</Text>
									<Text
										className="text-sm text-muted-foreground"
										numberOfLines={1}
									>
										{feature.name}
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

							<View className="pt-4">
								<Text className="text-base font-semibold mb-3">
									Additional Details
								</Text>

								{feature.full_address && (
									<View className="mb-5 px-1">
										<Text className="text-sm font-medium mb-2">
											Address Information
										</Text>
										{Object.entries(feature.full_address).map(
											([key, value]) => (
												<View key={key} className="flex-row mb-1">
													<Text className="text-sm text-muted-foreground capitalize">
														{key.replace("_", " ")}:
													</Text>
													<Text className="text-sm ml-2">{String(value)}</Text>
												</View>
											),
										)}
									</View>
								)}

								<View className="px-1">
									<Text className="text-sm font-medium mb-2">Properties</Text>
									<View className="bg-gray-50 p-3 rounded-lg max-h-48">
										{Object.entries(feature || {}).map(([key, value]) => {
											if (key === "address") return null;
											return (
												<View key={key} className="flex-row mb-1 flex-wrap">
													<Text className="text-xs text-muted-foreground">
														{key}:
													</Text>
													<Text className="text-xs ml-2" numberOfLines={2}>
														{String(value)}
													</Text>
												</View>
											);
										})}
									</View>
								</View>
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
