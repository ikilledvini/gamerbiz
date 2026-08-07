import { LANGUAGES, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.a11y.languageSwitcher}
      className={cn("grid grid-cols-2 grid-rows-2 gap-1", className)}
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
              "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold tracking-tight transition-colors duration-200",
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-background/80 text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
