import { supabase } from "@/config/supabase";
import {
	Report,
	CreateReportData,
	BlockedUser,
	BlockUserData,
	BannedKeyword,
	ReportsResponse,
	BlockedUsersResponse,
} from "@/types/moderation";

// Report functions
export const createReport = async (data: CreateReportData): Promise<Report> => {
	const { data: report, error } = await supabase
		.from("reports")
		.insert([
			{
				...data,
				reporter_id: (await supabase.auth.getUser()).data.user?.id,
			},
		])
		.select("*")
		.single();

	if (error) {
		console.error("Error creating report:", error);
		throw new Error(error.message);
	}

	return report;
};

export const getMyReports = async (
	limit = 10,
	offset = 0,
): Promise<ReportsResponse> => {
	const {
		data: reports,
		error,
		count,
	} = await supabase
		.from("reports")
		.select("*", { count: "exact" })
		.eq("reporter_id", (await supabase.auth.getUser()).data.user?.id)
		.order("created_at", { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		console.error("Error fetching reports:", error);
		throw new Error(error.message);
	}

	return {
		reports: reports || [],
		total: count || 0,
	};
};

// Blocking functions
export const blockUser = async (data: BlockUserData): Promise<BlockedUser> => {
	const { data: block, error } = await supabase
		.from("blocked_users")
		.insert([
			{
				...data,
				blocker_id: (await supabase.auth.getUser()).data.user?.id,
			},
		])
		.select("*")
		.single();

	if (error) {
		console.error("Error blocking user:", error);
		throw new Error(error.message);
	}

	return block;
};

export const unblockUser = async (blocked_id: string): Promise<void> => {
	const { error } = await supabase
		.from("blocked_users")
		.delete()
		.eq("blocker_id", (await supabase.auth.getUser()).data.user?.id)
		.eq("blocked_id", blocked_id);

	if (error) {
		console.error("Error unblocking user:", error);
		throw new Error(error.message);
	}
};

export const getBlockedUsers = async (
	limit = 10,
	offset = 0,
): Promise<BlockedUsersResponse> => {
	const {
		data: blocked_users,
		error,
		count,
	} = await supabase
		.from("blocked_users")
		.select("*", { count: "exact" })
		.eq("blocker_id", (await supabase.auth.getUser()).data.user?.id)
		.order("created_at", { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		console.error("Error fetching blocked users:", error);
		throw new Error(error.message);
	}

	return {
		blocked_users: blocked_users || [],
		total: count || 0,
	};
};

export const isUserBlocked = async (user_id: string): Promise<boolean> => {
	const { data, error } = await supabase
		.from("blocked_users")
		.select("id")
		.eq("blocker_id", (await supabase.auth.getUser()).data.user?.id)
		.eq("blocked_id", user_id)
		.maybeSingle();

	if (error) {
		console.error("Error checking if user is blocked:", error);
		return false;
	}

	return !!data;
};

// Keyword filtering functions
export const getBannedKeywords = async (): Promise<BannedKeyword[]> => {
	const { data: keywords, error } = await supabase
		.from("banned_keywords")
		.select("*")
		.eq("is_active", true)
		.order("keyword");

	if (error) {
		console.error("Error fetching banned keywords:", error);
		throw new Error(error.message);
	}

	return keywords || [];
};

// Content filtering utilities
export const containsBannedKeywords = (
	text: string,
	keywords: BannedKeyword[],
): { hasBanned: boolean; severity: string } => {
	const lowerText = text.toLowerCase();
	let maxSeverity = "none";
	let hasBanned = false;

	for (const keyword of keywords) {
		if (lowerText.includes(keyword.keyword.toLowerCase())) {
			hasBanned = true;
			if (keyword.severity === "high") {
				maxSeverity = "high";
			} else if (keyword.severity === "moderate" && maxSeverity !== "high") {
				maxSeverity = "moderate";
			} else if (keyword.severity === "low" && maxSeverity === "none") {
				maxSeverity = "low";
			}
		}
	}

	return { hasBanned, severity: maxSeverity };
};

export const filterContent = (
	text: string,
	keywords: BannedKeyword[],
): string => {
	let filteredText = text;

	for (const keyword of keywords) {
		const regex = new RegExp(keyword.keyword, "gi");
		filteredText = filteredText.replace(
			regex,
			"*".repeat(keyword.keyword.length),
		);
	}

	return filteredText;
};
