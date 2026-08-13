import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/ui/logo";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentPortalAccess } from "@/lib/portal.functions";

const TITLE = "Portal de Media Kits | Gamerbiz";
const DESCRIPTION = "Área segura para administradores e creators da Gamerbiz.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthRoute,
});

function AuthRoute() {
  const navigate = useNavigate();
  const getAccess = useServerFn(getCurrentPortalAccess);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError("E-mail ou senha inválidos.");
      return;
    }

    try {
      const access = await getAccess({});
      if (access.role === "admin") {
        void navigate({ to: "/admin", replace: true });
      } else if (access.role === "creator") {
        void navigate({
          to: access.mustChangePassword ? "/change-password" : "/creator",
          replace: true,
        });
      } else {
        setError("Sua conta ainda não recebeu acesso a um portal.");
      }
    } catch {
      setError("Não foi possível confirmar as permissões desta conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[32px] border border-border bg-surface p-8 shadow-2xl md:p-10"
      >
        <Logo className="h-9" />
        <p className="mt-8 font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
          Acesso seguro
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] text-foreground">
          Seu portal Gamerbiz
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Entre com a conta criada pelo time Gamerbiz. Administradores e creators são direcionados
          automaticamente para suas áreas.
        </p>

        <label className="mt-7 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">
          E-mail
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="mt-5 block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">
          Senha
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="gbz-interactive mt-6 h-12 w-full rounded-full bg-primary font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Confirmando acesso..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
