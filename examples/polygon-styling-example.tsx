import React, { useState } from "react";
import { View, Button } from "react-native";
import Map from "@/components/map/map";
import { BoundingBox } from "@/types/osm";

// Example polygon data (Istanbul district)
const istanbulPolygon: GeoJSON.Feature = {
	type: "Feature",
	id: "example-polygon",
	properties: {
		name: "Example District",
		ref_id: 1,
	},
	geometry: {
		type: "Polygon",
		coordinates: [
			[
				[28.9784, 41.0082], // Southwest
				[29.0784, 41.0082], // Southeast
				[29.0784, 41.1082], // Northeast
				[28.9784, 41.1082], // Northwest
				[28.9784, 41.0082], // Close polygon
			],
		],
	},
};

const bounds: BoundingBox = {
	north: 41.1082,
	south: 41.0082,
	east: 29.0784,
	west: 28.9784,
};

export default function PolygonStylingExample() {
	const [currentStyle, setCurrentStyle] = useState<
		"default" | "blue" | "red" | "green"
	>("default");

	const getPolygonStyle = () => {
		switch (currentStyle) {
			case "blue":
				return {
					fillColor: "#3B82F6",
					fillOpacity: 0.4,
					strokeColor: "#1E40AF",
					strokeWidth: 3,
					strokeOpacity: 0.8,
				};
			case "red":
				return {
					fillColor: "#EF4444",
					fillOpacity: 0.5,
					strokeColor: "#DC2626",
					strokeWidth: 2,
					strokeOpacity: 1,
				};
			case "green":
				return {
					fillColor: "#10B981",
					fillOpacity: 0.3,
					strokeColor: "#047857",
					strokeWidth: 4,
					strokeOpacity: 0.9,
				};
			default:
				return undefined; // Use default styling
		}
	};

	return (
		<View style={{ flex: 1 }}>
			{/* Style selection buttons */}
			<View
				style={{
					flexDirection: "row",
					padding: 10,
					justifyContent: "space-around",
				}}
			>
				<Button title="Default" onPress={() => setCurrentStyle("default")} />
				<Button title="Blue" onPress={() => setCurrentStyle("blue")} />
				<Button title="Red" onPress={() => setCurrentStyle("red")} />
				<Button title="Green" onPress={() => setCurrentStyle("green")} />
			</View>

			{/* Map with custom styled polygon */}
			<Map
				isLoading={false}
				currentBounds={bounds}
				shape={istanbulPolygon}
				onFeaturePress={(id) => console.log("Polygon pressed:", id)}
				variant="moderate"
				polygonStyle={getPolygonStyle()}
			/>
		</View>
	);
}

// Example of creating polygon from coordinates array
export const createCustomPolygon = (
	id: string | number,
	coordinates: [number, number][],
	style?: {
		fillColor?: string;
		fillOpacity?: number;
		strokeColor?: string;
		strokeWidth?: number;
		strokeOpacity?: number;
	},
): { polygon: GeoJSON.Feature; style: any } => {
	// Ensure polygon is closed
	const closedCoordinates = [...coordinates];
	if (
		closedCoordinates[0][0] !==
			closedCoordinates[closedCoordinates.length - 1][0] ||
		closedCoordinates[0][1] !==
			closedCoordinates[closedCoordinates.length - 1][1]
	) {
		closedCoordinates.push(closedCoordinates[0]);
	}

	const polygon: GeoJSON.Feature = {
		type: "Feature",
		id,
		properties: {
			name: `Custom Polygon ${id}`,
		},
		geometry: {
			type: "Polygon",
			coordinates: [closedCoordinates],
		},
	};

	return {
		polygon,
		style: style || {
			fillColor: "#8B5CF6",
			fillOpacity: 0.4,
			strokeColor: "#7C3AED",
			strokeWidth: 2,
			strokeOpacity: 0.8,
		},
	};
};

// Usage examples:

// 1. Basic usage with default styling
/*
<Map
	isLoading={false}
	currentBounds={bounds}
	shape={myPolygon}
	onFeaturePress={(id) => console.log(id)}
/>
*/

// 2. Custom blue polygon
/*
<Map
	isLoading={false}
	currentBounds={bounds}
	shape={myPolygon}
	onFeaturePress={(id) => console.log(id)}
	polygonStyle={{
		fillColor: "#3B82F6",
		fillOpacity: 0.4,
		strokeColor: "#1E40AF",
		strokeWidth: 3,
		strokeOpacity: 0.8,
	}}
/>
*/

// 3. Semi-transparent red polygon with thick border
/*
<Map
	isLoading={false}
	currentBounds={bounds}
	shape={myPolygon}
	onFeaturePress={(id) => console.log(id)}
	polygonStyle={{
		fillColor: "#EF4444",
		fillOpacity: 0.2,
		strokeColor: "#DC2626",
		strokeWidth: 5,
		strokeOpacity: 1,
	}}
/>
*/
