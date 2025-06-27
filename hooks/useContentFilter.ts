import { useBannedKeywords } from "@/hooks/useModeration";
import { getContentVisibility } from "@/utils/content-filter";

export const useContentFilter = () => {
	const { data: keywords = [], isLoading } = useBannedKeywords();

	const filterText = (text: string) => {
		if (isLoading || !text) {
			return {
				shouldShow: true,
				shouldFilter: false,
				filteredText: text,
				warning: "",
				severity: "none",
			};
		}

		return getContentVisibility(text, keywords);
	};

	return {
		filterText,
		isLoading,
		keywords,
	};
};
