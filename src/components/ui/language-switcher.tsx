import { LANGUAGES, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.a11y.languageSwitcher}
      className={cn("flex items-center gap-1", className)}
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
              "rounded-full px-2.5 py-1.5 font-display text-xs font-bold tracking-[0.12em] transition-colors duration-200",
              active
                ? "text-primary underline decoration-primary decoration-2 underline-offset-4"
                : "text-subtle hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
