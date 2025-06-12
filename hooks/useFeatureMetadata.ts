export interface FeatureMetadata {
	icon: string;
	label: string;
}

export const useFeatureMetadata = (
	feature: GeoJSON.Feature,
): FeatureMetadata => {
	const props = feature?.properties ?? {};
	const geometryType = feature?.geometry?.type;

	// Handle Point geometries (transport stops)
	if (geometryType === "Point") {
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

		return {
			icon: "📍",
			label: "Point",
		};
	}

	// Handle Polygon and MultiPolygon geometries (areas)
	if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
		// Check for administrative areas
		if (props.admin_level) {
			const adminLevel = parseInt(props.admin_level);
			if (adminLevel <= 6) {
				return {
					icon: "🏛️",
					label: "Administrative Area",
				};
			}
			if (adminLevel === 7 || adminLevel === 8) {
				return {
					icon: "🏘️",
					label: "District",
				};
			}
			if (adminLevel >= 9) {
				return {
					icon: "🏠",
					label: "Neighborhood",
				};
			}
		}

		// Check for specific place types
		if (props.place === "city" || props.place === "town") {
			return {
				icon: "🏙️",
				label: "City",
			};
		}
		if (props.place === "village" || props.place === "hamlet") {
			return {
				icon: "🏘️",
				label: "Village",
			};
		}
		if (props.place === "suburb" || props.place === "neighbourhood") {
			return {
				icon: "🏠",
				label: "Neighborhood",
			};
		}

		// Default area type
		return {
			icon: "📐",
			label: "Area",
		};
	}

	// Fallback for other geometry types
	return {
		icon: "📍",
		label: "Feature",
	};
};
