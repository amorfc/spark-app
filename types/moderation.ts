export interface Report {
	id: string;
	reporter_id: string;
	reported_post_id?: string;
	reported_review_id?: string;
	reported_post_review_id?: string;
	reported_user_id?: string;
	report_type: ReportType;
	description?: string;
	status: ReportStatus;
	reviewed_by?: string;
	reviewed_at?: string;
	admin_notes?: string;
	created_at: string;
	updated_at: string;
}

export type ReportType =
	| "inappropriate_content"
	| "spam"
	| "harassment"
	| "hate_speech"
	| "violence"
	| "misinformation"
	| "copyright"
	| "other";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface BlockedUser {
	id: string;
	blocker_id: string;
	blocked_id: string;
	created_at: string;
}

export interface BannedKeyword {
	id: string;
	keyword: string;
	severity: "low" | "moderate" | "high";
	created_by?: string;
	created_at: string;
	is_active: boolean;
}

// Form data types
export interface CreateReportData {
	report_type: ReportType;
	description?: string;
	reported_post_id?: string;
	reported_review_id?: string;
	reported_post_review_id?: string;
	reported_user_id?: string;
}

export interface BlockUserData {
	blocked_id: string;
}

// API response types
export interface ReportsResponse {
	reports: Report[];
	total: number;
}

export interface BlockedUsersResponse {
	blocked_users: BlockedUser[];
	total: number;
}
