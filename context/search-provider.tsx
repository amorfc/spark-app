import { CityNames } from "@/components/map/map";
import { SearchType } from "@/components/select/filter-search-type-select";
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
	useMemo,
} from "react";

// Import the SelectedFeature type from index.tsx
export interface NeighborhoodResult {
	id: string;
	name: string;
	place_name: string;
	center: [number, number];
	polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
	bbox?: number[]; // Add bbox for area calculation
}

export enum FeatureType {
	Neighborhood = "neighborhood",
	District = "district",
}

export type NeigborhoodFeature = NeighborhoodResult & {
	type: FeatureType.Neighborhood | FeatureType.District;
	properties: any;
	originalFeature: GeoJSON.Feature<GeoJSON.Geometry>;
};

export type SelectedFeature = NeigborhoodFeature | null;

interface SearchContextType {
	selectedCity: CityNames;
	selectedCountry: string;
	selectedFeatureId: SelectedFeatureId;
	setSelectedFeatureId: (featureId: SelectedFeatureId) => void;
	searchType: SearchType;
	setSearchType: (searchType: SearchType) => void;
	clearSelection: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
	children: ReactNode;
}

export type SelectedFeatureId = number | null;

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
	const [selectedFeatureId, setSelectedFeatureId] =
		useState<SelectedFeatureId>(null);
	const [searchType, setSearchType] = useState<SearchType>(SearchType.DISTRICT);
	const [selectedCity] = useState<CityNames>(CityNames.Istanbul);

	const clearSelection = useCallback(() => {
		setSelectedFeatureId(null);
	}, []);

	const value: SearchContextType = {
		selectedCity,
		selectedCountry: "Turkey",
		selectedFeatureId,
		setSelectedFeatureId,
		clearSelection,
		searchType,
		setSearchType,
	};

	return (
		<SearchContext.Provider value={value}>{children}</SearchContext.Provider>
	);
};

export const useSearch = (): SearchContextType => {
	const context = useContext(SearchContext);
	if (context === undefined) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
};
