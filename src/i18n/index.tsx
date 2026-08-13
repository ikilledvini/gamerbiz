import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ptBR } from "./pt-BR";
import { en } from "./en";
import { es } from "./es";
import { zhCN } from "./zh-CN";
import { LANGUAGES, type Dict, type LangCode } from "./types";

export { LANGUAGES };
export type { Dict, LangCode };

const DICTS: Record<LangCode, Dict> = {
  "pt-BR": ptBR,
  en,
  es,
  "zh-CN": zhCN,
};

const STORAGE_KEY = "gamerbiz.lang";
const DEFAULT_LANG: LangCode = "pt-BR";

type I18nContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: Dict;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLang(value: string | null): value is LangCode {
  return value === "pt-BR" || value === "en" || value === "es" || value === "zh-CN";
}

export function I18nProvider({
  children,
  initialLang,
  onLangChange,
}: {
  children: ReactNode;
  initialLang?: LangCode;
  onLangChange?: (lang: LangCode) => void;
}) {
  const [lang, setLangState] = useState<LangCode>(initialLang ?? DEFAULT_LANG);

  useEffect(() => {
    if (initialLang) return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) setLangState(stored);
  }, [initialLang]);

  useEffect(() => {
    if (initialLang) setLangState(initialLang);
  }, [initialLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    const dict = DICTS[lang];
    document.title = dict.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", dict.meta.description);
  }, [lang]);

  const setLang = useCallback(
    (next: LangCode) => {
      setLangState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* armazenamento indisponível — mantém apenas em memória */
      }
      onLangChange?.(next);
    },
    [onLangChange],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: DICTS[lang] }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n deve ser usado dentro de I18nProvider");
  return ctx;
}
