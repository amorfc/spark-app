import { useCallback, useMemo } from "react";
import { map, toLower, deburr } from "lodash";

interface UseGeoDataProps {
	city: string;
	geoJsonData?: GeoJSON.FeatureCollection;
}

export const useGeoData = ({ city, geoJsonData }: UseGeoDataProps) => {
	// Pre-process and memoize neighborhood data for better search performance
	const processedFeature = useMemo(() => {
		if (!geoJsonData?.features) return [];

		return map(geoJsonData.features, (feature: any) => {
			const displayName = feature.properties.display_name || "";
			const cityName = feature.properties.address?.city || "";

			return {
				id: feature.properties.place_id?.toString() || "",
				name: cityName || displayName.split(",")[0] || "Unknown",
				place_name: displayName,
				center: [
					(feature.bbox[0] + feature.bbox[2]) / 2,
					(feature.bbox[1] + feature.bbox[3]) / 2,
				] as [number, number],
				polygon: feature.geometry,
				// Pre-processed search fields (normalized for better search)
				searchText: toLower(deburr(`${displayName} ${cityName}`)),
				originalFeature: feature,
			};
		});
	}, [geoJsonData]);

	// Convert to dropdown picker format
	const dropdownItems = useMemo(() => {
		return processedFeature.map((neighborhood) => ({
			label: neighborhood.place_name,
			value: neighborhood.id,
			...neighborhood, // Include all neighborhood data for easy access
		}));
	}, [processedFeature]);

	const findProcessedFeature = useCallback(
		(featureId: string) => {
			return processedFeature.find((feature) => feature.id === featureId);
		},
		[processedFeature],
	);

	return {
		processedFeature,
		dropdownItems,
		findProcessedFeature,
	};
};
