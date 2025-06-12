import { POICategoryDefinition } from "@/services/poi-service";
import { useAppDispatch, useAppSelector } from "@/store/index";
import {
	resetMapState,
	setDistrict,
	setMapLoading,
	setCategoryGroups,
	setSelectedFeature,
} from "@/store/slices/mapSearchSlice";

export const useMapSearch = () => {
	const dispatch = useAppDispatch();
	const {
		country,
		city,
		district,
		currentBounds,
		isLoading,
		categoryGroups,
		selectedFeature,
	} = useAppSelector((state) => state.mapSearch);

	const updateMapLoading = (loading: boolean) => {
		dispatch(setMapLoading(loading));
	};

	const resetMap = () => {
		dispatch(resetMapState());
	};

	const updateDistrict = (district: GeoJSON.Feature | null) => {
		dispatch(setDistrict(district));
	};

	const updateCategoryGroups = (groups: POICategoryDefinition[]) => {
		dispatch(setCategoryGroups(groups));
	};

	const updateSelectedFeature = (feature: GeoJSON.Feature) => {
		dispatch(setSelectedFeature(feature));
	};

	const clearSelectedFeature = () => {
		dispatch(setSelectedFeature(null));
	};

	return {
		resetMap,
		city,
		country,
		currentBounds,
		selectedFeature,
		updateSelectedFeature,
		clearSelectedFeature,
		district,
		updateDistrict,
		mapReady: !isLoading,
		updateMapLoading,
		categoryGroups,
		updateCategoryGroups,
	};
};
