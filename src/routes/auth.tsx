import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/ui/logo";

const TITLE = "Acesso restrito — Gamerbiz";
const DESCRIPTION = "Área de login do painel interno de media kits da Gamerbiz.";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    void navigate({ to: "/admin", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-border bg-surface p-8"
      >
        <Logo className="h-9" />
        <h1 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Painel interno de media kits da Gamerbiz.
        </p>

        <label className="mt-6 block text-xs font-bold uppercase tracking-[0.16em] text-subtle">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />
        </label>

        <label className="mt-4 block text-xs font-bold uppercase tracking-[0.16em] text-subtle">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          />
        </label>

        {error ? <p className="mt-4 text-sm text-primary">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-12 w-full rounded-full bg-primary font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Aguarde..." : mode === "signup" ? "Criar conta" : "Entrar"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-4 w-full text-center text-xs uppercase tracking-[0.16em] text-subtle duration-200 hover:text-primary"
        >
          {mode === "signup" ? "Já tenho conta" : "Criar conta"}
        </button>
      </form>
    </main>
  );
}
