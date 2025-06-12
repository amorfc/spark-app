import React from "react";
import { View } from "react-native";
import { FeatureReviews } from "@/components/reviews";
import { OSMFeature } from "@/types/osm";

interface LocationReviewsProps {
	feature: OSMFeature;
}

/**
 * Example component showing how to integrate reviews with your GeoJSON features
 * Use this component wherever you want to display reviews for a location
 */
const LocationReviews: React.FC<LocationReviewsProps> = ({ feature }) => {
	return (
		<View className="flex-1">
			<FeatureReviews
				featureRefId={feature.ref_id}
				featureName={feature.name || undefined}
			/>
		</View>
	);
};

export { LocationReviews };

/*
USAGE EXAMPLES:

1. In a modal or bottom sheet:
```tsx
import { LocationReviews } from "@/components/reviews/example-usage";

<BottomSheet>
  <LocationReviews feature={selectedFeature} />
</BottomSheet>
```

2. In a dedicated reviews screen:
```tsx
import { LocationReviews } from "@/components/reviews/example-usage";

export default function ReviewsScreen({ route }) {
  const { feature } = route.params;
  
  return (
    <SafeAreaView className="flex-1">
      <LocationReviews feature={feature} />
    </SafeAreaView>
  );
}
```

3. As a tab in a feature detail screen:
```tsx
import { LocationReviews } from "@/components/reviews/example-usage";

<Tab.Screen 
  name="Reviews" 
  component={() => <LocationReviews feature={feature} />} 
/>
```
*/
