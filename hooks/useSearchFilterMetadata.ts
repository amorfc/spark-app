import { useMapSearch } from "@/hooks/useMapSearch";
import { useMemo } from "react";

export const useSearchFilterMetadata = () => {
	const { district, categoryGroups } = useMapSearch();

	const activeFilterCount = useMemo(() => {
		return categoryGroups.length + (district ? 1 : 0);
	}, [district, categoryGroups]);

	return {
		activeFilterCount,
	};
};
