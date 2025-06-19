// lib/routes.ts

import { Href } from "expo-router";

const tabsPath = "(protected)/(tabs)";
const mapPath = tabsPath + "/map";
const feedPath = tabsPath + "/feed";

export const routes = {
	// ─── Map Feature Routes ───────────────────────────────────────
	mapFeatureReview: (id: string) =>
		`${mapPath}/${encodeURIComponent(id)}/feature-review` as Href,

	// ─── Feed/Post Routes ─────────────────────────────────────────
	postDetail: (id: string) => `${feedPath}/${encodeURIComponent(id)}` as Href,

	postUpdate: (id: string) =>
		`${feedPath}/${encodeURIComponent(id)}/update-post` as Href,

	postCreate: () => `${feedPath}/create-post` as Href,

	// ─── Tab Screens ──────────────────────────────────────────────
	blogScreen: () => `${tabsPath}/blog-screen` as Href,

	settingsScreen: () => `${tabsPath}/settings-screen` as Href,

	// ─── Auth Screens ─────────────────────────────────────────────
	signIn: () => `/sign-in` as Href,
	signUp: () => `/sign-up` as Href,
	tos: () => `/tos` as Href,
	welcome: () => `/welcome` as Href,
};
