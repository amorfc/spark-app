import { useMemo } from "react";

export interface FeatureMetadata {
	icon: string;
	label: string;
}

export const useFeatureMetadata = (
	feature: GeoJSON.Feature,
): FeatureMetadata => {
	return useMemo(() => {
		const props = feature.properties || {};
		const geometryType = feature.geometry?.type;

		if (geometryType === "Point") {
			// Transportation amenities
			if (props.highway === "bus_stop")
				return {
					icon: "🚌",
					label: "Bus Stop",
				};
			if (props.railway === "tram_stop")
				return {
					icon: "🚊",
					label: "Tram Stop",
				};
			if (props.railway === "station")
				return {
					icon: "🚉",
					label: "Station",
				};
			if (props.railway === "subway_entrance")
				return {
					icon: "🚇",
					label: "Subway Entrance",
				};
			if (props.amenity === "ferry_terminal")
				return {
					icon: "🚢",
					label: "Ferry Terminal",
				};
			if (props.amenity === "bus_station")
				return {
					icon: "🚌",
					label: "Bus Station",
				};
			if (
				props.public_transport === "platform" ||
				props.public_transport === "stop_position"
			)
				return {
					icon: "🚏",
					label: "Platform",
				};

			// Food & Drink amenities
			if (props.amenity === "restaurant")
				return {
					icon: "🥘",
					label: "Restaurant",
				};
			if (props.amenity === "cafe")
				return {
					icon: "☕",
					label: "Cafe",
				};
			if (props.amenity === "bar")
				return {
					icon: "🍺",
					label: "Bar",
				};
			if (props.amenity === "pub")
				return {
					icon: "🍻",
					label: "Pub",
				};
			if (props.amenity === "fast_food")
				return {
					icon: "🍔",
					label: "Fast Food",
				};
			if (props.amenity === "ice_cream")
				return {
					icon: "🍦",
					label: "Ice Cream",
				};
			if (props.amenity === "food_court")
				return {
					icon: "🥘",
					label: "Food Court",
				};
			if (props.amenity === "biergarten")
				return {
					icon: "🍻",
					label: "Beer Garden",
				};

			// Additional common amenities
			if (props.amenity === "bank")
				return {
					icon: "🏦",
					label: "Bank",
				};
			if (props.amenity === "hospital")
				return {
					icon: "🏥",
					label: "Hospital",
				};
			if (props.amenity === "pharmacy")
				return {
					icon: "💊",
					label: "Pharmacy",
				};
			if (props.amenity === "fuel")
				return {
					icon: "⛽",
					label: "Gas Station",
				};
			if (props.amenity === "parking")
				return {
					icon: "🅿️",
					label: "Parking",
				};
			if (props.amenity === "atm")
				return {
					icon: "🏧",
					label: "ATM",
				};
			if (props.amenity === "post_office")
				return {
					icon: "📮",
					label: "Post Office",
				};
			if (props.amenity === "police")
				return {
					icon: "👮",
					label: "Police",
				};
			if (props.amenity === "fire_station")
				return {
					icon: "🚒",
					label: "Fire Station",
				};
			if (props.amenity === "school")
				return {
					icon: "🏫",
					label: "School",
				};
			if (props.amenity === "university")
				return {
					icon: "🎓",
					label: "University",
				};
			if (props.amenity === "library")
				return {
					icon: "📚",
					label: "Library",
				};
			if (props.amenity === "cinema")
				return {
					icon: "🎬",
					label: "Cinema",
				};
			if (props.amenity === "theatre")
				return {
					icon: "🎭",
					label: "Theatre",
				};
			if (props.amenity === "marketplace")
				return {
					icon: "🛒",
					label: "Market",
				};
			if (props.amenity === "place_of_worship")
				return {
					icon: "⛪",
					label: "Place of Worship",
				};

			// Shopping amenities
			if (props.shop)
				return {
					icon: "🛍️",
					label: "Shop",
				};

			// Tourism amenities
			if (props.tourism === "hotel")
				return {
					icon: "🏨",
					label: "Hotel",
				};
			if (props.tourism === "museum")
				return {
					icon: "🏛️",
					label: "Museum",
				};
			if (props.tourism === "attraction")
				return {
					icon: "🎯",
					label: "Attraction",
				};
			if (props.tourism === "information")
				return {
					icon: "ℹ️",
					label: "Information",
				};

			// Default fallback for points
			return {
				icon: "📍",
				label: "Point",
			};
		}

		// Handle other geometry types
		if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
			return {
				icon: "🏛️",
				label: "Area",
			};
		}

		if (geometryType === "LineString" || geometryType === "MultiLineString") {
			return {
				icon: "🛤️",
				label: "Route",
			};
		}

		// Default fallback
		return {
			icon: "📍",
			label: "Feature",
		};
	}, [feature]);
};
