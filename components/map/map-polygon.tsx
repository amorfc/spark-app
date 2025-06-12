import { ShapeSource, FillLayer, LineLayer } from "@rnmapbox/maps";
import { usePolygonStyle } from "@/hooks/usePolygonStyle";

export interface MapRef {
	centerOnCoordinates: (
		coordinates: [number, number],
		zoomLevel?: number,
	) => void;
}

interface MapPolygonProps {
	shape: GeoJSON.Feature;
	variant?: "subtle" | "moderate" | "vibrant";
}

const MapPolygon = ({ shape, variant = "subtle" }: MapPolygonProps) => {
	const polygonStyle = usePolygonStyle({
		id: shape?.id || "none",
		variant,
	});

	return (
		<ShapeSource
			key={`feature-source-${shape?.id || "none"}`}
			id="feature-source"
			shape={shape}
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
