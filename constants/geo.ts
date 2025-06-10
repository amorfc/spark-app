export enum CityNames {
	Istanbul = "istanbul",
}
export interface LocationConfig {
	ne1: number; // Northeast longitude
	ne2: number; // Northeast latitude
	sw1: number; // Southwest longitude
	sw2: number; // Southwest latitude
	center1: number; // Center longitude
	center2: number; // Center latitude
}

export interface MapCameraConfig {
	centerCoordinate: [number, number];
	zoomLevel: number;
	animationDuration: number;
	bounds: {
		ne: [number, number];
		sw: [number, number];
	};
}

export const IstanbulLocationConfig: LocationConfig = {
	ne1: 29.5, // Northeast longitude
	ne2: 41.3, // Northeast latitude
	sw1: 28.5, // Southwest longitude
	sw2: 40.8, // Southwest latitude
	center1: 28.9784, // Center longitude (Istanbul center)
	center2: 41.0082, // Center latitude (Istanbul center)
};

// Example: You can easily add more locations in the future
// export const AnkaraLocationConfig: LocationConfig = {
// 	ne1: 33.0, // Northeast longitude
// 	ne2: 40.2, // Northeast latitude
// 	sw1: 32.5, // Southwest longitude
// 	sw2: 39.7, // Southwest latitude
// 	center1: 32.8597, // Center longitude (Ankara center)
// 	center2: 39.9334, // Center latitude (Ankara center)
// };
