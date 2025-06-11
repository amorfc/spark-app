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
	const defaultFilters = useFeatureQueryFilters();

	return useQuery({
		queryKey: [
			"osm-features",
			featureType,
			searchText,
			districtRefId,
			defaultFilters,
		],
		queryFn: async () => {
			// Conditional logic based on feature type
			if (featureType === "district") {
				return OSMService.getDistricts(defaultFilters, searchText);
			}

			if (featureType === "neighborhood") {
				return OSMService.getNeighborhoods({});
			}

			// For other types, use searchByBoundingBox with feature type filter
			// You can customize this bbox or make it a parameter
			const defaultBbox = { north: 42, south: 40, east: 30, west: 28 }; // Istanbul area
			return OSMService.searchByBoundingBox(defaultBbox, {
				...defaultFilters,
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

export const useOSMBoundingBoxSearch = (
	bbox: BoundingBox,
	filters?: Omit<SearchFilters, "bbox">,
	options?: Omit<UseQueryOptions<any>, "queryKey" | "queryFn">,
) => {
	const defaultFilters = useFeatureQueryFilters();
	const mergedFilters = {
		...defaultFilters,
		...filters,
	};
	const key = JSON.stringify(bbox) + JSON.stringify(mergedFilters);

	return useQuery({
		queryKey: ["osm-bbox", key],
		queryFn: () => OSMService.searchByBoundingBox(bbox, mergedFilters),
		enabled: !!bbox,
		staleTime: 5 * 60 * 1000, // 5 minutes
		// keepPreviousData: true
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
		queryKey: [
			"osm-search",
			searchText,
			bbox,
			featureTypes,
			limit,
			defaultFilters,
		],
		queryFn: () =>
			OSMService.fullTextSearch(
				searchText,
				bbox,
				featureTypes,
				limit,
				defaultFilters,
			),
		enabled: searchText.length > 2,
		staleTime: 5 * 60 * 1000,
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
