import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import ru from "./locales/ru.json";
import zh from "./locales/zh.json";
import zhCN from "./locales/zh-CN.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";

export const allResources = {
	en: { translation: en },
	"pt-BR": { translation: ptBR },
	es: { translation: es },
	de: { translation: de },
	ru: { translation: ru },
	zh: { translation: zh },
	"zh-CN": { translation: zhCN },
	ja: { translation: ja },
	ko: { translation: ko },
} as const;
