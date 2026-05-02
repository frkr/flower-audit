import { RemixI18Next } from "remix-i18next/server";
import { supportedLngs, fallbackLng, LANG_COOKIE } from "./i18n";

export const i18nServer = new RemixI18Next({
	detection: {
		supportedLanguages: [...supportedLngs],
		fallbackLanguage: fallbackLng,
		cookie: LANG_COOKIE,
		order: ["cookie", "header"],
	},
});
