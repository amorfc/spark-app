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
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export interface BottomSheetRef {
	snapToIndex: (index: number) => void;
	close: () => void;
	expand: () => void;
	collapse: () => void;
}

interface BottomSheetProps {
	children: React.ReactNode;
	snapPoints?: (string | number)[];
	initialSnapIndex?: number;
	enablePanDownToClose?: boolean;
	enableDrag?: boolean;
	scrollable?: boolean;
	onClose?: () => void;
	onChange?: (index: number) => void;
	backgroundStyle?: any;
	handleIndicatorStyle?: any;
	containerStyle?: any;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
	(
		{
			children,
			snapPoints = ["30%", "90%"],
			initialSnapIndex = 0,
			enablePanDownToClose = true,
			enableDrag = true,
			scrollable = true,
			onClose,
			onChange,
			backgroundStyle,
			handleIndicatorStyle,
			containerStyle,
		},
		ref,
	) => {
		const { colorScheme } = useColorScheme();
		const bottomSheetRef = useRef<BottomSheetLib>(null);
		const isDark = colorScheme === "dark";

		// Memoize snap points to prevent unnecessary re-renders
		const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

		// Callbacks
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
				backgroundColor: isDark ? colors.dark.card : colors.light.card,
				...backgroundStyle,
			}),
			[isDark, backgroundStyle],
		);

		const dynamicHandleIndicatorStyle = useMemo(
			() => ({
				backgroundColor: isDark
					? colors.dark.mutedForeground
					: colors.light.mutedForeground,
				...handleIndicatorStyle,
			}),
			[isDark, handleIndicatorStyle],
		);

		// Choose the appropriate content container
		const ContentContainer = scrollable
			? BottomSheetScrollView
			: BottomSheetView;

		return (
			<BottomSheetLib
				ref={bottomSheetRef}
				index={initialSnapIndex}
				snapPoints={memoizedSnapPoints}
				onChange={handleSheetChanges}
				enablePanDownToClose={enablePanDownToClose}
				enableHandlePanningGesture={enableDrag}
				enableContentPanningGesture={enableDrag}
				backgroundStyle={dynamicBackgroundStyle}
				handleIndicatorStyle={dynamicHandleIndicatorStyle}
				style={containerStyle}
				keyboardBehavior="extend"
				keyboardBlurBehavior="restore"
				android_keyboardInputMode="adjustResize"
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
