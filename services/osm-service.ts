import { supabase } from "@/config/supabase";
import {
	BoundingBox,
	SearchFilters,
	OSMFeature,
	FeatureType,
} from "@/types/osm";

export class OSMService {
	/**
	 * Search features by bounding box with optional filters
	 */
	static async searchByBoundingBox(
		bbox: BoundingBox,
		filters?: Omit<SearchFilters, "bbox">,
	): Promise<any> {
		const { data, error } = await supabase.rpc("get_features_in_bbox", {
			p_bbox_west: bbox.west,
			p_bbox_south: bbox.south,
			p_bbox_east: bbox.east,
			p_bbox_north: bbox.north,
			p_feature_types: filters?.feature_types || null,
			p_city: filters?.city || null,
			p_country: filters?.country || null,
			p_limit: filters?.limit || 300,
		});

		if (error) throw error;
		return data || { type: "FeatureCollection", features: [] };
	}

	/**
	 * Full-text search with PostGIS spatial filtering
	 */
	static async fullTextSearch(
		searchText: string,
		bbox?: BoundingBox,
		featureTypes?: FeatureType[],
		limit: number = 50,
		filters?: Omit<SearchFilters, "bbox">,
	): Promise<OSMFeature[]> {
		let query = supabase
			.from("osm_features")
			.select("*")
			.textSearch("search_vector", searchText, {
				type: "websearch",
				config: "turkish",
			});

		if (filters?.city) {
			query = query.eq("city", filters.city);
		}

		if (filters?.country) {
			query = query.eq("country", filters.country);
		}

		if (bbox) {
			query = query.filter(
				"center_coordinate",
				"overlaps",
				`POLYGON((${bbox.west} ${bbox.south}, ${bbox.east} ${bbox.south}, ${bbox.east} ${bbox.north}, ${bbox.west} ${bbox.north}, ${bbox.west} ${bbox.south}))`,
			);
		}

		if (featureTypes?.length) {
			query = query.in("feature_type", featureTypes);
		}

		query = query.limit(limit);

		const { data, error } = await query;

		if (error) {
			throw new Error(`Full-text search failed: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Get districts for dropdown/autocomplete
	 */
	static async getDistricts(
		filters?: Omit<SearchFilters, "bbox">,
		searchText?: string,
	): Promise<OSMFeature[]> {
		let query = supabase
			.from("osm_features")
			.select("*")
			.eq("feature_type", "district")
			.order("name");

		if (searchText) {
			query = query.ilike("name", `%${searchText}%`);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(`Failed to get districts: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Get neighborhoods for a specific district
	 */
	static async getNeighborhoods(
		filters?: Omit<SearchFilters, "bbox">,
	): Promise<OSMFeature[]> {
		let query = supabase
			.from("osm_features")
			.select("*")
			.eq("feature_type", "neighborhood")
			.order("name");

		if (filters?.city) {
			query = query.eq("city", filters.city);
		}

		if (filters?.country) {
			query = query.eq("country", filters.country);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(`Failed to get neighborhoods: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Get feature by ref_id (OSM ID)
	 */
	static async getFeatureByRefId(refId: number): Promise<OSMFeature | null> {
		const { data, error } = await supabase
			.from("osm_features")
			.select("*")
			.eq("ref_id", refId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null; // Not found
			}
			throw new Error(`Failed to get feature by ref_id: ${error.message}`);
		}

		return data;
	}
}
