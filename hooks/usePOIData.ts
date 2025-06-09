import { useQuery } from "@tanstack/react-query";
import {
	POIItem,
	POIService,
	POIFetchOptions,
	CameraBounds,
	POICategory,
} from "@/services/poi-service";

interface UsePOIDataProps {
	city: string;
	categories?: POICategory[];
	bounds?: CameraBounds;
	zoomLevel?: number;
	enabled?: boolean;
}

// Helper function to round bounds to avoid too many cache entries
const roundBounds = (
	bounds: CameraBounds,
	precision: number = 3,
): CameraBounds => {
	return {
		ne: [
			Math.round(bounds.ne[0] * Math.pow(10, precision)) /
				Math.pow(10, precision),
			Math.round(bounds.ne[1] * Math.pow(10, precision)) /
				Math.pow(10, precision),
		],
		sw: [
			Math.round(bounds.sw[0] * Math.pow(10, precision)) /
				Math.pow(10, precision),
			Math.round(bounds.sw[1] * Math.pow(10, precision)) /
				Math.pow(10, precision),
		],
	};
};

// Helper function to create a cache key from bounds
const boundsToKey = (bounds: CameraBounds): string => {
	const rounded = roundBounds(bounds);
	return `${rounded.sw[0]},${rounded.sw[1]}-${rounded.ne[0]},${rounded.ne[1]}`;
};

export const usePOIData = ({
	city,
	categories = [POICategory.RESTAURANT, POICategory.BUS_STATION],
	bounds,
	zoomLevel = 10,
	enabled = true,
}: UsePOIDataProps) => {
	// Don't fetch if we don't have bounds or zoom level is too low
	const shouldFetch =
		enabled &&
		bounds &&
		POIService.shouldFetchPOIs(zoomLevel) &&
		categories.length > 0; // Only fetch if categories are selected

	const queryResult = useQuery({
		queryKey: [
			"pois-dynamic",
			city,
			categories.sort(),
			bounds ? boundsToKey(bounds) : null,
			Math.floor(zoomLevel), // Round zoom level to reduce cache entries
		],
		queryFn: async (): Promise<POIItem[]> => {
			if (!bounds) {
				throw new Error("Bounds are required for POI fetching");
			}

			const options: POIFetchOptions = {
				city,
				categories,
				bounds,
				zoomLevel,
			};

			return await POIService.fetchPOIsForBounds(options);
		},
		enabled: shouldFetch,
		staleTime: 1000 * 60 * 30, // 30 minutes - POIs don't change frequently
		gcTime: 1000 * 60 * 60 * 2, // 2 hours cache time
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: (failureCount, error) => {
			// Only retry on network errors, not on data errors
			if (error instanceof Error && error.message.includes("timeout")) {
				return failureCount < 2; // Retry timeouts up to 2 times
			}
			return failureCount < 1; // Retry other errors once
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
	});

	return {
		pois: queryResult.data ?? [],
		isLoading: queryResult.isLoading,
		isError: queryResult.isError,
		error: queryResult.error,
		isSuccess: queryResult.isSuccess,
		isFetching: queryResult.isFetching,
		refetch: queryResult.refetch,
		// Additional helpers
		isEmpty: queryResult.isSuccess && (queryResult.data?.length ?? 0) === 0,
		isStale: queryResult.isStale,
		shouldFetch,
		canFetchPOIs: bounds && POIService.shouldFetchPOIs(zoomLevel),
	};
};
