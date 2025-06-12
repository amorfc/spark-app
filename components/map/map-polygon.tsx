import { ShapeSource, FillLayer, LineLayer } from "@rnmapbox/maps";
import { usePolygonStyle } from "@/hooks/usePolygonStyle";
import { useCallback } from "react";

export interface MapRef {
	centerOnCoordinates: (
		coordinates: [number, number],
		zoomLevel?: number,
	) => void;
}

interface MapPolygonProps {
	shape: GeoJSON.Feature;
	onPolygonPress?: (payload: GeoJSON.Feature) => void;
	variant?: "subtle" | "moderate" | "vibrant";
}

const MapPolygon = ({
	shape,
	onPolygonPress,
	variant = "subtle",
}: MapPolygonProps) => {
	const polygonStyle = usePolygonStyle({
		id: shape?.id || "none",
		variant,
	});

	const handleOnPolygonPress = useCallback(() => {
		onPolygonPress?.(shape);
	}, [onPolygonPress, shape]);

	return (
		<ShapeSource
			key={`feature-source-${shape?.id || "none"}`}
			id="feature-source"
			shape={shape}
			onPress={handleOnPolygonPress}
		>
			<FillLayer id="feature-fill" style={polygonStyle} />
			<LineLayer
				id="feature-line"
				style={{
					lineColor: "#78350F",
					lineWidth: 1,
					lineOpacity: 0.5,
				}}
			/>
		</ShapeSource>
	);
};

MapPolygon.displayName = "MapPolygon";

export default MapPolygon;
