/* eslint-disable @typescript-eslint/no-empty-object-type */
// services/overpass-api.service.ts
import osmtogeojson from "osmtogeojson";

export type OverpassCategory = "food_drink" | "public_transports";

export enum OverPassCategory {
	FOOD_AND_DRINK = "food_drink",
	TRANSPORTATION = "public_transports",
}

export interface BaseLocationParams {
	country: string; // e.g., "Türkiye"
	city: string; // e.g., "İstanbul"
}

export interface BaseDistrictParams extends BaseLocationParams {
	district: string; // e.g., "Kadıköy"
}

export interface AmenityQueryParams extends BaseDistrictParams {
	category: OverpassCategory;
}

export interface DistrictQueryParams extends BaseLocationParams {}

export interface NeighborhoodQueryParams extends BaseDistrictParams {}

export class OverpassApiService {
	private static endpoint = "https://overpass-api.de/api/interpreter";
	private static readonly header = "[out:json][timeout:60];";

	static async fetchAmenities(
		params: AmenityQueryParams,
	): Promise<GeoJSON.FeatureCollection> {
		const query = this.buildAmenityQuery(params);
		return this.executeQuery(query);
	}

	public static async fetchDistricts(
		params: DistrictQueryParams,
	): Promise<GeoJSON.FeatureCollection> {
		const query = this.buildDistrictQuery(params);
		console.log({ query });

		return await this.executeQuery(query);
	}

	static async fetchNeighborhoods(
		params: NeighborhoodQueryParams,
	): Promise<GeoJSON.FeatureCollection> {
		const query = this.buildNeighborhoodQuery(params);
		return this.executeQuery(query);
	}

	private static async executeQuery(
		query: string,
	): Promise<GeoJSON.FeatureCollection> {
		const response = await fetch(this.endpoint, {
			method: "POST",
			body: query,
		});

		if (!response.ok) {
			throw new Error(`Overpass API error: ${response.statusText}`);
		}

		const data = await response.json();
		return osmtogeojson(data);
	}

	private static buildAmenityQuery({
		district,
		category,
	}: AmenityQueryParams): string {
		const areaDef = `area["name"="${district}"]["admin_level"="6"]->.searchArea;`;

		let body = "";
		switch (category) {
			case "food_drink":
				body = `(
          node["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|food_court|biergarten)$"](area.searchArea);
          way["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|food_court|biergarten)$"](area.searchArea);
          relation["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|food_court|biergarten)$"](area.searchArea);
        );
        out center;`;
				break;

			case "public_transports":
				body = `(
          node["public_transport"~"platform|stop_position"](area.searchArea);
          node["highway"="bus_stop"](area.searchArea);
          node["railway"~"station|halt|tram_stop|subway_entrance"](area.searchArea);
          node["amenity"="bus_station"](area.searchArea);
          node["amenity"="ferry_terminal"](area.searchArea);
        );
        out body;`;
				break;
		}

		return `${this.header}\n${areaDef}\n${body}`;
	}

	private static buildDistrictQuery({
		city,
		country,
	}: DistrictQueryParams): string {
		return `
      ${this.header}
	  area["name"="${country}"]["admin_level"="2"]->.country;
      area["name"="${city}"]["admin_level"="4"](area.country)->.city;
      relation["admin_level"="6"]["boundary"="administrative"](area.city);
      out body;
      >;
      out skel;
    `;
	}

	private static buildNeighborhoodQuery({
		district,
	}: NeighborhoodQueryParams): string {
		return `
      ${this.header}
      area["name"="${district}"]["admin_level"="6"]->.districtArea;
      relation["admin_level"="10"]["boundary"="administrative"](area.districtArea);
      out body;
      >;
      out skel qt;
    `;
	}
}
