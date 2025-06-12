import { OverPassCategory } from "@/services/overpass-service";

export interface POICategoryDefinition {
	label: string;
	icon?: string;
	value: OverPassCategory;
	key: OverPassCategory;
}

export interface POICategoryGroupType {
	FOOD_AND_DRINK: POICategoryDefinition;
	TRANSPORTATION: POICategoryDefinition;
}

export const POICategories: POICategoryDefinition[] = [
	{
		label: "🍽️ Food & Drink",
		value: OverPassCategory.FOOD_AND_DRINK,
		key: OverPassCategory.FOOD_AND_DRINK,
	},
	{
		label: "🚌 Transportation",
		value: OverPassCategory.TRANSPORTATION,
		key: OverPassCategory.TRANSPORTATION,
	},
];
