import type { LangCode } from "@/i18n";

export type LegalLanguageSlug = "pt" | "en" | "es" | "zh";
export type LegalRouteKind = "privacy" | "tos";

const LANGUAGE_TO_SLUG: Record<LangCode, LegalLanguageSlug> = {
  "pt-BR": "pt",
  en: "en",
  es: "es",
  "zh-CN": "zh",
};

const SLUG_TO_LANGUAGE: Record<LegalLanguageSlug, LangCode> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
  zh: "zh-CN",
};

export function toLegalLanguageSlug(lang: LangCode) {
  return LANGUAGE_TO_SLUG[lang];
}

export function fromLegalLanguageSlug(slug: string): LangCode | null {
  return slug === "pt" || slug === "en" || slug === "es" || slug === "zh"
    ? SLUG_TO_LANGUAGE[slug]
    : null;
}

export function legalPath(kind: LegalRouteKind, lang: LangCode) {
  return `/${kind}/${toLegalLanguageSlug(lang)}`;
}
