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

const MapPointAnnotation = ({
	poi,
	id,
	onSelected,
}: MapPointAnnotationProps) => {
	const pointGeometry = poi.geometry as GeoJSON.Point;
	const { icon } = useFeatureMetadata(poi);

	return (
		<PointAnnotation
			id={id}
			coordinate={pointGeometry.coordinates as [number, number]}
			onSelected={onSelected}
		>
			<View style={[styles.pinContainer]}>
				<Text style={styles.pinText}>{icon}</Text>
			</View>
			<Callout title={poi.properties?.name || "Transport Stop"} />
		</PointAnnotation>
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
