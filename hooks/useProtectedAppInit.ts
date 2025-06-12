import { useDistricts } from "@/hooks/useDistricts";
import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { setDistricts } from "@/store/slices/mapSearchSlice";
import { useMapSearch } from "@/hooks/useMapSearch";

export const useProtectedAppInit = () => {
	const dispatch = useAppDispatch();
	const { updateMapLoading } = useMapSearch();
	const { data: districts, isLoading: isDistrictsLoading } = useDistricts();

	useEffect(() => {
		updateMapLoading(isDistrictsLoading);
	}, [isDistrictsLoading, updateMapLoading]);

	useEffect(() => {
		dispatch(setDistricts(districts?.features ?? []));
	}, [dispatch, districts]);
};
