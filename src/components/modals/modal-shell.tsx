import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function ModalShell({
  open,
  onOpenChange,
  eyebrow,
  title,
  titleHighlight,
  description,
  children,
  labelledBy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow: string;
  title: string;
  titleHighlight: string;
  description: string;
  children: ReactNode;
  labelledBy: string;
}) {
  const { t } = useI18n();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-describedby={`${labelledBy}-desc`}
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] flex max-h-[92dvh] w-[calc(100vw-24px)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-glow",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          )}
        >
          <div className="overflow-y-auto px-6 py-8 md:px-10 md:py-10">
            <Dialog.Close
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
              aria-label={t.actions.close}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>

            <p className="eyebrow-gbz">{eyebrow}</p>
            <Dialog.Title
              id={labelledBy}
              className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl"
            >
              {title ? `${title} ` : ""}
              <span className="text-primary">{titleHighlight}</span>
            </Dialog.Title>
            <Dialog.Description
              id={`${labelledBy}-desc`}
              className="mt-3 max-w-[46ch] text-sm text-muted-foreground"
            >
              {description}
            </Dialog.Description>

            <div className="mt-8">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Field({
  id,
  label,
  error,
  optionalLabel,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  optionalLabel?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="font-display text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
        {optionalLabel ? (
          <span className="ml-2 font-sans text-[0.7rem] font-medium normal-case tracking-normal text-subtle">
            ({optionalLabel})
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-semibold text-primary">
          ⚠ {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-subtle transition-colors duration-200 focus:border-primary focus:outline-none aria-[invalid=true]:border-primary";

export const textareaClass =
  "min-h-[120px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-subtle transition-colors duration-200 focus:border-primary focus:outline-none aria-[invalid=true]:border-primary";
