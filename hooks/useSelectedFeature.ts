import { useSearch } from "@/context/search-provider";
import { useOSMFeatureByRefId } from "@/hooks/useOsmData";

export const useSelectedFeature = () => {
	const { selectedFeatureId } = useSearch();
	const {
		data: feature,
		isLoading,
		isError,
	} = useOSMFeatureByRefId(selectedFeatureId);

	return {
		feature,
		isLoading,
		isError,
	};
};
