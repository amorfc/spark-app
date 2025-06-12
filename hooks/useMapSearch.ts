import { POICategoryGroupType } from "@/services/poi-service";
import { useAppDispatch, useAppSelector } from "@/store/index";
import {
	resetMapState,
	setDistrict,
	setMapLoading,
	setCategoryGroups,
} from "@/store/slices/mapSearchSlice";

export const useMapSearch = () => {
	const dispatch = useAppDispatch();
	const { country, city, district, currentBounds, isLoading, categoryGroups } =
		useAppSelector((state) => state.mapSearch);

	const updateMapLoading = (loading: boolean) => {
		dispatch(setMapLoading(loading));
	};

	const resetMap = () => {
		dispatch(resetMapState());
	};

	const updateDistrict = (district: GeoJSON.Feature | null) => {
		dispatch(setDistrict(district));
	};

	const updateCategoryGroups = (groups: POICategoryGroupType[]) => {
		dispatch(setCategoryGroups(groups));
	};

	return {
		country,
		city,
		district,
		currentBounds,
		updateMapLoading,
		resetMap,
		updateDistrict,
		mapReady: !isLoading,
		updateCategoryGroups,
		categoryGroups,
	};
};
