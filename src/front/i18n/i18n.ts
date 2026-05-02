import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import ptBR from "./locales/pt-BR";
import es from "./locales/es";
import de from "./locales/de";
import ru from "./locales/ru";
import zhTW from "./locales/zh-TW";
import zhCN from "./locales/zh-CN";
import ja from "./locales/ja";
import ko from "./locales/ko";

export const SUPPORTED_LANGUAGES = [
	{ code: "en", label: "English" },
	{ code: "pt-BR", label: "Português (Brasil)" },
	{ code: "es", label: "Español" },
	{ code: "de", label: "Deutsch" },
	{ code: "ru", label: "Русский" },
	{ code: "zh-TW", label: "中文（繁體）" },
	{ code: "zh-CN", label: "中文（简体）" },
	{ code: "ja", label: "日本語" },
	{ code: "ko", label: "한국어" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);
const STORAGE_KEY = "flower_language";

function detectLanguage(): LanguageCode {
	if (typeof window === "undefined") return "en";
	const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
	if (stored && SUPPORTED_CODES.includes(stored)) return stored;
	const nav = navigator.language || "en";
	if (SUPPORTED_CODES.includes(nav as LanguageCode)) return nav as LanguageCode;
	const prefix = nav.split("-")[0];
	const match = SUPPORTED_CODES.find((c) => c === prefix || c.startsWith(prefix + "-"));
	return (match as LanguageCode) ?? "en";
}

export function saveLanguage(code: LanguageCode) {
	if (typeof window !== "undefined") {
		localStorage.setItem(STORAGE_KEY, code);
	}
}

export function getStoredLanguage(): LanguageCode | null {
	if (typeof window === "undefined") return null;
	const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
	if (stored && SUPPORTED_CODES.includes(stored)) return stored;
	return null;
}

const resources = {
	en: { translation: en },
	"pt-BR": { translation: ptBR },
	es: { translation: es },
	de: { translation: de },
	ru: { translation: ru },
	"zh-TW": { translation: zhTW },
	"zh-CN": { translation: zhCN },
	ja: { translation: ja },
	ko: { translation: ko },
};

let initialized = false;

export function initI18n() {
	if (initialized) return i18next;
	initialized = true;

	const lng = detectLanguage();

	i18next.use(initReactI18next).init({
		resources,
		lng,
		fallbackLng: "en",
		interpolation: { escapeValue: false },
	});

	return i18next;
}

export function changeLanguage(code: LanguageCode) {
	saveLanguage(code);
	i18next.changeLanguage(code);
}

export default i18next;
