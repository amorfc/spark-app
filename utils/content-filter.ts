import { BannedKeyword } from "@/types/moderation";

// Simple content filter that replaces banned words with asterisks
export const filterContent = (
	text: string,
	keywords: BannedKeyword[],
): string => {
	if (!text || keywords.length === 0) return text;

	let filteredText = text;

	for (const keyword of keywords) {
		const regex = new RegExp(`\\b${escapeRegExp(keyword.keyword)}\\b`, "gi");
		const replacement = "*".repeat(keyword.keyword.length);
		filteredText = filteredText.replace(regex, replacement);
	}

	return filteredText;
};

// Check if content contains banned keywords
export const containsBannedKeywords = (
	text: string,
	keywords: BannedKeyword[],
): { hasBanned: boolean; severity: string; matchedKeywords: string[] } => {
	if (!text || keywords.length === 0) {
		return { hasBanned: false, severity: "none", matchedKeywords: [] };
	}

	const lowerText = text.toLowerCase();
	let maxSeverity = "none";
	let hasBanned = false;
	const matchedKeywords: string[] = [];

	for (const keyword of keywords) {
		const regex = new RegExp(`\\b${escapeRegExp(keyword.keyword)}\\b`, "i");
		if (regex.test(lowerText)) {
			hasBanned = true;
			matchedKeywords.push(keyword.keyword);

			// Update severity hierarchy: high > moderate > low
			if (keyword.severity === "high") {
				maxSeverity = "high";
			} else if (keyword.severity === "moderate" && maxSeverity !== "high") {
				maxSeverity = "moderate";
			} else if (keyword.severity === "low" && maxSeverity === "none") {
				maxSeverity = "low";
			}
		}
	}

	return { hasBanned, severity: maxSeverity, matchedKeywords };
};

// More aggressive filter that hides content entirely for high-severity keywords
export const shouldHideContent = (
	text: string,
	keywords: BannedKeyword[],
): boolean => {
	const { hasBanned, severity } = containsBannedKeywords(text, keywords);
	return hasBanned && severity === "high";
};

// Get warning message based on severity
export const getContentWarning = (severity: string): string => {
	switch (severity) {
		case "high":
			return "This content has been hidden due to community guidelines.";
		case "moderate":
			return "This content contains inappropriate language and has been filtered.";
		case "low":
			return "This content may contain mild language.";
		default:
			return "";
	}
};

// Escape special regex characters
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Get content visibility level
export const getContentVisibility = (
	text: string,
	keywords: BannedKeyword[],
): {
	shouldShow: boolean;
	shouldFilter: boolean;
	filteredText: string;
	warning: string;
	severity: string;
} => {
	const { hasBanned, severity } = containsBannedKeywords(text, keywords);

	if (!hasBanned) {
		return {
			shouldShow: true,
			shouldFilter: false,
			filteredText: text,
			warning: "",
			severity: "none",
		};
	}

	const shouldHide = severity === "high";
	const shouldFilter = severity === "moderate" || severity === "low";

	return {
		shouldShow: !shouldHide,
		shouldFilter,
		filteredText: shouldFilter ? filterContent(text, keywords) : text,
		warning: getContentWarning(severity),
		severity,
	};
};
