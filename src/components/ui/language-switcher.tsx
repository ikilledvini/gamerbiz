import { LANGUAGES, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.a11y.languageSwitcher}
      className={cn("flex items-center gap-4", className)}
    >
      {LANGUAGES.map((option) => {
        const active = option.code === lang;
        return (
          <button
            key={option.code}
            type="button"
            lang={option.code}
            aria-current={active ? "true" : undefined}
            onClick={() => setLang(option.code)}
            className={cn(
              "text-sm font-bold tracking-tight transition-colors duration-200",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
