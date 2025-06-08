import { useGeoData } from "@/hooks/useGeoData";
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
	useMemo,
} from "react";
import neighborhoodsDataRaw from "@/assets/geo/istanbul/neigborhoods.json";

const neighborhoodsData = neighborhoodsDataRaw as GeoJSON.FeatureCollection;

// Import the SelectedFeature type from index.tsx
export interface NeighborhoodResult {
	id: string;
	name: string;
	place_name: string;
	center: [number, number];
	polygon?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
	bbox?: number[]; // Add bbox for area calculation
}

export type NeigborhoodFeature = NeighborhoodResult & {
	type: "neighborhood";
	properties: any;
};

export type SelectedFeature = NeigborhoodFeature | null;

interface SearchContextType {
	selectedFeature: SelectedFeature;
	selectedFeatureId: string | null;
	setSelectedFeatureId: (featureId: string | null) => void;
	clearSelection: () => void;
	isFeatureSelected: (featureId: string) => boolean;
}

const test = {
	type: "Feature",
	properties: {
		place_id: 236482591,
		osm_type: "relation",
		osm_id: 8894398,
		display_name:
			"Ağva Merkez Mahallesi, İstanbul, Marmara Bölgesi, 34990, Türkiye",
		place_rank: 16,
		category: "boundary",
		type: "administrative",
		importance: 0.23729383463160691,
		address: {
			suburb: "Ağva Merkez Mahallesi",
			province: "İstanbul",
			region: "Marmara Bölgesi",
			postcode: "34990",
			country: "Türkiye",
			country_code: "tr",
		},
	},
	bbox: [29.8397874, 41.1243772, 29.8613867, 41.1409496],
	geometry: {
		type: "Polygon",
		coordinates: [
			[
				[29.8397874, 41.1332143],
				[29.8399103, 41.1326719],
				[29.8407745, 41.1314906],
				[29.8415756, 41.1305985],
				[29.8425112, 41.1298131],
				[29.8437307, 41.1289163],
				[29.8458043, 41.1281002],
				[29.8492241, 41.1257603],
				[29.8493862, 41.1255551],
				[29.8494713, 41.1252121],
				[29.8492976, 41.1243772],
				[29.8497826, 41.1244064],
				[29.8500753, 41.124548],
				[29.8501677, 41.1247081],
				[29.8504943, 41.1248172],
				[29.8526165, 41.1270551],
				[29.8535123, 41.1274753],
				[29.8544887, 41.1277662],
				[29.8548654, 41.1277993],
				[29.8555158, 41.1279034],
				[29.8551023, 41.1282254],
				[29.8543445, 41.1289262],
				[29.8539871, 41.1296502],
				[29.8539809, 41.1304205],
				[29.854671, 41.131228],
				[29.8563715, 41.1331121],
				[29.8580782, 41.1341191],
				[29.8609616, 41.1353302],
				[29.8613867, 41.1359984],
				[29.8611156, 41.1370471],
				[29.859027, 41.1390378],
				[29.8575483, 41.1394368],
				[29.8564578, 41.1394368],
				[29.8553526, 41.1394668],
				[29.8553413, 41.1393114],
				[29.8549742, 41.1392924],
				[29.8546226, 41.1393303],
				[29.8535819, 41.1397315],
				[29.8534369, 41.1395573],
				[29.8514073, 41.1409496],
				[29.8512264, 41.1408815],
				[29.8512264, 41.140768],
				[29.8519287, 41.1402935],
				[29.8518154, 41.1399736],
				[29.8515606, 41.1397284],
				[29.851051, 41.1394299],
				[29.8504705, 41.139174],
				[29.849791, 41.1389288],
				[29.8493805, 41.1389288],
				[29.8488, 41.1389714],
				[29.8481771, 41.1389928],
				[29.8476392, 41.1389928],
				[29.8473772, 41.1387225],
				[29.8467578, 41.1384004],
				[29.846321, 41.1381634],
				[29.8445877, 41.1382328],
				[29.8435633, 41.137945],
				[29.8427404, 41.1371343],
				[29.8409955, 41.1353393],
				[29.8401022, 41.1343953],
				[29.8398166, 41.1337007],
				[29.8397874, 41.1332143],
			],
		],
	},
};

const debugTestFeature: SelectedFeature = {
	id: "236482591",
	name: "Ağva Merkez Mahallesi",
	place_name:
		"Ağva Merkez Mahallesi, İstanbul, Marmara Bölgesi, 34990, Türkiye",
	center: [
		(29.8397874 + 29.8613867) / 2, // 29.85058705
		(41.1243772 + 41.1409496) / 2, // 41.1326634
	] as [number, number],
	type: "neighborhood" as const,
	properties: {},
	polygon: test.geometry as GeoJSON.Polygon,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
	children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
	const { processedFeature, findProcessedFeature } = useGeoData({
		city: "istanbul",
		geoJsonData: neighborhoodsData,
	});

	const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
		null,
	);

	// Derive selectedFeature from selectedFeatureId using useMemo
	const selectedFeature = useMemo(() => {
		if (!selectedFeatureId) return null;

		const processedFeatureData = findProcessedFeature(selectedFeatureId);
		if (!processedFeatureData) return null;

		return {
			id: processedFeatureData.id,
			name: processedFeatureData.name,
			place_name: processedFeatureData.place_name,
			center: processedFeatureData.center,
			type: "neighborhood" as const,
			properties: {},
			polygon: processedFeatureData.polygon,
			bbox: processedFeatureData.originalFeature?.bbox,
		};
	}, [selectedFeatureId, findProcessedFeature]);

	const clearSelection = useCallback(() => {
		setSelectedFeatureId(null);
	}, []);

	const isFeatureSelected = useCallback(
		(featureId: string) => {
			return selectedFeatureId === featureId;
		},
		[selectedFeatureId],
	);

	const value: SearchContextType = {
		selectedFeature,
		selectedFeatureId,
		setSelectedFeatureId,
		clearSelection,
		isFeatureSelected,
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
