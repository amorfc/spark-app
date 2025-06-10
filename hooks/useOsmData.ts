import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { OSMService } from "@/services/osm-service";
import {
	BoundingBox,
	SearchFilters,
	OSMFeature,
	FeatureType,
} from "@/types/osm";
import { useFeatureQueryFilters } from "@/hooks/useFeatureQueryFilters";

export const useOSMFeatures = ({
	featureType,
	searchText,
	districtRefId,
	...options
}: {
	featureType: FeatureType;
	searchText?: string;
	districtRefId?: number;
} & Omit<UseQueryOptions<OSMFeature[]>, "queryKey" | "queryFn">) => {
	return useQuery({
		queryKey: ["osm-features", featureType, searchText, districtRefId],
		queryFn: async () => {
			// Conditional logic based on feature type
			if (featureType === "district") {
				return OSMService.getDistricts(searchText);
			}

			if (featureType === "neighborhood") {
				return OSMService.getNeighborhoods();
			}

			// For other types, use searchByBoundingBox with feature type filter
			// You can customize this bbox or make it a parameter
			const defaultBbox = { north: 42, south: 40, east: 30, west: 28 }; // Istanbul area
			return OSMService.searchByBoundingBox(defaultBbox, {
				feature_types: [featureType],
				search_text: searchText,
				limit: 1000,
			});
		},
		enabled: !!featureType,
		staleTime: 10 * 60 * 1000, // 10 minutes for static data
		...options,
	});
};

/**
 * Hook for filtered map data by search type
 */
export const useOSMMapData = (
	searchType: FeatureType,
	options?: Omit<UseQueryOptions<any>, "queryKey" | "queryFn">,
) => {
	return useQuery({
		queryKey: ["osm-map-data", searchType],
		queryFn: () => OSMService.getMapDataByType(searchType),
		enabled: !!searchType,
		staleTime: Infinity,
		...options,
	});
};

export const useOSMBoundingBoxSearch = (
	bbox: BoundingBox,
	filters?: Omit<SearchFilters, "bbox">,
	options?: UseQueryOptions<OSMFeature[]>,
) => {
	const defaultFilters = useFeatureQueryFilters();
	return useQuery({
		queryKey: ["osm-bbox", bbox, filters],
		queryFn: () => OSMService.searchByBoundingBox(bbox, filters),
		enabled: !!bbox,
		staleTime: 5 * 60 * 1000, // 5 minutes
		...defaultFilters,
		...options,
	});
};

export const useOSMFullTextSearch = (
	searchText: string,
	bbox?: BoundingBox,
	featureTypes?: FeatureType[],
	limit = 50,
	options?: UseQueryOptions<OSMFeature[]>,
) => {
	const defaultFilters = useFeatureQueryFilters();

	return useQuery({
		queryKey: ["osm-search", searchText, bbox, featureTypes, limit],
		queryFn: () =>
			OSMService.fullTextSearch(searchText, bbox, featureTypes, limit),
		enabled: searchText.length > 2,
		staleTime: 5 * 60 * 1000,
		...defaultFilters,
		...options,
	});
};

export const useOSMNearbySearch = (
	lat: number,
	lng: number,
	radiusMeters: number,
	featureTypes?: FeatureType[],
	limit = 20,
	options?: UseQueryOptions<OSMFeature[]>,
) => {
	const defaultFilters = useFeatureQueryFilters();

	return useQuery({
		queryKey: ["osm-nearby", lat, lng, radiusMeters, featureTypes, limit],
		queryFn: () =>
			OSMService.findNearby(lat, lng, radiusMeters, featureTypes, limit),
		enabled: !!(lat && lng),
		staleTime: 5 * 60 * 1000,
		...defaultFilters,
		...options,
	});
};

export const useOSMDistricts = (
	searchText?: string,
	options?: UseQueryOptions<OSMFeature[]>,
) => {
	const defaultFilters = useFeatureQueryFilters();

	return useQuery({
		queryKey: ["osm-districts", searchText],
		queryFn: () => OSMService.getDistricts(searchText),
		staleTime: 10 * 60 * 1000, // 10 minutes - districts don't change often
		...defaultFilters,
		...options,
	});
};

export const useOSMNeighborhoods = (
	options?: UseQueryOptions<OSMFeature[]>,
) => {
	const defaultFilters = useFeatureQueryFilters();

	return useQuery({
		queryKey: ["osm-neighborhoods"],
		queryFn: () => OSMService.getNeighborhoods(),
		staleTime: 10 * 60 * 1000,
		...defaultFilters,
		...options,
	});
};

export const useOSMTransportationStops = (
	bbox: BoundingBox,
	options?: UseQueryOptions<OSMFeature[]>,
) => {
	const defaultFilters = useFeatureQueryFilters();

	return useQuery({
		queryKey: ["osm-transport", bbox],
		queryFn: () => OSMService.getTransportationStops(bbox),
		enabled: !!bbox,
		staleTime: 5 * 60 * 1000,
		...defaultFilters,
		...options,
	});
};

export const useOSMFeatureByRefId = (
	refId: number | null,
	options?: UseQueryOptions<OSMFeature | null>,
) => {
	return useQuery({
		queryKey: ["osm-feature-by-ref", refId],
		queryFn: () => OSMService.getFeatureByRefId(refId!),
		enabled: !!refId,
		staleTime: Infinity, // Feature details don't change
		...options,
	});
};
