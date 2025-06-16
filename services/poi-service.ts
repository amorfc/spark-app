import { OverPassCategory } from "@/services/overpass-service";

export interface POICategoryDefinition {
	label: string;
	icon?: string;
	value: OverPassCategory;
	key: OverPassCategory;
}

/**
 * Get POI category translation key mapping
 * @param category - OverPass category enum
 * @returns Translation key for the category
 */
export const getPOICategoryTranslationKey = (
	category: OverPassCategory,
): string => {
	const categoryKeyMap: Record<OverPassCategory, string> = {
		[OverPassCategory.FOOD_AND_DRINK]: "map.poi_categories.food_and_drink",
		[OverPassCategory.TRANSPORTATION]: "map.poi_categories.transportation",
	};

	return categoryKeyMap[category] || category;
};

export interface POICategoryGroupType {
	FOOD_AND_DRINK: POICategoryDefinition;
	TRANSPORTATION: POICategoryDefinition;
}

export const POICategories: POICategoryDefinition[] = [
	{
		label: getPOICategoryTranslationKey(OverPassCategory.FOOD_AND_DRINK),
		value: OverPassCategory.FOOD_AND_DRINK,
		key: OverPassCategory.FOOD_AND_DRINK,
	},
	{
		label: getPOICategoryTranslationKey(OverPassCategory.TRANSPORTATION),
		value: OverPassCategory.TRANSPORTATION,
		key: OverPassCategory.TRANSPORTATION,
	},
];

/**
 * Get POI categories with translated labels
 * @param t - Translation function
 * @returns Array of POI categories with translated labels
 */
export const getPOICategoriesWithTranslations = (
	t: (key: string) => string,
): POICategoryDefinition[] => [
	{
		label: t(getPOICategoryTranslationKey(OverPassCategory.FOOD_AND_DRINK)),
		value: OverPassCategory.FOOD_AND_DRINK,
		key: OverPassCategory.FOOD_AND_DRINK,
	},
	{
		label: t(getPOICategoryTranslationKey(OverPassCategory.TRANSPORTATION)),
		value: OverPassCategory.TRANSPORTATION,
		key: OverPassCategory.TRANSPORTATION,
	},
];
