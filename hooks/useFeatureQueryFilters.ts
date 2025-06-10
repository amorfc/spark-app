import { useSearch } from "@/context/search-provider";
import { SearchFilters } from "@/types/osm";

export const useFeatureQueryFilters = (): SearchFilters => {
	const { selectedCity, selectedCountry } = useSearch();

	return {
		city: selectedCity,
		country: selectedCountry,
	};
};
