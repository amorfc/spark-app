import { OverPassCategory } from "@/services/overpass-service";

export interface POICategoryDefinition {
	label: string;
	icon: string;
	key: OverPassCategory;
}

export interface POICategoryGroupType {
	FOOD_AND_DRINK: POICategoryDefinition;
	TRANSPORTATION: POICategoryDefinition;
}

export const POICategoryGroup: POICategoryGroupType = {
	FOOD_AND_DRINK: {
		label: "Food & Drink",
		icon: "🍽️",
		key: OverPassCategory.FOOD_AND_DRINK,
	},
	TRANSPORTATION: {
		label: "Transportation",
		icon: "🚌",
		key: OverPassCategory.TRANSPORTATION,
	},
};
