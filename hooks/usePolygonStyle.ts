import { useMemo } from "react";
import { SelectedFeature } from "@/hooks/useSelectedFeature";

/**
 * Props for the usePolygonStyle hook
 */
export interface UsePolygonStyleProps {
	selectedFeature: SelectedFeature | null;
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

// Define color variants from design perspective (static data)
const colorVariants: Record<StyleVariant, ColorVariant> = {
	subtle: {
		selected: "#E6F3FF", // Very light blue
		unselected: "#F8F9FA", // Almost white
		selectedOpacity: 0.5,
		unselectedOpacity: 0.1,
		outlineColor: "#B0C4DE", // Light steel blue
	},
	moderate: {
		selected: "#FFB6C1", // Light pink
		unselected: "#F0F8FF", // Alice blue
		selectedOpacity: 0.7,
		unselectedOpacity: 0.2,
		outlineColor: "#FF1493", // Deep pink
	},
	vibrant: {
		selected: "#FF6B6B", // Coral red
		unselected: "#FFF5F5", // Very light pink
		selectedOpacity: 0.8,
		unselectedOpacity: 0.3,
		outlineColor: "#DC143C", // Crimson
	},
};

/**
 * Custom hook for MapBox polygon styling with variant support
 * @param props - Configuration object with selectedFeature and variant
 * @returns MapBox-compatible style object for polygon layers
 */
export const usePolygonStyle = ({
	selectedFeature,
	variant = "moderate",
}: UsePolygonStyleProps) => {
	return useMemo(() => {
		const colors = colorVariants[variant];
		const equityKey = "ref_id";
		const equals = [
			"==",
			["get", equityKey],
			selectedFeature ? selectedFeature[equityKey] : -1,
		];

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
	}, [selectedFeature, variant]);
};
