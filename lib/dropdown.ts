import { ItemType } from "react-native-dropdown-picker";

export function mapFeatureCollectionToDropdownItems<T>(
	data: GeoJSON.FeatureCollection,
): ItemType<T>[] {
	return data.features
		.map((feature) => {
			const name = feature.properties?.name;
			const id = feature.properties?.id.toString() || name;

			return name
				? {
						label: name,
						value: id,
					}
				: null;
		})
		.filter((item) => item !== null) as ItemType<T>[];
}
