import { useTranslation } from "@/lib/i18n/hooks";

// Hook for translated time strings in React components
export const useTimeAgo = (date: Date): string => {
	const { t } = useTranslation();
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 30) {
		return t("time.just_now");
	} else if (diffInSeconds < 60) {
		return `${diffInSeconds}${t("time.seconds")}`;
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes}${t("time.minutes")}`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours}${t("time.hours")}`;
	} else {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days}${t("time.days")}`;
	}
};
