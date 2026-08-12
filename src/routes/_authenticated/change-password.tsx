import { useState } from "react";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/dashboard/portal-shell";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { completeFirstPasswordChange, getCurrentPortalAccess } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/change-password")({
  head: () => ({
    meta: [
      { title: "Crie sua nova senha — Gamerbiz" },
      {
        name: "description",
        content: "Troca obrigatória da senha temporária do portal Gamerbiz.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChangePasswordRoute,
});

function ChangePasswordRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getAccess = useServerFn(getCurrentPortalAccess);
  const completeChange = useServerFn(completeFirstPasswordChange);
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessQuery = useQuery({ queryKey: ["portal-access"], queryFn: () => getAccess({}) });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 10) {
      setError("A nova senha precisa ter pelo menos 10 caracteres.");
      return;
    }
    if (newPassword !== confirmation) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }

    setSaving(true);
    try {
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
      if (passwordError) throw new Error(passwordError.message);

      await completeChange({});
      await queryClient.invalidateQueries({ queryKey: ["portal-access"] });
      toast.success("Senha atualizada com segurança.");
      void navigate({ to: "/creator", replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Não foi possível trocar a senha.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (accessQuery.isLoading) return <div className="min-h-screen bg-background" />;
  if (accessQuery.data?.role === "admin") return <Navigate to="/admin" replace />;
  if (accessQuery.data?.role === "creator" && !accessQuery.data.mustChangePassword) {
    return <Navigate to="/creator" replace />;
  }

  return (
    <PortalShell
      eyebrow="Primeiro acesso"
      title="Crie sua nova senha"
      description="Antes de abrir seu Media Kit, substitua a senha temporária por uma senha conhecida somente por você."
      onSignOut={() => void handleSignOut()}
    >
      <Toaster />
      {accessQuery.isError || accessQuery.data?.role !== "creator" ? (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm text-primary">
          Não foi possível confirmar um acesso de creator para esta conta.
        </p>
      ) : (
        <section className="mx-auto max-w-xl rounded-[28px] border border-border bg-surface p-6 shadow-2xl md:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-6 font-display text-xl font-bold tracking-[-0.03em]">
            Proteja seu acesso
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A senha temporária deixará de funcionar assim que esta etapa for concluída.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <PasswordField
              label="Nova senha"
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
              hint="Use pelo menos 10 caracteres."
            />
            <PasswordField
              label="Confirmar nova senha"
              autoComplete="new-password"
              value={confirmation}
              onChange={setConfirmation}
            />

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="gbz-interactive inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {saving ? "Atualizando..." : "Salvar nova senha"}
            </button>
          </form>
        </section>
      )}
    </PortalShell>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password";
  hint?: string;
}) {
  return (
    <label className="block text-[0.62rem] font-bold uppercase tracking-[0.15em] text-subtle">
      {label}
      <span className="relative mt-2 block">
        <KeyRound
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
          aria-hidden="true"
        />
        <input
          type="password"
          autoComplete={autoComplete}
          required
          minLength={10}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </span>
      {hint ? <span className="mt-2 block normal-case tracking-normal">{hint}</span> : null}
    </label>
  );
}
