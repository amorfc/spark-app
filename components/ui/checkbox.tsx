import * as React from "react";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/lib/useColorScheme";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

// Define our own types since we don't have the actual package
interface CheckboxRootProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
}

type CheckboxRootRef = React.RefObject<View>;

interface CheckboxProps extends CheckboxRootProps {
	label?: string;
	labelClassName?: string;
	renderLabel?: () => React.ReactNode;
}

// Create mock components until we have the actual package
const CheckboxPrimitive = {
	Root: React.forwardRef<View, CheckboxRootProps>(
		({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
			<View
				ref={ref}
				className={className}
				accessibilityRole="checkbox"
				accessibilityState={{ checked, disabled }}
				{...props}
			/>
		),
	),
	Indicator: React.forwardRef<View, { children: React.ReactNode }>(
		({ children }, ref) => <View ref={ref}>{children}</View>,
	),
};

// Add display names
CheckboxPrimitive.Root.displayName = "CheckboxRoot";
CheckboxPrimitive.Indicator.displayName = "CheckboxIndicator";

const Checkbox = React.forwardRef<View, CheckboxProps>(
	({ className, label, labelClassName, renderLabel, ...props }, ref) => {
		const { colorScheme } = useColorScheme();
		const isDark = colorScheme === "dark";

		return (
			<View className="flex-row items-center gap-2">
				<View
					ref={ref}
					className={cn(
						"h-5 w-5 rounded border border-foreground justify-center items-center",
						props.checked ? "bg-primary" : "bg-background",
						props.disabled && "opacity-50",
						className,
					)}
					accessibilityRole="checkbox"
					accessibilityState={{
						checked: props.checked,
						disabled: props.disabled,
					}}
					onTouchEnd={() =>
						!props.disabled && props.onCheckedChange(!props.checked)
					}
				>
					{props.checked && (
						<MaterialIcons
							name="check"
							size={16}
							color={isDark ? "#000" : "#fff"}
						/>
					)}
				</View>
				{renderLabel ? (
					renderLabel()
				) : (
					<Text className={cn("text-sm text-foreground", labelClassName)}>
						{label}
					</Text>
				)}
			</View>
		);
	},
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
