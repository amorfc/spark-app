import { PointAnnotation, Callout } from "@rnmapbox/maps";
import { Text, View, StyleSheet } from "react-native";

import { useFeatureMetadata } from "@/hooks/useFeatureMetadata";

export interface MapRef {
	centerOnCoordinates: (
		coordinates: [number, number],
		zoomLevel?: number,
	) => void;
}

export interface MapPointAnnotationProps {
	poi: GeoJSON.Feature;
	id: string;
	onSelected: (payload: any) => void;
}

const MapPointAnnotation = ({ poi, id, ...props }: MapPointAnnotationProps) => {
	const pointGeometry = poi.geometry as GeoJSON.Point;
	const { icon } = useFeatureMetadata(poi);

	return (
		<PointAnnotation
			id={id}
			coordinate={pointGeometry.coordinates as [number, number]}
			{...props}
		>
			<View style={[styles.pinContainer]}>
				<Text style={styles.iconText}>{icon}</Text>
			</View>
			<Callout title={poi.properties?.name || "Transport Stop"} />
		</PointAnnotation>
	);
};

const styles = StyleSheet.create({
	pinContainer: {
		minWidth: 60,
		minHeight: 60,
		borderRadius: 10,
		backgroundColor: "rgba(255, 255, 255, 0.8)",
		justifyContent: "center",
		alignItems: "center",
		padding: 4,
	},
	iconText: {
		fontSize: 24,
		textAlign: "center",
	},
});

MapPointAnnotation.displayName = "MapPointAnnotation";

export default MapPointAnnotation;
