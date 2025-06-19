import React, {
	useCallback,
	useRef,
	useMemo,
	forwardRef,
	useImperativeHandle,
} from "react";
import { StyleSheet } from "react-native";
import BottomSheetLib, {
	BottomSheetView,
	BottomSheetProps as RNBottomSheetProps,
	BottomSheetScrollView,
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { colors } from "@/constants/colors";

export interface BottomSheetRef {
	snapToIndex: (index: number) => void;
	close: () => void;
	expand: () => void;
	collapse: () => void;
}

export interface BottomSheetProps extends RNBottomSheetProps {
	children: React.ReactNode;
	scrollable?: boolean;
	showBackdrop?: boolean;
	backdropPressBehavior?: "none" | "close" | "collapse";
	onClose?: () => void;
	onChange?: (index: number) => void;
	onAnimate?: () => void;
	backgroundStyle?: any;
	handleIndicatorStyle?: any;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
	(
		{
			children,
			scrollable = true,
			showBackdrop = true,
			backdropPressBehavior: pressBehavior = "none",
			onClose,
			onChange,
			onAnimate,
			backgroundStyle,
			handleIndicatorStyle,
			...props
		},
		ref,
	) => {
		const bottomSheetRef = useRef<BottomSheetLib>(null);

		const renderBackdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					pressBehavior={pressBehavior}
				/>
			),
			[pressBehavior],
		);

		const handleSheetChanges = useCallback(
			(index: number) => {
				onChange?.(index);
				if (index === -1) {
					onClose?.();
				}
			},
			[onChange, onClose],
		);

		const snapToIndex = useCallback((index: number) => {
			bottomSheetRef.current?.snapToIndex(index);
		}, []);

		const close = useCallback(() => {
			bottomSheetRef.current?.close();
		}, []);

		const expand = useCallback(() => {
			bottomSheetRef.current?.expand();
		}, []);

		const collapse = useCallback(() => {
			bottomSheetRef.current?.collapse();
		}, []);

		// Expose methods via ref
		useImperativeHandle(
			ref,
			() => ({
				snapToIndex,
				close,
				expand,
				collapse,
			}),
			[snapToIndex, close, expand, collapse],
		);

		// Dynamic styles based on theme
		const dynamicBackgroundStyle = useMemo(
			() => ({
				backgroundColor: colors.light.card,
				...backgroundStyle,
			}),
			[backgroundStyle],
		);

		const dynamicHandleIndicatorStyle = useMemo(
			() => ({
				backgroundColor: colors.light.mutedForeground,
				...handleIndicatorStyle,
			}),
			[handleIndicatorStyle],
		);

		// Choose the appropriate content container
		const ContentContainer = scrollable
			? BottomSheetScrollView
			: BottomSheetView;

		return (
			<BottomSheetLib
				ref={bottomSheetRef}
				{...props}
				onChange={handleSheetChanges}
				backgroundStyle={dynamicBackgroundStyle}
				handleIndicatorStyle={dynamicHandleIndicatorStyle}
				keyboardBehavior="extend"
				keyboardBlurBehavior="restore"
				android_keyboardInputMode="adjustResize"
				enableHandlePanningGesture={true}
				enableContentPanningGesture={true}
				backdropComponent={showBackdrop ? renderBackdrop : undefined}
			>
				<ContentContainer
					style={styles.contentContainer}
					contentContainerStyle={
						scrollable ? styles.scrollContentContainer : undefined
					}
				>
					{children}
				</ContentContainer>
			</BottomSheetLib>
		);
	},
);

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		paddingHorizontal: 16,
	},
	scrollContentContainer: {
		flexGrow: 1,
		paddingBottom: 20,
	},
});

BottomSheet.displayName = "BottomSheet";

export default BottomSheet;
