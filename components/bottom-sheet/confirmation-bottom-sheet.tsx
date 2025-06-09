import React, { forwardRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { BottomSheet, BottomSheetRef } from "./bottom-sheet";

interface ConfirmationBottomSheetProps {
	title: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	onClose?: () => void;
	confirmButtonColor?: string;
	cancelButtonColor?: string;
	destructive?: boolean;
}

export const ConfirmationBottomSheet = forwardRef<
	BottomSheetRef,
	ConfirmationBottomSheetProps
>(
	(
		{
			title,
			message,
			confirmText = "Confirm",
			cancelText = "Cancel",
			onConfirm,
			onCancel,
			onClose,
			confirmButtonColor,
			cancelButtonColor,
			destructive = false,
		},
		ref,
	) => {
		const handleConfirm = () => {
			onConfirm?.();
			// Auto-close after confirmation
			if (ref && typeof ref === "object" && "current" in ref) {
				ref.current?.close();
			}
		};

		const handleCancel = () => {
			onCancel?.();
			// Auto-close after cancellation
			if (ref && typeof ref === "object" && "current" in ref) {
				ref.current?.close();
			}
		};

		const confirmStyle = destructive
			? styles.destructiveButton
			: confirmButtonColor
				? { backgroundColor: confirmButtonColor }
				: styles.confirmButton;

		const cancelStyle = cancelButtonColor
			? { backgroundColor: cancelButtonColor }
			: styles.cancelButton;

		return (
			<BottomSheet
				ref={ref}
				snapPoints={["40%"]}
				initialSnapIndex={0}
				enableDrag={false}
				scrollable={false}
				onClose={onClose}
			>
				<View style={styles.container}>
					<View style={styles.content}>
						<Text className="text-lg font-semibold text-center mb-4">
							{title}
						</Text>
						{message && (
							<Text className="text-base text-muted-foreground text-center mb-6">
								{message}
							</Text>
						)}
					</View>

					<View style={styles.buttonContainer}>
						<View style={[styles.button, cancelStyle]}>
							<Text
								className="text-base font-medium text-center"
								onPress={handleCancel}
								style={styles.buttonText}
							>
								{cancelText}
							</Text>
						</View>

						<View style={[styles.button, confirmStyle]}>
							<Text
								className="text-base font-medium text-center text-white"
								onPress={handleConfirm}
								style={styles.buttonText}
							>
								{confirmText}
							</Text>
						</View>
					</View>
				</View>
			</BottomSheet>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
		paddingVertical: 20,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 4,
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 12,
		paddingTop: 20,
	},
	button: {
		flex: 1,
		paddingVertical: 14,
		paddingHorizontal: 20,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	confirmButton: {
		backgroundColor: "#007AFF", // iOS blue
	},
	destructiveButton: {
		backgroundColor: "#FF3B30", // iOS red
	},
	cancelButton: {
		backgroundColor: "#F2F2F7", // iOS light gray
	},
	buttonText: {
		textAlign: "center",
	},
});

ConfirmationBottomSheet.displayName = "ConfirmationBottomSheet";

export default ConfirmationBottomSheet;
