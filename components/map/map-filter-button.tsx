import { Pressable, PressableProps, Text } from "react-native";
import { ClassNameProps } from "@/types/common";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSearchFilterMetadata } from "@/hooks/useSearchFilterMetadata";
import { cn } from "@/lib/utils";

interface MapFilterButtonProps extends ClassNameProps, PressableProps {}

const MapFilterButton = ({ className, ...props }: MapFilterButtonProps) => {
	const { activeFilterCount } = useSearchFilterMetadata();

	const buttonClassName = cn([
		"bg-white rounded-full p-3 shadow-lg",
		"shadow-lg shadow-black/25",
		"elevation-5",
		className,
	]);
	return (
		<Pressable {...props} className={buttonClassName}>
			<AntDesign name="filter" size={24} color="#374151" />
			{activeFilterCount > 0 && (
				<Text className="absolute -top-3 -right-2 bg-red-500 text-white rounded-full text-md px-2 py-1 overflow-hidden">
					{activeFilterCount}
				</Text>
			)}
		</Pressable>
	);
};

export default MapFilterButton;
