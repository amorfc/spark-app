import { useAppDispatch, useAppSelector } from "@/store";
import {
	setUser,
	clearUser,
	setError,
	setLoading,
	clearError,
} from "@/store/slices/authSlice";
import {
	setSelectedFeature,
	setCurrentBounds,
	setCountry,
	setCity,
} from "@/store/slices/mapSearchSlice";
import type { User } from "@/store/slices/authSlice";
import type { BoundingBox } from "@/types/osm";

// Auth hooks
export const useAuth = () => {
	const dispatch = useAppDispatch();
	const { user, isAuthenticated, isLoading, error } = useAppSelector(
		(state) => state.auth,
	);

	const login = (userData: User) => {
		dispatch(setUser(userData));
	};

	const logout = () => {
		dispatch(clearUser());
	};

	const setAuthLoading = (loading: boolean) => {
		dispatch(setLoading(loading));
	};

	const setAuthError = (errorMessage: string) => {
		dispatch(setError(errorMessage));
	};

	const clearAuthError = () => {
		dispatch(clearError());
	};

	return {
		user,
		isAuthenticated,
		isLoading,
		error,
		login,
		logout,
		setAuthLoading,
		setAuthError,
		clearAuthError,
	};
};

// Map Search hooks
export const useMapSearch = () => {
	const dispatch = useAppDispatch();
	const {
		selectedFeatureId,
		country,
		city,
		district,
		currentBounds,
		isLoading,
	} = useAppSelector((state) => state.mapSearch);

	const selectFeature = (featureId: string | null) => {
		dispatch(setSelectedFeature(featureId));
	};

	const updateBounds = (bounds: BoundingBox) => {
		dispatch(setCurrentBounds(bounds));
	};

	const updateCountry = (country: string) => {
		dispatch(setCountry(country));
	};

	const updateCity = (city: string) => {
		dispatch(setCity(city));
	};

	return {
		selectedFeatureId,
		country,
		city,
		district,
		currentBounds,
		isLoading,
		selectFeature,
		updateBounds,
		updateCountry,
		updateCity,
	};
};
