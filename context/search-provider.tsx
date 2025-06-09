import { CityNames } from "@/components/map/map";
import { useGeoData } from "@/hooks/useGeoData";
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
	selectedFeature: SelectedFeature;
	selectedCity: CityNames;
	selectedFeatureId: SelectedFeatureId;
	setSelectedFeatureId: (featureId: SelectedFeatureId) => void;
	clearSelection: () => void;
	selectedFeatureType: FeatureType;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
	children: ReactNode;
}

type SelectedFeatureId = string | null;

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
	const [selectedFeatureId, setSelectedFeatureId] =
		useState<SelectedFeatureId>(null);
	const [selectedFeatureType] = useState<FeatureType>(FeatureType.Neighborhood);
	const [selectedCity] = useState<CityNames>(CityNames.Istanbul);

	const { findProcessedFeature } = useGeoData({
		city: selectedCity,
		featureType: selectedFeatureType,
	});

	const selectedFeature = useMemo(() => {
		if (!selectedFeatureId) return null;

		const processedFeatureData = findProcessedFeature(selectedFeatureId);
		if (!processedFeatureData) return null;

		return processedFeatureData;
	}, [selectedFeatureId, findProcessedFeature]);

	const clearSelection = useCallback(() => {
		setSelectedFeatureId(null);
	}, []);

	const value: SearchContextType = {
		selectedFeature,
		selectedCity,
		selectedFeatureId,
		setSelectedFeatureId,
		clearSelection,
		selectedFeatureType,
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
