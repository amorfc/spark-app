import { PointAnnotation, Callout } from "@rnmapbox/maps";
import { Text, View, StyleSheet } from "react-native";
import { useMemo } from "react";

export interface MapRef {
	centerOnCoordinates: (
		coordinates: [number, number],
		zoomLevel?: number,
	) => void;
}

interface MapPointAnnotationProps {
	poi: GeoJSON.Feature;
	isLast: boolean;
	index: number;
	onFeaturePress: (id: string) => void;
}

const MapPointAnnotation = ({
	poi,
	isLast,
	index,
	onFeaturePress,
}: MapPointAnnotationProps) => {
	const pointGeometry = poi.geometry as GeoJSON.Point;

	const pinIcon = useMemo(() => {
		const props = poi?.properties ?? {};

		if (props.highway === "bus_stop") return "🚌";
		if (props.railway === "tram_stop") return "🚊";
		if (props.railway === "station") return "🚉";
		if (props.railway === "subway_entrance") return "🚇";
		if (props.amenity === "ferry_terminal") return "🚢";
		if (props.amenity === "bus_station") return "🚌";
		if (
			props.public_transport === "platform" ||
			props.public_transport === "stop_position"
		)
			return "🚏";

		return "📍";
	}, [poi]);

	return (
		<View
			onLayout={() => {
				if (isLast) {
					console.log("Last", poi);
				}
			}}
		>
			<PointAnnotation
				key={`transport-${poi.properties?.ref_id}-${index}`}
				id={`transport-${poi.properties?.ref_id}-${index}`}
				coordinate={pointGeometry.coordinates as [number, number]}
				onSelected={() => onFeaturePress(poi.properties?.ref_id || -1)}
			>
				<View style={[styles.pinContainer]}>
					<Text style={styles.pinText}>{pinIcon}</Text>
				</View>
				<Callout title={poi.properties?.name || "Transport Stop"} />
			</PointAnnotation>
		</View>
	);
};

const styles = StyleSheet.create({
	pinContainer: {
		width: 60,
		height: 60,
		borderRadius: 10,
		backgroundColor: "transparent",
		justifyContent: "center",
		alignItems: "center",
	},
	pinText: {
		fontSize: 24,
	},
});

MapPointAnnotation.displayName = "MapPointAnnotation";

export default MapPointAnnotation;
