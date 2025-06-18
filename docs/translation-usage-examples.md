# Translation Implementation Guide

## Overview

The Spark app now implements comprehensive internationalization (i18n) support using `react-i18next` with Redux Toolkit for language state management. The app supports English and Turkish languages.

## Key Components Updated

### 1. Translation Hook Usage

```typescript
import { useTranslation } from "@/lib/i18n/hooks";

const { t } = useTranslation();
const translatedText = t("auth.sign_up"); // Returns "Sign Up" in EN, "Kayıt Ol" in TR
```

### 2. Auth Screens

- **Sign Up** (`app/sign-up.tsx`): All form labels, placeholders, validation messages, and buttons
- **Sign In** (`app/sign-in.tsx`): Form fields and button text
- **Welcome** (`app/welcome.tsx`): App title, description, and action buttons

### 3. Settings Screen

- Dynamic greetings based on time of day
- Account section labels and descriptions
- Language selection component

### 4. Navigation

- Tab bar labels for Map, Blog, and Settings tabs

### 5. Blog Categories

- All blog category names use translation keys
- Category selection dropdown shows localized names

### 6. POI Categories

- Map point-of-interest categories (Food & Drink, Transportation) now use translation keys
- POI category select component shows localized names

### 7. Reviews System

- Review action buttons (Add/Edit Review)
- Empty states and loading messages

### 8. Map Components

- Map filter bottom sheet (titles, descriptions, district search)
- District select component (placeholder text)

### 9. Common UI Elements

- Generic FlatList empty states
- Select component placeholders
- Loading and error states

## Translation File Structure

### English (`lib/i18n/locales/en.json`)

```json
{
  "translation": {
    "common": { "loading": "Loading...", "save": "Save", ... },
    "auth": { "sign_up": "Sign Up", "email": "Email", ... },
    "settings": { "title": "Settings", "language": "Language", ... },
    "greetings": { "good_morning": "Good morning", ... },
    "reviews": { "add_review": "Add Review", ... },
    "blog": { "categories": { "self_defense": "Self Defense", ... } },
    "navigation": { "map": "Map", "blog": "Blog", ... },
    "select": { "placeholder": "Select an option", ... },
    "map": {
      "filters": {
        "title": "Map Filters",
        "description": "Choose what to search for",
        "search_district": "Search district"
      }
    },
    "errors": { "general_error": "Something went wrong", ... },
    "empty_states": { "no_data": "No data available", ... }
  }
}
```

### Turkish (`lib/i18n/locales/tr.json`)

Corresponding Turkish translations for all keys.

## Category Translation Patterns

### Blog Categories (`utils/blog.ts`)

```typescript
export const getCategoryTranslationKey = (category: BlogCategory): string => {
	const categoryKeyMap: Record<BlogCategory, string> = {
		[BlogCategory.SelfDefense]: "blog.categories.self_defense",
		[BlogCategory.TedTalks]: "blog.categories.ted_talks",
		// ... other categories
	};
	return categoryKeyMap[category] || category;
};
```

### Usage in Components

```typescript
// In CategorySelect component
const categoryOptions = Object.values(BlogCategory).map((category) => ({
	label: t(getCategoryTranslationKey(category)),
	value: category,
}));
```

### POI Categories (`services/poi-service.ts`)

```typescript
export const getPOICategoryTranslationKey = (
	category: OverPassCategory,
): string => {
	const categoryKeyMap: Record<OverPassCategory, string> = {
		[OverPassCategory.FOOD_AND_DRINK]: "map.poi_categories.food_and_drink",
		[OverPassCategory.TRANSPORTATION]: "map.poi_categories.transportation",
	};
	return categoryKeyMap[category] || category;
};

export const getPOICategoriesWithTranslations = (
	t: (key: string) => string,
): POICategoryDefinition[] => [
	{
		label: t(getPOICategoryTranslationKey(OverPassCategory.FOOD_AND_DRINK)),
		value: OverPassCategory.FOOD_AND_DRINK,
		key: OverPassCategory.FOOD_AND_DRINK,
	},
	// ... other categories
];
```

### Usage in POI Components

```typescript
// In POICategorySelect component
const dropdownItems = useMemo(() => {
	return getPOICategoriesWithTranslations(t);
}, [t]);
```

## Dynamic Content with Interpolation

### Time-based Greetings

```typescript
const getGreeting = () => {
	const hour = new Date().getHours();
	if (hour < 12) return t("greetings.good_morning");
	if (hour < 18) return t("greetings.good_afternoon");
	return t("greetings.good_evening");
};
```

### Count-based Pluralization

```json
{
	"reviews": {
		"based_on_reviews": "Based on {{count}} review",
		"based_on_reviews_plural": "Based on {{count}} reviews"
	}
}
```

## Language Switching

The language can be changed through:

1. **Settings Screen**: Language select component in settings
2. **Redux State**: Language preference is stored in Redux and persisted to AsyncStorage
3. **i18next Integration**: Changes automatically update all translated text throughout the app

## Form Validation with Translations

Validation schemas now use translation functions:

```typescript
const getFormSchema = (t: any) =>
	z.object({
		email: z.string().email(t("auth.validation.email_invalid")),
		password: z.string().min(6, t("auth.validation.password_min_length")),
	});
```

## Best Practices Implemented

1. **Consistent Key Structure**: Organized by feature/screen (auth, settings, reviews, etc.)
2. **Fallback Values**: Translation keys as fallbacks for missing translations
3. **Dynamic Schema**: Form validation messages use translations
4. **Context Awareness**: Greetings and other dynamic content adapt to language
5. **Performance**: Minimal re-renders with proper hook usage
6. **Type Safety**: TypeScript integration with i18next for better DX

## Files Modified for Translation Support

- `lib/i18n/locales/en.json` - English translations
- `lib/i18n/locales/tr.json` - Turkish translations
- `lib/i18n/hooks.ts` - Translation hooks
- `utils/blog.ts` - Blog category translation keys
- `app/sign-up.tsx` - Auth form translations
- `app/sign-in.tsx` - Auth form translations
- `app/welcome.tsx` - Welcome screen translations
- `app/(protected)/(tabs)/settings-screen.tsx` - Settings translations
- `app/(protected)/(tabs)/_layout.tsx` - Navigation labels
- `app/(protected)/(tabs)/blog-screen.tsx` - Blog screen translations
- `components/select/category-select.tsx` - Category translations
- `components/select/poi-category-select.tsx` - POI category translations
- `components/bottom-sheet/feature-info-bottom-sheet.tsx` - Review button translations
- `components/reviews/review-form.tsx` - Review form translations
- `app/(protected)/(tabs)/map/[id].tsx` - Review screen translations
- `components/bottom-sheet/map-filter-bottom-sheet.tsx` - Map filter translations
- `components/select/district-select.tsx` - District select translations
- `services/poi-service.ts` - POI category translation keys

The implementation provides a solid foundation for internationalization that can be easily extended to support additional languages in the future.
