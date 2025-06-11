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
	): Promise<OSMFeature[]> {
		let query = supabase
			.from("osm_features")
			.select("*")
			.filter(
				"geometry",
				"overlaps",
				`POLYGON((${bbox.west} ${bbox.south}, ${bbox.east} ${bbox.south}, ${bbox.east} ${bbox.north}, ${bbox.west} ${bbox.north}, ${bbox.west} ${bbox.south}))`,
			);

		// Apply filters
		if (filters?.feature_types?.length) {
			query = query.in("feature_type", filters.feature_types);
		}

		if (filters?.search_text) {
			query = query.or(
				`name.ilike.%${filters.search_text}%,full_address.ilike.%${filters.search_text}%,city.ilike.%${filters.search_text}%`,
			);
		}

		if (filters?.city) {
			query = query.eq("city", filters.city);
		}

		if (filters?.country) {
			query = query.eq("country", filters.country);
		}

		if (filters?.admin_level) {
			query = query.eq("admin_level", filters.admin_level);
		}

		if (filters?.limit) {
			query = query.limit(filters.limit);
		}

		if (filters?.offset) {
			query = query.range(
				filters.offset,
				filters.offset + (filters.limit || 50) - 1,
			);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(`Failed to search features: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Full-text search with PostGIS spatial filtering
	 */
	static async fullTextSearch(
		searchText: string,
		bbox?: BoundingBox,
		featureTypes?: FeatureType[],
		limit: number = 50,
	): Promise<OSMFeature[]> {
		let query = supabase
			.from("osm_features")
			.select("*")
			.textSearch("search_vector", searchText, {
				type: "websearch",
				config: "turkish",
			});

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
	 * Find nearby features within distance (in meters)
	 */
	static async findNearby(
		lat: number,
		lng: number,
		radiusMeters: number,
		featureTypes?: FeatureType[],
		limit: number = 20,
	): Promise<OSMFeature[]> {
		const point = `POINT(${lng} ${lat})`;

		let query = supabase
			.from("osm_features")
			.select("*")
			.filter("center_coordinate", "dwithin", [point, radiusMeters]);

		if (featureTypes?.length) {
			query = query.in("feature_type", featureTypes);
		}

		query = query.limit(limit);

		const { data, error } = await query;

		if (error) {
			throw new Error(`Nearby search failed: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Get districts for dropdown/autocomplete
	 */
	static async getDistricts(searchText?: string): Promise<OSMFeature[]> {
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
	static async getNeighborhoods(): Promise<OSMFeature[]> {
		const { data, error } = await supabase
			.from("osm_features")
			.select("*")
			.eq("feature_type", "neighborhood")
			.order("name");

		if (error) {
			throw new Error(`Failed to get neighborhoods: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Get feature by ID
	 */
	static async getFeatureById(supabaseId: string): Promise<OSMFeature | null> {
		const { data, error } = await supabase
			.from("osm_features")
			.select("*")
			.eq("supabase_id", supabaseId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null; // Not found
			}
			throw new Error(`Failed to get feature: ${error.message}`);
		}

		return data;
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

	/**
	 * Get transportation stops within a bounding box
	 */
	static async getTransportationStops(
		bbox: BoundingBox,
	): Promise<OSMFeature[]> {
		return this.searchByBoundingBox(bbox, {
			feature_types: [
				"bus_stop",
				"tram_station",
				"ferry_terminal",
				"metro_station",
				"other_transport",
			],
		});
	}

	/**
	 * Get map initialization data with GeoJSON format
	 */
	static async getMapInitData(
		featureTypes: FeatureType[] = ["district", "neighborhood"],
	): Promise<any> {
		const { data, error } = await supabase
			.from("osm_features")
			.select(
				"supabase_id, ref_id, name, name_tr, name_en, feature_type, geometry, center_coordinate, city, country, admin_level",
			)
			.in("feature_type", featureTypes)
			.not("geometry", "is", null)
			.order("name");

		if (error) {
			throw new Error(`Failed to get map data: ${error.message}`);
		}

		// Convert to GeoJSON format
		const geoJson = {
			type: "FeatureCollection",
			features: data.map((feature) => ({
				type: "Feature",
				id: feature.supabase_id,
				properties: {
					id: feature.supabase_id,
					ref_id: feature.ref_id,
					name: feature.name,
					name_tr: feature.name_tr,
					name_en: feature.name_en,
					feature_type: feature.feature_type,
					city: feature.city,
					country: feature.country,
					admin_level: feature.admin_level,
				},
				geometry: feature.geometry,
			})),
		};

		return geoJson;
	}

	/**
	 * Get filtered map data by search type
	 */
	static async getMapDataByType(searchTypes: FeatureType[]): Promise<any> {
		const featureTypes: FeatureType[] = searchTypes;

		return this.getMapInitData(featureTypes);
	}
}
