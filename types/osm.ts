export type FeatureType =
	| "district"
	| "neighborhood"
	| "bus_stop"
	| "tram_station"
	| "ferry_terminal"
	| "metro_station"
	| "train_station"
	| "other_transport";

export interface OSMFeature {
	supabase_id: string;
	ref_id: number;
	name: string | null;
	name_en?: string | null;
	name_tr?: string | null;
	feature_type: FeatureType;
	full_address?: string | null;
	city?: string | null;
	country?: string | null;
	search_text?: string | null;
	tags?: Record<string, any> | null;
	geometry?: any; // PostGIS geometry
	center_coordinate?: {
		type: string;
		crs: { type: string; properties: { name: string } };
		coordinates: [number, number];
	} | null;
	admin_level?: number | null;
	parent_district_id?: number | null;
	parent_neighborhood_id?: number | null;
	last_updated?: string;
	data_source?: string;
}

export interface OSMRawFeature {
	type: "Feature";
	id: number | string;
	properties: {
		name?: string;
		"name:en"?: string;
		"name:tr"?: string;
		admin_level?: string;
		place?: string;
		highway?: string;
		public_transport?: string;
		railway?: string;
		amenity?: string;
		city?: string;
		"addr:city"?: string;
		country?: string;
		"addr:country"?: string;
		addr?: {
			street?: string;
			neighbourhood?: string;
			district?: string;
			city?: string;
			postcode?: string;
			country?: string;
		};
		[key: string]: any;
	};
	geometry: {
		type: "Point" | "Polygon" | "MultiPolygon" | "LineString";
		coordinates: number[] | number[][] | number[][][];
	};
}

export interface ProcessedFeature {
	ref_id: number;
	name: string | null;
	name_en?: string | null;
	name_tr?: string | null;
	feature_type: FeatureType;
	full_address?: string | null;
	city?: string | null;
	country?: string | null;
	tags: Record<string, any>;
	geometry: any;
	center_coordinate: { lat: number; lng: number };
	admin_level?: number | null;
	parent_district_id?: number | null;
	parent_neighborhood_id?: number | null;
}

export interface BoundingBox {
	north: number;
	south: number;
	east: number;
	west: number;
}

export interface SearchFilters {
	feature_types?: FeatureType[];
	bbox?: BoundingBox;
	search_text?: string;
	city?: string;
	country?: string;
	admin_level?: number;
	limit?: number;
	offset?: number;
}
