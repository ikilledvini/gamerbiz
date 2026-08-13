import { useEffect, useMemo } from "react";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Link2, Unlink } from "lucide-react";
import { FaInstagram, FaTiktok, FaTwitch, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { toast } from "sonner";
import { PortalShell } from "@/components/dashboard/portal-shell";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  creatorDisconnectConnection,
  creatorPortalData,
  creatorStartTikTokOAuth,
  creatorStartYouTubeOAuth,
  getCurrentPortalAccess,
  type SocialConnectionRow,
  type SocialPlatform,
} from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/creator")({
  head: () => ({
    meta: [
      { title: "Conexões do Media Kit | Gamerbiz" },
      {
        name: "description",
        content: "Portal do creator para conectar as contas oficiais ao Media Kit Gamerbiz.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreatorRoute,
});

const PLATFORM_CONFIG: Array<{
  key: SocialPlatform;
  label: string;
  icon: typeof FaYoutube;
}> = [
  { key: "youtube", label: "YouTube", icon: FaYoutube },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "tiktok", label: "TikTok", icon: FaTiktok },
  { key: "twitch", label: "Twitch", icon: FaTwitch },
  { key: "twitter", label: "X / Twitter", icon: FaXTwitter },
];

function connectionCopy(connection?: SocialConnectionRow) {
  if (
    !connection ||
    connection.connection_method !== "oauth" ||
    connection.connection_status === "disconnected"
  ) {
    return {
      label: "Não conectada",
      description: "Use a autorização oficial da plataforma para conectar a conta.",
      tone: "muted",
    };
  }
  if (connection.connection_status === "connected") {
    return {
      label: "Conectada",
      description: "Métricas atualizadas automaticamente.",
      tone: "success",
    };
  }
  if (connection.connection_status === "error") {
    return {
      label: "Requer atenção",
      description: connection.last_sync_error || "Não foi possível atualizar esta conta.",
      tone: "error",
    };
  }
  return {
    label: "Aguardando atualização",
    description: "O perfil foi salvo e entrará na próxima sincronização.",
    tone: "pending",
  };
}

function formatLastSync(value: string | null) {
  if (!value) return "Ainda não sincronizada";
  return `Atualizada em ${new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))}`;
}

function CreatorRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getAccess = useServerFn(getCurrentPortalAccess);
  const getPortalData = useServerFn(creatorPortalData);
  const disconnectConnection = useServerFn(creatorDisconnectConnection);
  const startTikTokOAuth = useServerFn(creatorStartTikTokOAuth);
  const startYouTubeOAuth = useServerFn(creatorStartYouTubeOAuth);

  const accessQuery = useQuery({ queryKey: ["portal-access"], queryFn: () => getAccess({}) });
  const isCreator = accessQuery.data?.role === "creator";
  const portalQuery = useQuery({
    queryKey: ["creator-portal"],
    queryFn: () => getPortalData({}),
    enabled: isCreator,
  });

  const connectionsByPlatform = useMemo(
    () => new Map((portalQuery.data?.connections ?? []).map((item) => [item.platform, item])),
    [portalQuery.data?.connections],
  );

  const disconnectMutation = useMutation({
    mutationFn: (platform: SocialPlatform) => disconnectConnection({ data: { platform } }),
    onSuccess: () => {
      toast.success("Conta desconectada.");
      void queryClient.invalidateQueries({ queryKey: ["creator-portal"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const youtubeOAuthMutation = useMutation({
    mutationFn: () => startYouTubeOAuth({}),
    onSuccess: ({ authorizationUrl }) => {
      window.location.assign(authorizationUrl);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const tiktokOAuthMutation = useMutation({
    mutationFn: () => startTikTokOAuth({}),
    onSuccess: ({ authorizationUrl }) => {
      window.location.assign(authorizationUrl);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.has("youtube") ? "youtube" : params.has("tiktok") ? "tiktok" : null;
    if (!platform) return;
    const status = params.get(platform);

    if (status === "connected") {
      toast.success(`${platform === "youtube" ? "YouTube" : "TikTok"} conectado ao Media Kit.`);
      void queryClient.invalidateQueries({ queryKey: ["creator-portal"] });
    } else {
      toast.error(
        params.get("message") ||
          `Não foi possível conectar ${platform === "youtube" ? "o YouTube" : "o TikTok"}.`,
      );
    }
    window.history.replaceState({}, "", window.location.pathname);
  }, [queryClient]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (accessQuery.isLoading) return <div className="min-h-screen bg-background" />;
  if (accessQuery.data?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return (
    <PortalShell
      eyebrow="Portal do creator"
      title={
        portalQuery.data?.talent ? `Olá, ${portalQuery.data.talent.stageName}` : "Suas conexões"
      }
      description="Conecte somente os perfis oficiais que pertencem a você. A Gamerbiz continua responsável por textos, publicação e demais informações do Media Kit."
      userLabel={portalQuery.data?.profile?.email}
      onSignOut={() => void handleSignOut()}
    >
      <Toaster />
      {!isCreator ? (
        <section className="rounded-[28px] border border-primary/30 bg-primary/10 p-7">
          <AlertTriangle className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-5 font-display text-xl font-bold">Acesso de creator não atribuído</h2>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            Sua conta existe, mas ainda não foi vinculada a um Media Kit. Solicite ao time Gamerbiz
            a atribuição do seu usuário.
          </p>
          {accessQuery.data?.role === "admin" ? (
            <Link
              to="/admin"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
            >
              Abrir painel administrativo
            </Link>
          ) : null}
        </section>
      ) : portalQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando suas conexões...</p>
      ) : portalQuery.isError ? (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm text-primary">
          {portalQuery.error.message}
        </p>
      ) : !portalQuery.data?.talent ? (
        <section className="rounded-[28px] border border-border bg-surface p-7">
          <Clock3 className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-5 font-display text-xl font-bold">Media Kit aguardando atribuição</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            O seu papel de creator está ativo, mas o administrador ainda precisa selecionar qual
            Media Kit pertence a esta conta.
          </p>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-5 rounded-[28px] border border-border bg-surface p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div className="flex min-w-0 items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary bg-muted">
                {portalQuery.data.talent.image ? (
                  <img
                    src={portalQuery.data.talent.image}
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="font-display text-[0.6rem] font-bold uppercase tracking-[0.16em] text-primary">
                  Media Kit atribuído
                </p>
                <h2 className="mt-2 truncate font-display text-xl font-bold">
                  {portalQuery.data.talent.stageName}
                </h2>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {portalQuery.data.talent.category}
                </p>
              </div>
            </div>
            <Link
              to="/mediakit/$slug"
              params={{ slug: portalQuery.data.talent.slug }}
              target="_blank"
              className="gbz-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 font-display text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
            >
              Ver Media Kit
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            {PLATFORM_CONFIG.map((platform) => {
              const Icon = platform.icon;
              const connection = connectionsByPlatform.get(platform.key);
              const status = connectionCopy(connection);
              return (
                <article
                  key={platform.key}
                  className="rounded-[28px] border border-border bg-surface p-5 md:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-muted text-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="font-display text-lg font-bold">{platform.label}</h2>
                        <span
                          className={`rounded-full px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] ${status.tone === "success" ? "bg-emerald-500/15 text-emerald-400" : status.tone === "error" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {status.description}
                      </p>
                    </div>
                  </div>

                  {connection?.connection_method === "oauth" && connection.profile_url ? (
                    <a
                      href={connection.profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 flex min-w-0 items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-xs text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
                    >
                      <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{connection.profile_url}</span>
                    </a>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {platform.key === "youtube" ? (
                      <button
                        type="button"
                        onClick={() => youtubeOAuthMutation.mutate()}
                        disabled={youtubeOAuthMutation.isPending}
                        className="gbz-interactive min-h-10 rounded-full bg-primary px-5 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-60"
                      >
                        {youtubeOAuthMutation.isPending
                          ? "Abrindo Google..."
                          : connection?.connection_method === "oauth"
                            ? "Reconectar YouTube"
                            : "Conectar com Google"}
                      </button>
                    ) : platform.key === "tiktok" ? (
                      <button
                        type="button"
                        onClick={() => tiktokOAuthMutation.mutate()}
                        disabled={tiktokOAuthMutation.isPending}
                        className="gbz-interactive min-h-10 rounded-full bg-primary px-5 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-60"
                      >
                        {tiktokOAuthMutation.isPending
                          ? "Abrindo TikTok..."
                          : connection?.connection_method === "oauth"
                            ? "Reconectar TikTok"
                            : "Conectar com TikTok"}
                      </button>
                    ) : (
                      <span className="inline-flex min-h-10 items-center rounded-full border border-border px-5 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-subtle">
                        Integração automática em breve
                      </span>
                    )}
                    {connection?.connection_method === "oauth" && connection.profile_url ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Desconectar ${platform.label} deste Media Kit?`))
                            disconnectMutation.mutate(platform.key);
                        }}
                        disabled={disconnectMutation.isPending}
                        className="gbz-interactive inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
                      >
                        <Unlink className="h-3.5 w-3.5" aria-hidden="true" />
                        Desconectar
                      </button>
                    ) : null}
                  </div>

                  <p className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-[0.65rem] text-subtle">
                    {connection?.connection_method === "oauth" &&
                    connection.connection_status === "connected" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Clock3 className="h-3.5 w-3.5" />
                    )}
                    {formatLastSync(
                      connection?.connection_method === "oauth" ? connection.last_synced_at : null,
                    )}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="mt-6 rounded-[24px] border border-border bg-surface p-5 text-xs leading-relaxed text-muted-foreground md:p-6">
            <strong className="text-foreground">Sobre as atualizações:</strong> YouTube e TikTok já
            possuem sincronização automática. Instagram, Twitch e X serão liberados somente quando
            as respectivas conexões oficiais estiverem disponíveis; não é possível inserir dados
            manualmente.
          </section>
        </>
      )}
    </PortalShell>
  );
}
