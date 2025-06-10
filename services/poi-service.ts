// Official POI Categories based on OpenStreetMap amenity types
export enum POICategory {
	// Food & Drink
	RESTAURANT = "restaurant",
	CAFE = "cafe",
	BAR = "bar",
	FAST_FOOD = "fast_food",

	// Transportation
	BUS_STATION = "bus_station",
	SUBWAY_ENTRANCE = "subway_entrance",
	TAXI = "taxi",

	// Tourism & Attraction
	ATTRACTION = "attraction",
	HOTEL = "hotel",
	MUSEUM = "museum",

	// Shopping
	SHOP = "shop",
	MALL = "mall",
	MARKET = "marketplace",

	// Healthcare
	HOSPITAL = "hospital",
	PHARMACY = "pharmacy",
	CLINIC = "clinic",

	// Education
	SCHOOL = "school",
	UNIVERSITY = "university",
	LIBRARY = "library",

	// Finance
	BANK = "bank",
	ATM = "atm",

	// Entertainment
	CINEMA = "cinema",
	THEATRE = "theatre",

	// Services
	POST_OFFICE = "post_office",
	POLICE = "police",
	FIRE_STATION = "fire_station",
}

// POI Category metadata for UI display
export const POI_CATEGORY_CONFIG: Record<
	POICategory,
	{
		label: string;
		icon: string;
		color: string;
		osmTags: { key: string; values: string[] }[];
	}
> = {
	[POICategory.RESTAURANT]: {
		label: "Restaurants",
		icon: "🍽️",
		color: "#FF6B6B",
		osmTags: [{ key: "amenity", values: ["restaurant"] }],
	},
	[POICategory.CAFE]: {
		label: "Cafes",
		icon: "☕",
		color: "#8B4513",
		osmTags: [{ key: "amenity", values: ["cafe"] }],
	},
	[POICategory.BAR]: {
		label: "Bars",
		icon: "🍺",
		color: "#FFD700",
		osmTags: [{ key: "amenity", values: ["bar", "pub"] }],
	},
	[POICategory.FAST_FOOD]: {
		label: "Fast Food",
		icon: "🍔",
		color: "#FF4500",
		osmTags: [{ key: "amenity", values: ["fast_food"] }],
	},
	[POICategory.BUS_STATION]: {
		label: "Bus Stations",
		icon: "🚌",
		color: "#4ECDC4",
		osmTags: [
			{ key: "public_transport", values: ["stop_position"] },
			{ key: "highway", values: ["bus_stop"] },
		],
	},
	[POICategory.SUBWAY_ENTRANCE]: {
		label: "Metro",
		icon: "🚇",
		color: "#9C27B0",
		osmTags: [
			{ key: "railway", values: ["subway_entrance"] },
			{ key: "public_transport", values: ["station"] },
		],
	},
	[POICategory.TAXI]: {
		label: "Taxi",
		icon: "🚕",
		color: "#FFC107",
		osmTags: [{ key: "amenity", values: ["taxi"] }],
	},
	[POICategory.ATTRACTION]: {
		label: "Attractions",
		icon: "🎯",
		color: "#96CEB4",
		osmTags: [{ key: "tourism", values: ["attraction"] }],
	},
	[POICategory.HOTEL]: {
		label: "Hotels",
		icon: "🏨",
		color: "#FFEAA7",
		osmTags: [{ key: "tourism", values: ["hotel"] }],
	},
	[POICategory.MUSEUM]: {
		label: "Museums",
		icon: "🏛️",
		color: "#6C5CE7",
		osmTags: [{ key: "tourism", values: ["museum"] }],
	},
	[POICategory.SHOP]: {
		label: "Shops",
		icon: "🛍️",
		color: "#E17055",
		osmTags: [{ key: "shop", values: ["*"] }], // * means any shop value
	},
	[POICategory.MALL]: {
		label: "Malls",
		icon: "🏬",
		color: "#A29BFE",
		osmTags: [{ key: "shop", values: ["mall"] }],
	},
	[POICategory.MARKET]: {
		label: "Markets",
		icon: "🏪",
		color: "#00B894",
		osmTags: [{ key: "amenity", values: ["marketplace"] }],
	},
	[POICategory.HOSPITAL]: {
		label: "Hospitals",
		icon: "🏥",
		color: "#E84393",
		osmTags: [{ key: "amenity", values: ["hospital"] }],
	},
	[POICategory.PHARMACY]: {
		label: "Pharmacies",
		icon: "��",
		color: "#00CEC9",
		osmTags: [{ key: "amenity", values: ["pharmacy"] }],
	},
	[POICategory.CLINIC]: {
		label: "Clinics",
		icon: "🩺",
		color: "#FD79A8",
		osmTags: [{ key: "amenity", values: ["clinic"] }],
	},
	[POICategory.SCHOOL]: {
		label: "Schools",
		icon: "🏫",
		color: "#74B9FF",
		osmTags: [{ key: "amenity", values: ["school"] }],
	},
	[POICategory.UNIVERSITY]: {
		label: "Universities",
		icon: "🎓",
		color: "#0984E3",
		osmTags: [{ key: "amenity", values: ["university"] }],
	},
	[POICategory.LIBRARY]: {
		label: "Libraries",
		icon: "📚",
		color: "#6C5CE7",
		osmTags: [{ key: "amenity", values: ["library"] }],
	},
	[POICategory.BANK]: {
		label: "Banks",
		icon: "🏦",
		color: "#2D3436",
		osmTags: [{ key: "amenity", values: ["bank"] }],
	},
	[POICategory.ATM]: {
		label: "ATMs",
		icon: "🏧",
		color: "#636E72",
		osmTags: [{ key: "amenity", values: ["atm"] }],
	},
	[POICategory.CINEMA]: {
		label: "Cinemas",
		icon: "🎬",
		color: "#E84393",
		osmTags: [{ key: "amenity", values: ["cinema"] }],
	},
	[POICategory.THEATRE]: {
		label: "Theatres",
		icon: "🎭",
		color: "#9B59B6",
		osmTags: [{ key: "amenity", values: ["theatre"] }],
	},
	[POICategory.POST_OFFICE]: {
		label: "Post Office",
		icon: "📮",
		color: "#E67E22",
		osmTags: [{ key: "amenity", values: ["post_office"] }],
	},
	[POICategory.POLICE]: {
		label: "Police",
		icon: "👮",
		color: "#2980B9",
		osmTags: [{ key: "amenity", values: ["police"] }],
	},
	[POICategory.FIRE_STATION]: {
		label: "Fire Station",
		icon: "🚒",
		color: "#E74C3C",
		osmTags: [{ key: "amenity", values: ["fire_station"] }],
	},
};

export interface POIItem {
	id: string;
	name: string;
	type: POICategory; // Updated to use POICategory enum
	coordinates: [number, number]; // [longitude, latitude]
	address?: string;
	rating?: number;
	description?: string;
	image?: string;
	properties?: Record<string, any>;
}

export interface CameraBounds {
	ne: [number, number]; // [longitude, latitude]
	sw: [number, number]; // [longitude, latitude]
}

export interface POIFetchOptions {
	city: string;
	categories?: POICategory[]; // Updated to use categories instead of types
	bounds: CameraBounds;
	zoomLevel: number;
	limit?: number;
}

// You can use various APIs for fetching POI data:
// 1. Overpass API for OpenStreetMap data
// 2. Google Places API
// 3. Foursquare API
// 4. Your own backend API

export class POIService {
	private static readonly OVERPASS_URL =
		"https://overpass-api.de/api/interpreter";
	private static readonly REQUEST_TIMEOUT = 25000; // 25 seconds
	private static readonly MIN_ZOOM_FOR_POIS = 12; // Only fetch POIs when zoomed in enough
	private static readonly MAX_ZOOM_LEVEL = 14; // Maximum zoom level for POI fetching

	private static async fetchFromOverpass(query: string): Promise<any> {
		const controller = new AbortController();
		const timeoutId = setTimeout(
			() => controller.abort(),
			this.REQUEST_TIMEOUT,
		);

		try {
			const response = await fetch(this.OVERPASS_URL, {
				method: "POST",
				body: query,
				signal: controller.signal,
				headers: {
					"Content-Type": "text/plain",
				},
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error("Request timeout");
			}
			throw error;
		}
	}

	static shouldFetchPOIs(zoomLevel: number): boolean {
		return zoomLevel >= this.MIN_ZOOM_FOR_POIS;
	}

	static getOptimalLimit(zoomLevel: number): number {
		// More POIs for higher zoom levels
		if (zoomLevel >= 14) return 200;
		if (zoomLevel >= 13) return 150;
		if (zoomLevel >= 12) return 100;
		return 50;
	}

	static async fetchPOIsForBounds(
		options: POIFetchOptions,
	): Promise<POIItem[]> {
		const {
			bounds,
			zoomLevel,
			categories = [POICategory.RESTAURANT, POICategory.BUS_STATION],
			limit,
		} = options;

		// Don't fetch if zoom level is too low
		if (!this.shouldFetchPOIs(zoomLevel)) {
			console.log(`Zoom level ${zoomLevel} is too low for POI fetching`);
			return [];
		}

		// Validate bounds
		if (!bounds || !bounds.ne || !bounds.sw) {
			throw new Error("Valid bounds are required for POI fetching");
		}

		// Calculate bounds area to avoid fetching too much data
		const boundsArea = this.calculateBoundsArea(bounds);
		if (boundsArea > 0.1) {
			// Roughly 0.1 square degrees
			console.log("Area too large for POI fetching, skipping...");
			return [];
		}

		const optimalLimit = limit || this.getOptimalLimit(zoomLevel);

		// Build Overpass query for multiple POI categories
		const categoryQueries = categories
			.map((category) => {
				const config = POI_CATEGORY_CONFIG[category];
				return config.osmTags
					.map((tag) => {
						const values = tag.values.includes("*")
							? ""
							: `["${tag.key}"~"${tag.values.join("|")}"]`;
						return `
					node${values}(${bounds.sw[1]},${bounds.sw[0]},${bounds.ne[1]},${bounds.ne[0]});
					way${values}(${bounds.sw[1]},${bounds.sw[0]},${bounds.ne[1]},${bounds.ne[0]});
				`;
					})
					.join("\n");
			})
			.join("\n");

		const query = `
			[out:json][timeout:${this.REQUEST_TIMEOUT / 1000}];
			(
				${categoryQueries}
			);
			out center ${optimalLimit};
		`;

		try {
			console.log(
				`Fetching POIs for bounds: SW[${bounds.sw}], NE[${bounds.ne}], zoom: ${zoomLevel}`,
			);
			const data = await this.fetchFromOverpass(query);
			const transformedData = this.transformOverpassData(data, categories);
			console.log(`Successfully fetched ${transformedData.length} POIs`);
			return transformedData;
		} catch (error) {
			console.error("Error fetching POIs:", error);
			throw new Error(
				`Failed to fetch POI data: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	private static calculateBoundsArea(bounds: CameraBounds): number {
		const width = Math.abs(bounds.ne[0] - bounds.sw[0]);
		const height = Math.abs(bounds.ne[1] - bounds.sw[1]);
		return width * height;
	}

	private static transformOverpassData(
		data: any,
		requestedCategories: POICategory[],
	): POIItem[] {
		if (!data?.elements || !Array.isArray(data.elements)) {
			return [];
		}

		return data.elements
			.map((element: any) => {
				// Determine POI category based on tags
				let category: POICategory | null = null;

				// Find matching category based on OSM tags
				for (const reqCategory of requestedCategories) {
					const config = POI_CATEGORY_CONFIG[reqCategory];
					for (const osmTag of config.osmTags) {
						if (element.tags?.[osmTag.key]) {
							const tagValue = element.tags[osmTag.key];
							if (
								osmTag.values.includes("*") ||
								osmTag.values.includes(tagValue)
							) {
								category = reqCategory;
								break;
							}
						}
					}
					if (category) break;
				}

				// Skip if no matching category found
				if (!category) return null;

				// Get coordinates (prefer center for ways, direct coordinates for nodes)
				const coordinates: [number, number] = [
					element.lon || element.center?.lon,
					element.lat || element.center?.lat,
				];

				// Skip if no valid coordinates
				if (!coordinates[0] || !coordinates[1]) {
					return null;
				}

				return {
					id: `${category}_${element.id}`,
					name:
						element.tags?.name ||
						`${POI_CATEGORY_CONFIG[category].label} ${element.id}`,
					type: category,
					coordinates,
					address: this.buildAddress(element.tags),
					rating: element.tags?.stars
						? parseFloat(element.tags.stars)
						: undefined,
					properties: element.tags,
				};
			})
			.filter((item: any): item is POIItem => item !== null);
	}

	private static buildAddress(tags: any): string {
		if (!tags) return "";

		const parts = [
			tags["addr:housenumber"],
			tags["addr:street"],
			tags["addr:district"],
			tags["addr:city"],
		].filter(Boolean);

		return parts.length > 0 ? parts.join(", ") : tags["addr:full"] || "";
	}
}
