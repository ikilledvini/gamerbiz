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
              "gbz-interactive text-sm font-bold tracking-tight transition-[transform,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.96]",
              active ? "text-primary" : "text-muted-foreground fine-hover:hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
