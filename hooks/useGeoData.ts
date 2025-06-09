import { useCallback, useMemo } from "react";
import { map, toLower, deburr } from "lodash";

import { CityGeoJson, CityNames } from "@/components/map/map";
import { FeatureType, SelectedFeature } from "@/context/search-provider";

interface UseGeoDataProps {
	city: CityNames;
	featureType: FeatureType;
}

export const useGeoData = ({ city, featureType }: UseGeoDataProps) => {
	const geoJsonData = CityGeoJson[city][featureType];
	const processedFeature: SelectedFeature[] = useMemo(() => {
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
				bbox: feature.bbox,
				type: featureType,
				properties: feature.properties,
				// Pre-processed search fields (normalized for better search)
				searchText: toLower(deburr(`${displayName} ${cityName}`)),
				originalFeature: feature,
			};
		});
	}, [featureType, geoJsonData.features]);

	const findProcessedFeature = useCallback(
		(featureId: string) => {
			return processedFeature.find((feature) => feature?.id === featureId);
		},
		[processedFeature],
	);

	return {
		processedFeature,
		findProcessedFeature,
		rawGeoJsonData: geoJsonData,
	};
};
