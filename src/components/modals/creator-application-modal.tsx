import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { GbzButton } from "@/components/ui/gbz-button";
import { Field, ModalShell, inputClass, textareaClass } from "./modal-shell";

type Errors = Partial<Record<"name" | "email" | "platforms" | "type" | "profiles", string | undefined>>;

const PLATFORM_KEYS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "Kwai",
  "Twitch",
  "Facebook",
] as const;

export function CreatorApplicationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const m = t.creatorModal;
  const [values, setValues] = useState({
    name: "",
    email: "",
    whatsapp: "",
    type: "",
    profiles: "",
  });
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  function validateField(key: keyof typeof values, value: string): string | undefined {
    if (key === "whatsapp") return undefined;
    if (!value.trim())
      return key === "profiles" ? t.validation.profiles : t.validation.required;
    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()))
      return t.validation.email;
    return undefined;
  }

  function blur(key: keyof typeof values) {
    setErrors((prev) => ({ ...prev, [key]: validateField(key, values[key]) }));
  }

  function togglePlatform(name: string) {
    setPlatforms((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
    setErrors((prev) => ({ ...prev, platforms: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {
      name: validateField("name", values.name),
      email: validateField("email", values.email),
      type: validateField("type", values.type),
      profiles: validateField("profiles", values.profiles),
      platforms: platforms.length === 0 ? t.validation.platform : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSending(true);
    // TODO: conectar a persistência/envio real quando a Gamerbiz definir o destino.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSending(false);
    setDone(true);
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setTimeout(() => setDone(false), 200);
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={handleOpenChange}
      eyebrow={m.eyebrow}
      title={m.title}
      titleHighlight={m.titleHighlight}
      description={m.description}
      labelledBy="creator-modal-title"
    >
      {done ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-6"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">{m.success}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="grid gap-5 md:grid-cols-2">
          <Field id="creator-name" label={m.name} error={errors.name}>
            <input
              id="creator-name"
              className={inputClass}
              placeholder={m.namePlaceholder}
              value={values.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "creator-name-error" : undefined}
              onChange={(e) => set("name")(e.target.value)}
              onBlur={() => blur("name")}
              required
            />
          </Field>

          <Field id="creator-email" label={m.email} error={errors.email}>
            <input
              id="creator-email"
              type="email"
              className={inputClass}
              placeholder={m.emailPlaceholder}
              value={values.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "creator-email-error" : undefined}
              onChange={(e) => set("email")(e.target.value)}
              onBlur={() => blur("email")}
              required
            />
          </Field>

          <Field
            id="creator-whatsapp"
            label={m.whatsapp}
            optionalLabel={m.optional}
            className="md:col-span-2"
          >
            <input
              id="creator-whatsapp"
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder={m.whatsappPlaceholder}
              value={values.whatsapp}
              onChange={(e) => set("whatsapp")(e.target.value)}
            />
          </Field>

          <fieldset className="md:col-span-2">
            <legend className="font-display text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {m.platforms}
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...PLATFORM_KEYS, m.other].map((platform) => {
                const id = `platform-${platform}`;
                const checked = platforms.includes(platform);
                return (
                  <label
                    key={platform}
                    htmlFor={id}
                    className={
                      "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 " +
                      (checked
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border text-muted-foreground hover:border-subtle")
                    }
                  >
                    <input
                      id={id}
                      type="checkbox"
                      className="h-4 w-4 accent-[oklch(0.6279_0.2577_29.23)]"
                      checked={checked}
                      onChange={() => togglePlatform(platform)}
                    />
                    {platform}
                  </label>
                );
              })}
            </div>
            {errors.platforms ? (
              <p className="mt-2 text-xs font-semibold text-primary">⚠ {errors.platforms}</p>
            ) : null}
          </fieldset>

          <Field id="creator-type" label={m.type} error={errors.type} className="md:col-span-2">
            <textarea
              id="creator-type"
              className={textareaClass}
              placeholder={m.typePlaceholder}
              value={values.type}
              aria-invalid={Boolean(errors.type)}
              aria-describedby={errors.type ? "creator-type-error" : undefined}
              onChange={(e) => set("type")(e.target.value)}
              onBlur={() => blur("type")}
              required
            />
          </Field>

          <Field
            id="creator-profiles"
            label={m.profiles}
            error={errors.profiles}
            className="md:col-span-2"
          >
            <input
              id="creator-profiles"
              className={inputClass}
              placeholder={m.profilesPlaceholder}
              value={values.profiles}
              aria-invalid={Boolean(errors.profiles)}
              aria-describedby={errors.profiles ? "creator-profiles-error" : undefined}
              onChange={(e) => set("profiles")(e.target.value)}
              onBlur={() => blur("profiles")}
              required
            />
          </Field>

          <div className="md:col-span-2">
            <GbzButton type="submit" size="full" disabled={sending}>
              {m.submit}
            </GbzButton>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
