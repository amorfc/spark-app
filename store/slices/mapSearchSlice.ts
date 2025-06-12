import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BoundingBox } from "@/types/osm";
import { POICategoryGroupType } from "@/services/poi-service";

export interface MapSearchState {
	selectedFeatureId: string | null;
	country: string;
	city: string;
	district?: GeoJSON.Feature | null;
	currentBounds: BoundingBox;
	isLoading: boolean;
	districts: GeoJSON.Feature[];
	categoryGroups: POICategoryGroupType[];
	selectedFeature: GeoJSON.Feature | null;
}

const defaultBounds: BoundingBox = {
	north: 41.20712871580946,
	south: 40.808668899963436,
	east: 29.113325840965217,
	west: 28.84347415903514,
};

const initialState: MapSearchState = {
	selectedFeatureId: null,
	country: "Türkiye",
	city: "İstanbul",
	district: null,
	currentBounds: defaultBounds,
	isLoading: false,
	districts: [],
	categoryGroups: [],
	selectedFeature: null,
};

const mapSearchSlice = createSlice({
	name: "mapSearch",
	initialState,
	reducers: {
		setSelectedFeatureId: (state, action: PayloadAction<string | null>) => {
			state.selectedFeatureId = action.payload;
		},
		setCountry: (state, action: PayloadAction<string>) => {
			state.country = action.payload;
		},
		setCity: (state, action: PayloadAction<string>) => {
			state.city = action.payload;
		},
		setCurrentBounds: (state, action: PayloadAction<BoundingBox>) => {
			state.currentBounds = action.payload;
		},
		setDistrict: (state, action: PayloadAction<GeoJSON.Feature | null>) => {
			state.district = action.payload;
		},
		setDistricts: (state, action: PayloadAction<GeoJSON.Feature[]>) => {
			state.districts = action.payload;
		},
		setMapLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		resetMapState: (state) => {
			state.selectedFeatureId = initialState.selectedFeatureId;
			state.district = initialState.district;
			state.currentBounds = initialState.currentBounds;
			state.isLoading = initialState.isLoading;
			state.categoryGroups = initialState.categoryGroups;
		},
		setCategoryGroups: (
			state,
			action: PayloadAction<POICategoryGroupType[]>,
		) => {
			state.categoryGroups = action.payload;
		},
		setSelectedFeature: (
			state,
			action: PayloadAction<GeoJSON.Feature | null>,
		) => {
			state.selectedFeature = action.payload;
		},
	},
});

export const {
	setSelectedFeature,
	setSelectedFeatureId,
	setCurrentBounds,
	setCountry,
	setCity,
	setDistrict,
	setDistricts,
	setMapLoading,
	resetMapState,
	setCategoryGroups,
} = mapSearchSlice.actions;

export default mapSearchSlice.reducer;
