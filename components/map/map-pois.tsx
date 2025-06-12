import { View } from "react-native";
import MapPointAnnotation from "./map-point-annotation";
import { useCallback } from "react";

export interface MapPoisProps {
	pois: GeoJSON.Feature[];
	onPointPress: (payload: GeoJSON.Feature) => void;
}

export const MapPois = ({ pois, onPointPress }: MapPoisProps) => {
	const handleOnPointPress = useCallback(
		(selectedPoi: any) => {
			const foundPoi = pois.find((p) => p.properties?.id === selectedPoi.id);

			if (foundPoi) {
				onPointPress(foundPoi);
			}
		},
		[onPointPress, pois],
	);
	return (
		<View>
			{pois
				?.filter(Boolean)
				?.filter((poi: GeoJSON.Feature) => poi.properties?.id)
				?.filter(
					(poi: GeoJSON.Feature) =>
						poi.geometry?.type === "Point" && poi.geometry.coordinates,
				)
				?.map((poi: GeoJSON.Feature, index: number) => {
					const id = poi.properties?.id;
					return (
						<MapPointAnnotation
							key={id}
							id={id}
							poi={poi}
							onSelected={handleOnPointPress}
						/>
					);
				})}
		</View>
	);
};
