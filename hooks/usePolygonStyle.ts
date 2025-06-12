import { useMemo } from "react";

/**
 * Props for the usePolygonStyle hook
 */
export interface UsePolygonStyleProps {
	id: string | number;
	/**
	 * Visual variant for styling intensity
	 * - subtle: Low visual impact (light colors, low opacity)
	 * - moderate: Balanced visual impact (medium colors, medium opacity)
	 * - vibrant: High visual impact (strong colors, high opacity)
	 */
	variant?: "subtle" | "moderate" | "vibrant";
}

/**
 * Color configuration for each variant
 */
export interface ColorVariant {
	selected: string;
	unselected: string;
	selectedOpacity: number;
	unselectedOpacity: number;
	outlineColor: string;
}

/**
 * Available style variants
 */
export type StyleVariant = "subtle" | "moderate" | "vibrant";

// Define color variants from design perspective (static data) - Yellow to Brown palette
const colorVariants: Record<StyleVariant, ColorVariant> = {
	subtle: {
		selected: "#FEF3C7", // Very light yellow (yellow-50)
		unselected: "#FFFBEB", // Cream white (amber-50)
		selectedOpacity: 0.25,
		unselectedOpacity: 0.1,
		outlineColor: "#D97706", // Amber-600
	},
	moderate: {
		selected: "#FCD34D", // Medium yellow (amber-300)
		unselected: "#FEF3C7", // Light yellow (yellow-100)
		selectedOpacity: 0.5,
		unselectedOpacity: 0.2,
		outlineColor: "#92400E", // Amber-800
	},
	vibrant: {
		selected: "#F59E0B", // Bright amber (amber-500)
		unselected: "#FDE68A", // Light amber (amber-200)
		selectedOpacity: 0.7,
		unselectedOpacity: 0.3,
		outlineColor: "#78350F", // Amber-900 (dark brown)
	},
};

/**
 * Custom hook for MapBox polygon styling with variant support
 * @param props - Configuration object with selectedFeature and variant
 * @returns MapBox-compatible style object for polygon layers
 */
export const usePolygonStyle = ({
	id,
	variant = "moderate",
}: UsePolygonStyleProps) => {
	return useMemo(() => {
		const colors = colorVariants[variant];
		const equityKey = "id"; // THIS IS THE KEY THAT MAPBOX USES TO MATCH THE POLYGON TO THE FEATURE
		const equals = ["==", ["get", equityKey], id ? id : "none"];

		return {
			fillColor: ["case", equals, colors.selected, colors.unselected],
			fillOpacity: [
				"case",
				equals,
				colors.selectedOpacity,
				colors.unselectedOpacity,
			],
			fillOutlineColor: colors.outlineColor,
		};
	}, [id, variant]);
};
