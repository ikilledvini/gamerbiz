import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { GbzButton } from "@/components/ui/gbz-button";
import { submitLeadSubmission } from "@/lib/lead-submissions";
import { Field, ModalShell, inputClass, textareaClass } from "./modal-shell";

type Errors = Partial<Record<"name" | "company" | "email" | "help", string | undefined>>;

function maskBrPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (!digits) return "";
  const rest = digits.startsWith("55") ? digits.slice(2) : digits;
  const ddd = rest.slice(0, 2);
  const first = rest.slice(2, rest.length > 10 ? 7 : 6);
  const last = rest.slice(rest.length > 10 ? 7 : 6, 11);
  let out = "+55";
  if (ddd) out += ` ${ddd}`;
  if (first) out += ` ${first}`;
  if (last) out += `-${last}`;
  return out;
}

export function BrandContactModal({
  open,
  onOpenChange,
  subject,
  motion,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: string | null;
  motion: boolean;
}) {
  const { t, lang } = useI18n();
  const m = t.brandModal;
  const [values, setValues] = useState({
    name: "",
    company: "",
    email: "",
    whatsapp: "",
    help: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  function validateField(key: keyof Errors, value: string): string | undefined {
    if (!value.trim()) return t.validation.required;
    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()))
      return t.validation.email;
    return undefined;
  }

  function blur(key: keyof Errors) {
    setErrors((prev) => ({ ...prev, [key]: validateField(key, values[key]) }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {
      name: validateField("name", values.name),
      company: validateField("company", values.company),
      email: validateField("email", values.email),
      help: validateField("help", values.help),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSending(true);
    setSubmitError(null);
    try {
      await submitLeadSubmission({
        kind: "brand",
        name: values.name.trim(),
        company: values.company.trim(),
        email: values.email.trim().toLowerCase(),
        whatsapp: values.whatsapp.trim() || null,
        message: values.help.trim(),
        subject: subject?.trim() || null,
        locale: lang,
      });
      setDone(true);
    } catch {
      setSubmitError(t.validation.generic);
    } finally {
      setSending(false);
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setTimeout(() => {
        setDone(false);
        setSubmitError(null);
      }, 200);
    }
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={handleOpenChange}
      eyebrow={m.eyebrow}
      title={m.title}
      titleHighlight={m.titleHighlight}
      description={m.description}
      labelledBy="brand-modal-title"
      motion={motion}
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
          {subject ? (
            <p className="md:col-span-2 -mt-2 inline-flex w-fit rounded-full border border-border px-3 py-1 font-display text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary">
              {subject}
            </p>
          ) : null}

          <Field id="brand-name" label={m.name} error={errors.name}>
            <input
              id="brand-name"
              className={inputClass}
              value={values.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "brand-name-error" : undefined}
              onChange={(e) => set("name")(e.target.value)}
              onBlur={() => blur("name")}
              required
            />
          </Field>

          <Field id="brand-company" label={m.company} error={errors.company}>
            <input
              id="brand-company"
              className={inputClass}
              value={values.company}
              aria-invalid={Boolean(errors.company)}
              aria-describedby={errors.company ? "brand-company-error" : undefined}
              onChange={(e) => set("company")(e.target.value)}
              onBlur={() => blur("company")}
              required
            />
          </Field>

          <Field id="brand-email" label={m.email} error={errors.email}>
            <input
              id="brand-email"
              type="email"
              className={inputClass}
              value={values.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "brand-email-error" : undefined}
              onChange={(e) => set("email")(e.target.value)}
              onBlur={() => blur("email")}
              required
            />
          </Field>

          <Field id="brand-whatsapp" label={m.whatsapp} optionalLabel={m.optional}>
            <input
              id="brand-whatsapp"
              type="tel"
              inputMode="tel"
              className={inputClass}
              value={values.whatsapp}
              onChange={(e) =>
                set("whatsapp")(lang === "pt-BR" ? maskBrPhone(e.target.value) : e.target.value)
              }
            />
          </Field>

          <Field id="brand-help" label={m.help} error={errors.help} className="md:col-span-2">
            <textarea
              id="brand-help"
              className={textareaClass}
              value={values.help}
              aria-invalid={Boolean(errors.help)}
              aria-describedby={errors.help ? "brand-help-error" : undefined}
              onChange={(e) => set("help")(e.target.value)}
              onBlur={() => blur("help")}
              required
            />
          </Field>

          <div className="md:col-span-2">
            {submitError ? (
              <p role="alert" className="mb-4 text-sm font-semibold text-primary">
                {submitError}
              </p>
            ) : null}
            <GbzButton type="submit" size="full" disabled={sending}>
              {m.submit}
            </GbzButton>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
