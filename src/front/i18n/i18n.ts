export const supportedLngs = ["en", "pt-BR", "es", "de", "ru", "zh", "zh-CN", "ja", "ko"] as const;
export type Locale = (typeof supportedLngs)[number];
export const fallbackLng: Locale = "en";
export const LANG_COOKIE = "flower_lang";

export const localeNames: Record<Locale, string> = {
	en: "English",
	"pt-BR": "Português (BR)",
	es: "Español",
	de: "Deutsch",
	ru: "Русский",
	zh: "中文 (繁體)",
	"zh-CN": "中文 (简体)",
	ja: "日本語",
	ko: "한국어",
};
