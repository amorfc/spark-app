import { useMapSearch } from "@/hooks/useMapSearch";
import { OverpassApiService } from "@/services/overpass-service";
import { useQuery } from "@tanstack/react-query";

export const useAmenities = () => {
	const { country, city, district, categoryGroups } = useMapSearch();
	const enabled =
		!!country && !!city && !!district?.properties?.name && !!categoryGroups;
	return useQuery({
		queryKey: ["amenities", country, city, district, categoryGroups],
		queryFn: () =>
			OverpassApiService.fetchAmenities({
				country,
				city,
				district: district?.properties?.name || "none",
				category: "public_transports",
			}),
		enabled,
	});
};
