import { useQuery } from "@tanstack/react-query";
import { initializeMapbox } from "@/lib/mapbox";

export const useMapboxInit = () => {
	return useQuery({
		queryKey: ["mapbox-init"],
		queryFn: initializeMapbox,
		staleTime: Infinity, // Never consider the initialization stale
		gcTime: Infinity, // Never garbage collect the initialization
		retry: 3, // Retry 3 times on failure
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
	});
};
