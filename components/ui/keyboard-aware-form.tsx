import React from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableWithoutFeedback,
	Keyboard,
	ViewStyle,
} from "react-native";
import { cn } from "@/lib/utils";

interface KeyboardAwareFormProps {
	children: React.ReactNode;
	extraScrollHeight?: number;
	contentContainerStyle?: ViewStyle;
	className?: string;
	keyboardVerticalOffset?: number;
	behavior?: "padding" | "height" | "position";
	enableOnAndroid?: boolean;
	showsVerticalScrollIndicator?: boolean;
	keyboardShouldPersistTaps?: "always" | "never" | "handled";
}

const KeyboardAwareForm = React.forwardRef<
	React.ComponentRef<typeof ScrollView>,
	KeyboardAwareFormProps
>(
	(
		{
			children,
			extraScrollHeight = 100,
			contentContainerStyle,
			className,
			keyboardVerticalOffset = 0,
			behavior = Platform.OS === "ios" ? "padding" : "height",
			enableOnAndroid = true,
			showsVerticalScrollIndicator = false,
			keyboardShouldPersistTaps = "handled",
			...props
		},
		ref,
	) => {
		const keyboardBehavior =
			Platform.OS === "ios" ? behavior : enableOnAndroid ? behavior : undefined;

		return (
			<KeyboardAvoidingView
				behavior={keyboardBehavior}
				className="flex-1"
				keyboardVerticalOffset={keyboardVerticalOffset || extraScrollHeight}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
					<ScrollView
						ref={ref}
						contentContainerStyle={[
							{
								padding: 16,
								flexGrow: 1,
							},
							contentContainerStyle,
						]}
						className={cn("flex-1", className)}
						keyboardShouldPersistTaps={keyboardShouldPersistTaps}
						showsVerticalScrollIndicator={showsVerticalScrollIndicator}
						{...props}
					>
						{children}
					</ScrollView>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		);
	},
);

KeyboardAwareForm.displayName = "KeyboardAwareForm";

export { KeyboardAwareForm };
export type { KeyboardAwareFormProps };
