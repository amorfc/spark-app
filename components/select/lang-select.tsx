import React, {
	useState,
	useCallback,
	useMemo,
	forwardRef,
	useEffect,
} from "react";
import { ItemType } from "react-native-dropdown-picker";
import { Select, SelectProps, SelectRef } from "@/components/select/select";
import i18n from "@/lib/i18n/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

type ValueType = string;

interface LangSelectItem extends ItemType<ValueType> {
	label: string;
	value: ValueType;
	name: string;
}

interface LangSelectProps
	extends Omit<SelectProps<ValueType>, "value" | "originalItems" | "setValue"> {
	useModal?: boolean;
}

export const LangSelect = forwardRef<SelectRef, LangSelectProps>(
	({ useModal = false, ...props }) => {
		const [value, setValue] = useState<ValueType | null>(null);
		const {
			i18n: { language },
		} = useTranslation();

		const handleSelectItem = useCallback((selectedItem: LangSelectItem) => {
			const changeLanguage = async (lang: "en" | "tr") => {
				await i18n.changeLanguage(lang);
				await AsyncStorage.setItem("app-language", lang);
			};

			changeLanguage(selectedItem.value as "en" | "tr");
		}, []);

		const dropdownItems: ItemType<ValueType>[] = useMemo(() => {
			return [
				{ label: "🇺🇸 English", value: "en" as ValueType },
				{ label: "🇹🇷 Türkçe", value: "tr" as ValueType },
			];
		}, []);

		useEffect(() => {
			if (language !== value) {
				setValue(language as ValueType);
			}
		}, [language, value]);

		return (
			<Select
				value={value}
				originalItems={dropdownItems}
				setValue={setValue}
				onSelectItem={handleSelectItem}
				searchable={false}
				{...props}
			/>
		);
	},
);

LangSelect.displayName = "LangSelect";

export default LangSelect;
