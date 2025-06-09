import React, { forwardRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { BottomSheet, BottomSheetRef } from "./bottom-sheet";
import { useSearch } from "@/context/search-provider";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

interface FeatureInfoBottomSheetProps {
	onClose?: () => void;
	onExpand?: () => void;
}

export const FeatureInfoBottomSheet = forwardRef<
	BottomSheetRef,
	FeatureInfoBottomSheetProps
>(({ onClose, onExpand }, ref) => {
	const { colorScheme } = useColorScheme();
	const { selectedFeature: feature } = useSearch();
	const isDark = colorScheme === "dark";

	if (!feature) return null; // TODO: Add loading state

	const handleChange = (index: number) => {
		if (index === 1) {
			onExpand?.();
		}
	};

	const iconColor = isDark
		? colors.dark.mutedForeground
		: colors.light.mutedForeground;

	return (
		<BottomSheet
			ref={ref}
			snapPoints={["35%", "85%"]}
			initialSnapIndex={0}
			onClose={onClose}
			onChange={handleChange}
			scrollable={true}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<View style={styles.headerContent}>
						<Text className="text-lg font-semibold" numberOfLines={1}>
							{feature.name}
						</Text>
						<TouchableOpacity onPress={onClose} style={styles.closeButton}>
							<MaterialIcons name="close" size={24} color={iconColor} />
						</TouchableOpacity>
					</View>
					<Text className="text-sm text-muted-foreground" numberOfLines={1}>
						{feature.place_name}
					</Text>
				</View>

				<View style={styles.content}>
					<View style={styles.infoSection}>
						<View style={styles.infoRow}>
							<MaterialIcons name="location-on" size={20} color={iconColor} />
							<View style={styles.infoTextContainer}>
								<Text className="text-sm font-medium">Type</Text>
								<Text className="text-sm text-muted-foreground capitalize">
									{feature.type}
								</Text>
							</View>
						</View>

						<View style={styles.infoRow}>
							<MaterialIcons name="place" size={20} color={iconColor} />
							<View style={styles.infoTextContainer}>
								<Text className="text-sm font-medium">Location</Text>
								<Text className="text-sm text-muted-foreground">
									{feature.center[1].toFixed(6)}, {feature.center[0].toFixed(6)}
								</Text>
							</View>
						</View>

						{feature.properties?.place_id && (
							<View style={styles.infoRow}>
								<MaterialIcons name="info" size={20} color={iconColor} />
								<View style={styles.infoTextContainer}>
									<Text className="text-sm font-medium">Place ID</Text>
									<Text className="text-sm text-muted-foreground">
										{feature.properties.place_id}
									</Text>
								</View>
							</View>
						)}
					</View>

					<View style={styles.detailsSection}>
						<Text className="text-base font-semibold mb-3">
							Additional Details
						</Text>

						{feature.properties?.address && (
							<View style={styles.addressSection}>
								<Text className="text-sm font-medium mb-2">
									Address Information
								</Text>
								{Object.entries(feature.properties.address).map(
									([key, value]) => (
										<View key={key} style={styles.addressRow}>
											<Text className="text-sm text-muted-foreground capitalize">
												{key.replace("_", " ")}:
											</Text>
											<Text className="text-sm ml-2">{String(value)}</Text>
										</View>
									),
								)}
							</View>
						)}

						<View style={styles.debugSection}>
							<Text className="text-sm font-medium mb-2">Properties</Text>
							<View style={styles.propertiesContainer}>
								{Object.entries(feature.properties || {}).map(
									([key, value]) => {
										if (key === "address") return null;
										return (
											<View key={key} style={styles.propertyRow}>
												<Text className="text-xs text-muted-foreground">
													{key}:
												</Text>
												<Text className="text-xs ml-2" numberOfLines={2}>
													{String(value)}
												</Text>
											</View>
										);
									},
								)}
							</View>
						</View>
					</View>
				</View>
			</View>
		</BottomSheet>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E5",
		marginBottom: 16,
	},
	headerContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	closeButton: {
		padding: 4,
	},
	content: {
		flex: 1,
	},
	infoSection: {
		marginBottom: 24,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 16,
		paddingHorizontal: 4,
	},
	infoTextContainer: {
		marginLeft: 12,
		flex: 1,
	},
	detailsSection: {
		paddingTop: 16,
	},
	addressSection: {
		marginBottom: 20,
		paddingHorizontal: 4,
	},
	addressRow: {
		flexDirection: "row",
		marginBottom: 4,
	},
	debugSection: {
		paddingHorizontal: 4,
	},
	propertiesContainer: {
		backgroundColor: "#F8F9FA",
		padding: 12,
		borderRadius: 8,
		maxHeight: 200,
	},
	propertyRow: {
		flexDirection: "row",
		marginBottom: 4,
		flexWrap: "wrap",
	},
});

FeatureInfoBottomSheet.displayName = "FeatureInfoBottomSheet";

export default FeatureInfoBottomSheet;
