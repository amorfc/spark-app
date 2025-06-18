import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";
import { TouchableOpacity } from "react-native";

interface DeleteIconButtonProps {
	className?: string;
	onPress: () => void;
	disabled?: boolean;
}

export const DeleteIconButton = ({
	onPress,
	className,
	disabled,
}: DeleteIconButtonProps) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			className={cn(
				"w-8 h-8 bg-red-500 rounded-md flex items-center justify-center shadow-sm",
				className,
			)}
			activeOpacity={0.9}
		>
			<MaterialIcons name="delete" size={16} color="white" />
		</TouchableOpacity>
	);
};
