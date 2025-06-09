import { useGeoData } from "./useGeoData";
import { useSearch } from "@/context/search-provider";

export const useSafeGeoData = () => {
	const { selectedCity, selectedFeatureType } = useSearch();

	const { findProcessedFeature, processedFeature, rawGeoJsonData } = useGeoData(
		{
			city: selectedCity,
			featureType: selectedFeatureType,
		},
	);

	return { findProcessedFeature, processedFeature, rawGeoJsonData };
};
