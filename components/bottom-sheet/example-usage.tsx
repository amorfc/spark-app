import React, { useRef } from "react";
import { View, Button, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import {
	BottomSheet,
	BottomSheetRef,
	ConfirmationBottomSheet,
	FeatureInfoBottomSheet,
} from "@/components/bottom-sheet";
import { useSearch } from "@/context/search-provider";

// Example usage of the BottomSheet components
export const BottomSheetExamples = () => {
	const basicSheetRef = useRef<BottomSheetRef>(null);
	const confirmationSheetRef = useRef<BottomSheetRef>(null);
	const featureSheetRef = useRef<BottomSheetRef>(null);

	const { selectedFeature } = useSearch();

	return (
		<View style={styles.container}>
			{/* Trigger buttons */}
			<Button
				title="Open Basic Bottom Sheet"
				onPress={() => basicSheetRef.current?.snapToIndex(0)}
			/>
			<Button
				title="Open Confirmation Sheet"
				onPress={() => confirmationSheetRef.current?.snapToIndex(0)}
			/>
			<Button
				title="Open Feature Info Sheet"
				onPress={() => featureSheetRef.current?.snapToIndex(0)}
			/>

			{/* Basic BottomSheet */}
			<BottomSheet
				ref={basicSheetRef}
				snapPoints={["30%", "90%"]}
				initialSnapIndex={-1} // Start closed
				onClose={() => console.log("Basic sheet closed")}
			>
				<View style={styles.content}>
					<Text className="text-lg font-bold mb-4">Basic Bottom Sheet</Text>
					<Text className="text-base mb-4">
						This is a scrollable bottom sheet that can be dragged to expand.
					</Text>
					<Text className="text-sm text-muted-foreground">
						Scroll me when expanded! This content can be very long and will
						scroll properly within the sheet.
					</Text>
					{/* Add more content to demonstrate scrolling */}
					{Array.from({ length: 20 }, (_, i) => (
						<Text key={i} className="text-base p-2 border-b border-gray-200">
							Item {i + 1}
						</Text>
					))}
				</View>
			</BottomSheet>

			{/* Confirmation BottomSheet */}
			<ConfirmationBottomSheet
				ref={confirmationSheetRef}
				title="Delete Item"
				message="Are you sure you want to delete this item? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				destructive={true}
				onConfirm={() => console.log("Confirmed!")}
				onCancel={() => console.log("Cancelled!")}
				onClose={() => console.log("Confirmation sheet closed")}
			/>

			{/* Feature Info BottomSheet */}
			<FeatureInfoBottomSheet
				ref={featureSheetRef}
				feature={selectedFeature}
				onClose={() => console.log("Feature sheet closed")}
				onExpand={() => console.log("Feature sheet expanded")}
			/>
		</View>
	);
};

// Example of non-draggable bottom sheet
export const NonDraggableBottomSheetExample = () => {
	const sheetRef = useRef<BottomSheetRef>(null);

	return (
		<View style={styles.container}>
			<Button
				title="Open Non-draggable Sheet"
				onPress={() => sheetRef.current?.snapToIndex(0)}
			/>

			<BottomSheet
				ref={sheetRef}
				snapPoints={["50%"]}
				initialSnapIndex={-1}
				enableDrag={false} // Disable dragging
				enablePanDownToClose={false} // Disable pan to close
			>
				<View style={styles.content}>
					<Text className="text-lg font-bold mb-4">Non-draggable Sheet</Text>
					<Text className="text-base mb-4">
						This sheet cannot be dragged. It&apos;s perfect for modal-like
						interactions.
					</Text>
					<Button
						title="Close Sheet"
						onPress={() => sheetRef.current?.close()}
					/>
				</View>
			</BottomSheet>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 16,
	},
	content: {
		flex: 1,
		padding: 20,
	},
});

// Usage in map screen (example integration)
export const MapScreenBottomSheetIntegration = () => {
	const featureSheetRef = useRef<BottomSheetRef>(null);
	const { selectedFeature, clearSelection } = useSearch();

	// When feature is selected, show bottom sheet
	React.useEffect(() => {
		if (selectedFeature) {
			featureSheetRef.current?.snapToIndex(0);
		}
	}, [selectedFeature]);

	const handleCloseFeatureSheet = () => {
		clearSelection();
		featureSheetRef.current?.close();
	};

	return (
		<View style={styles.container}>
			{/* Your map component would go here */}
			<Text>Map Component</Text>

			{/* Feature Info Bottom Sheet */}
			<FeatureInfoBottomSheet
				ref={featureSheetRef}
				feature={selectedFeature}
				onClose={handleCloseFeatureSheet}
				onExpand={() => console.log("Feature details expanded")}
			/>
		</View>
	);
};
