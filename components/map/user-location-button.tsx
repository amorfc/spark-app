import React from "react";
import { Pressable, PressableProps, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ClassNameProps } from "@/types/common";
import { cn } from "@/lib/utils";

interface UserLocationButtonProps extends ClassNameProps, PressableProps {
	isLoading?: boolean;
	hasPermission?: boolean;
}

const UserLocationButton: React.FC<UserLocationButtonProps> = ({
	className,
	isLoading = false,
	hasPermission = false,
	disabled,
	...props
}) => {
	const buttonClassName = cn(
		"bg-white rounded-full p-3 shadow-lg",
		"shadow-lg shadow-black/25",
		"elevation-5",
		disabled && "opacity-50",
		className,
	);

	return (
		<Pressable
			{...props}
			className={buttonClassName}
			disabled={disabled || isLoading}
		>
			{isLoading ? (
				<ActivityIndicator size={24} color="#374151" />
			) : (
				<MaterialIcons
					name="my-location"
					size={24}
					color={hasPermission ? "#3B82F6" : "#9CA3AF"}
				/>
			)}
		</Pressable>
	);
};

export default UserLocationButton;
