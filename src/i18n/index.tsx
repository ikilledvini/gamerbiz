import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ptBR } from "./pt-BR";
import { en } from "./en";
import { es } from "./es";
import { zhCN } from "./zh-CN";
import { LANGUAGES, type Dict, type LangCode } from "./types";

export { LANGUAGES };
export type { Dict, LangCode };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

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
  overrides,
}: {
  children: ReactNode;
  initialLang?: LangCode | undefined;
  onLangChange?: (lang: LangCode) => void;
  overrides?: Partial<Record<LangCode, DeepPartial<Dict>>>;
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
    if (window.location.pathname === "/") {
      const dict = DICTS[lang];
      document.title = dict.meta.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", dict.meta.description);
    }
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

  const value = useMemo<I18nContextValue>(() => {
    const merge = (base: unknown, extra: unknown): unknown => {
      if (extra === "") return base;
      if (!extra || typeof extra !== "object" || Array.isArray(extra)) return extra ?? base;
      if (!base || typeof base !== "object" || Array.isArray(base)) return extra;
      const result = { ...(base as Record<string, unknown>) };
      for (const [key, nextValue] of Object.entries(extra as Record<string, unknown>)) {
        result[key] = merge(result[key], nextValue);
      }
      return result;
    };
    return {
      lang,
      setLang,
      t: merge(DICTS[lang], overrides?.[lang]) as Dict,
    };
  }, [lang, overrides, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n deve ser usado dentro de I18nProvider");
  return ctx;
}
