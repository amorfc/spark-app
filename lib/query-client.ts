import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Cache POI data for 1 hour (3600000 ms)
			staleTime: 1000 * 60 * 60, // 1 hour
			gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			refetchOnWindowFocus: false,
			refetchOnMount: false, // Don't refetch on mount if data exists
			refetchOnReconnect: true, // Refetch when internet connection is restored
		},
		mutations: {
			retry: 1,
		},
	},
});

// Query Keys Factory
export const queryKeys = {
	pois: ["pois"] as const,
	poisByCity: (city: string) => [...queryKeys.pois, city] as const,
	poisByCityAndTypes: (city: string, types: string[]) =>
		[...queryKeys.poisByCity(city), "types", types.sort()] as const,
} as const;
