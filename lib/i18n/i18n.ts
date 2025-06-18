// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./locales/en.json";
import tr from "./locales/tr.json";

// Translation resources
const resources = {
	en: en,
	tr: tr,
};

// eslint-disable-next-line import/no-named-as-default-member
const i18nInstance = i18n.use(initReactI18next);

const initI18n = async () => {
	const savedLang = await AsyncStorage.getItem("app-language");
	const deviceLang = Localization.locale.split("-")[0];
	const language = savedLang || deviceLang;

	i18nInstance.init({
		compatibilityJSON: "v4",
		resources,
		fallbackLng: "en",
		lng: language,
		interpolation: {
			escapeValue: false,
		},
	});
};

// Initialize on module load
initI18n();

export default i18nInstance;
