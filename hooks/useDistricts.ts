import { useMapSearch } from "@/hooks/useMapSearch";
import { OverpassApiService } from "@/services/overpass-service";
import { useQuery } from "@tanstack/react-query";

export const useDistricts = () => {
	const { country, city } = useMapSearch();

	return useQuery({
		queryKey: ["districts", country, city],
		queryFn: () => OverpassApiService.fetchDistricts({ country, city }),
	});
};
