import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CircleUserRound,
  Clock3,
  GripVertical,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/dashboard/portal-shell";
import { TalentEditorDialog } from "@/components/dashboard/talent-editor-dialog";
import { UserEditorDialog, type ManagedUserDraft } from "@/components/dashboard/user-editor-dialog";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminAssignCreator,
  adminDashboardOverview,
  adminManageUser,
  adminRemoveCreatorAccess,
  adminSyncSocialMetrics,
  adminUpdateLeadStatus,
  getCurrentPortalAccess,
  type LeadRow,
  type SocialConnectionRow,
} from "@/lib/portal.functions";
import { adminDeleteTalent, adminReorderTalents, adminSaveTalent } from "@/lib/talents.functions";
import type { TalentRow } from "@/lib/talent-mapper";
import { normalizeForSearch, toSlug } from "@/lib/slug";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Central de operação — Gamerbiz" },
      {
        name: "description",
        content: "Painel administrativo para Media Kits, conexões, acessos e oportunidades.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRoute,
});

type AdminView = "overview" | "talents" | "leads" | "access";
type LeadFilter = "all" | LeadRow["kind"];

const EMPTY_TALENT: TalentRow = {
  id: "",
  slug: "",
  stage_name: "",
  username: null,
  category: "Multigame",
  city: null,
  bio: null,
  image_url: null,
  media_kit_url: null,
  status: "draft",
  sort_order: 999,
  instagram_url: null,
  tiktok_url: null,
  youtube_url: null,
  twitch_url: null,
  twitter_url: null,
  followers: null,
  avg_views: null,
  engagement: null,
  audience: null,
  achievements: null,
  contact_email: null,
};

const EMPTY_USER: ManagedUserDraft = {
  userId: null,
  email: "",
  displayName: "",
  password: "",
  role: "creator",
  talentId: "",
};

const VIEW_ITEMS: Array<{
  key: AdminView;
  label: string;
  icon: typeof Activity;
}> = [
  { key: "overview", label: "Visão geral", icon: Activity },
  { key: "talents", label: "Media Kits", icon: UsersRound },
  { key: "leads", label: "Oportunidades", icon: MessageSquareText },
  { key: "access", label: "Acessos", icon: ShieldCheck },
];

const STATUS_LABEL: Record<TalentRow["status"], string> = {
  draft: "Rascunho",
  hidden: "Oculto",
  published: "Publicado",
};

const CONNECTION_LABEL: Record<string, string> = {
  connected: "Atualizada",
  disconnected: "Desconectada",
  error: "Com erro",
  pending: "Aguardando sync",
};

function talentHealth(talent: TalentRow) {
  const fields = [
    ["Bio", talent.bio],
    ["Foto", talent.image_url],
    ["E-mail comercial", talent.contact_email],
    ["Cidade", talent.city],
    ["Conquistas", talent.achievements],
  ] as const;
  const missing = fields.filter(([, value]) => !value?.trim()).map(([label]) => label);
  return { missing, score: Math.round(((fields.length - missing.length) / fields.length) * 100) };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
  urgent,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  detail: string;
  urgent?: boolean;
}) {
  return (
    <article className="rounded-[28px] border border-border bg-surface p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <span
          className={`grid h-11 w-11 place-items-center rounded-2xl ${urgent ? "bg-primary/15 text-primary" : "bg-muted text-foreground"}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {urgent && value > 0 ? (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-primary">
            atenção
          </span>
        ) : null}
      </div>
      <p className="mt-6 font-display text-4xl font-bold tracking-[-0.05em] text-foreground">
        {value}
      </p>
      <p className="mt-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-foreground">
        {label}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  const isGood = status === "connected" || status === "published" || status === "contacted";
  const isBad = status === "error" || status === "new";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] ${
        isGood
          ? "bg-emerald-500/15 text-emerald-400"
          : isBad
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {CONNECTION_LABEL[status] ?? STATUS_LABEL[status as TalentRow["status"]] ?? status}
    </span>
  );
}

function AdminRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getAccess = useServerFn(getCurrentPortalAccess);
  const loadDashboard = useServerFn(adminDashboardOverview);
  const saveTalent = useServerFn(adminSaveTalent);
  const reorderTalents = useServerFn(adminReorderTalents);
  const deleteTalent = useServerFn(adminDeleteTalent);
  const updateLeadStatus = useServerFn(adminUpdateLeadStatus);
  const assignCreator = useServerFn(adminAssignCreator);
  const removeCreatorAccess = useServerFn(adminRemoveCreatorAccess);
  const manageUser = useServerFn(adminManageUser);
  const syncSocialMetrics = useServerFn(adminSyncSocialMetrics);

  const [view, setView] = useState<AdminView>("overview");
  const [term, setTerm] = useState("");
  const [accessTerm, setAccessTerm] = useState("");
  const [leadFilter, setLeadFilter] = useState<LeadFilter>("all");
  const [editing, setEditing] = useState<TalentRow | null>(null);
  const [editingUser, setEditingUser] = useState<ManagedUserDraft | null>(null);
  const [orderedTalentIds, setOrderedTalentIds] = useState<string[]>([]);
  const [draggedTalentId, setDraggedTalentId] = useState<string | null>(null);
  const [dropTargetTalentId, setDropTargetTalentId] = useState<string | null>(null);

  const accessQuery = useQuery({ queryKey: ["portal-access"], queryFn: () => getAccess({}) });
  const isAdmin = accessQuery.data?.role === "admin";
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => loadDashboard({}),
    enabled: isAdmin,
  });

  const refreshDashboard = () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });

  const syncMutation = useMutation({
    mutationFn: () => syncSocialMetrics({}),
    onSuccess: async (result) => {
      await refreshDashboard();
      const warning = result.results.find((item) => item.warning)?.warning;
      if (result.failed > 0) {
        toast.error(
          `Sincronização concluída com ${result.failed} ${result.failed === 1 ? "falha" : "falhas"}.`,
        );
      } else if (warning) {
        toast.warning(
          "Dados básicos atualizados, mas o YouTube Analytics ainda está indisponível.",
        );
      } else {
        toast.success(
          `${result.succeeded} ${result.succeeded === 1 ? "conta atualizada" : "contas atualizadas"}.`,
        );
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: (values: TalentRow) =>
      saveTalent({
        data: {
          id: values.id || null,
          slug: values.slug || toSlug(values.stage_name),
          stage_name: values.stage_name,
          username: values.username || null,
          category: values.category || "Multigame",
          city: values.city || null,
          bio: values.bio || null,
          image_url: values.image_url || null,
          media_kit_url: values.media_kit_url || null,
          status: values.status,
          sort_order: Number(values.sort_order) || 0,
          achievements: values.achievements || null,
          contact_email: values.contact_email || null,
        },
      }),
    onSuccess: () => {
      toast.success("Media Kit salvo.");
      setEditing(null);
      void refreshDashboard();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTalent({ data: { id } }),
    onSuccess: () => {
      toast.success("Media Kit removido.");
      setEditing(null);
      void refreshDashboard();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ ids }: { ids: string[]; previousIds: string[] }) =>
      reorderTalents({ data: { ids } }),
    onSuccess: () => {
      toast.success("Ordem dos Media Kits atualizada.");
      void refreshDashboard();
    },
    onError: (error: Error, variables) => {
      setOrderedTalentIds(variables.previousIds);
      toast.error(error.message);
    },
  });

  const leadMutation = useMutation({
    mutationFn: (input: { id: string; status: LeadRow["status"] }) =>
      updateLeadStatus({ data: input }),
    onSuccess: () => {
      toast.success("Oportunidade atualizada.");
      void refreshDashboard();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const accessMutation = useMutation({
    mutationFn: (input: { userId: string; talentId: string | null }) =>
      input.talentId
        ? assignCreator({ data: { userId: input.userId, talentId: input.talentId } })
        : removeCreatorAccess({ data: { userId: input.userId } }),
    onSuccess: () => {
      toast.success("Acesso do creator atualizado.");
      void refreshDashboard();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const userMutation = useMutation({
    mutationFn: (draft: ManagedUserDraft) =>
      draft.userId
        ? manageUser({
            data: {
              action: "update",
              userId: draft.userId,
              email: draft.email,
              displayName: draft.displayName || null,
              role: draft.role,
              talentId: draft.role === "creator" ? draft.talentId : null,
              ...(draft.password ? { password: draft.password } : {}),
            },
          })
        : manageUser({
            data: {
              action: "create",
              email: draft.email,
              password: draft.password,
              displayName: draft.displayName || null,
              role: draft.role,
              talentId: draft.role === "creator" ? draft.talentId : null,
            },
          }),
    onSuccess: () => {
      toast.success(editingUser?.userId ? "Usuário atualizado." : "Usuário criado.");
      setEditingUser(null);
      void refreshDashboard();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => manageUser({ data: { action: "delete", userId } }),
    onSuccess: () => {
      toast.success("Usuário excluído.");
      setEditingUser(null);
      void refreshDashboard();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const dashboard = dashboardQuery.data;

  useEffect(() => {
    if (dashboard?.talents) {
      setOrderedTalentIds(dashboard.talents.map((talent) => talent.id));
    }
  }, [dashboard?.talents]);

  const connectionsByTalent = useMemo(() => {
    const map = new Map<string, SocialConnectionRow[]>();
    for (const connection of dashboard?.connections ?? []) {
      if (connection.connection_method !== "oauth") continue;
      const rows = map.get(connection.talent_id) ?? [];
      rows.push(connection);
      map.set(connection.talent_id, rows);
    }
    return map;
  }, [dashboard?.connections]);

  const accessByTalent = useMemo(
    () => new Map((dashboard?.access ?? []).map((entry) => [entry.talent_id, entry.user_id])),
    [dashboard?.access],
  );
  const accessByUser = useMemo(
    () => new Map((dashboard?.access ?? []).map((entry) => [entry.user_id, entry.talent_id])),
    [dashboard?.access],
  );
  const profilesById = useMemo(
    () => new Map((dashboard?.profiles ?? []).map((profile) => [profile.user_id, profile])),
    [dashboard?.profiles],
  );
  const adminUserIds = useMemo(
    () => new Set(dashboard?.adminUserIds ?? []),
    [dashboard?.adminUserIds],
  );

  const orderedTalents = useMemo(() => {
    const rows = dashboard?.talents ?? [];
    const rowsById = new Map(rows.map((talent) => [talent.id, talent]));
    const ordered = orderedTalentIds.flatMap((id) => {
      const talent = rowsById.get(id);
      return talent ? [talent] : [];
    });
    const orderedIds = new Set(ordered.map((talent) => talent.id));
    return [...ordered, ...rows.filter((talent) => !orderedIds.has(talent.id))];
  }, [dashboard?.talents, orderedTalentIds]);

  const accessRows = useMemo(() => {
    const needle = normalizeForSearch(accessTerm);
    const talentNames = new Map(
      (dashboard?.talents ?? []).map((talent) => [talent.id, talent.stage_name]),
    );
    return (dashboard?.profiles ?? []).filter((profile) => {
      if (!needle) return true;
      const talentName = talentNames.get(accessByUser.get(profile.user_id) ?? "") ?? "";
      const role = adminUserIds.has(profile.user_id) ? "admin administrador" : "creator";
      return normalizeForSearch(
        `${profile.display_name ?? ""} ${profile.email} ${talentName} ${role}`,
      ).includes(needle);
    });
  }, [accessByUser, accessTerm, adminUserIds, dashboard?.profiles, dashboard?.talents]);

  const talentRows = useMemo(() => {
    const needle = normalizeForSearch(term);
    const rows = orderedTalents;
    if (!needle) return rows;
    return rows.filter((talent) =>
      normalizeForSearch(
        `${talent.stage_name} ${talent.username ?? ""} ${talent.category} ${talent.status}`,
      ).includes(needle),
    );
  }, [orderedTalents, term]);

  const filteredLeads = useMemo(
    () =>
      (dashboard?.leads ?? []).filter((lead) => leadFilter === "all" || lead.kind === leadFilter),
    [dashboard?.leads, leadFilter],
  );

  const publishedTalents = (dashboard?.talents ?? []).filter(
    (talent) => talent.status === "published",
  );
  const newLeads = (dashboard?.leads ?? []).filter((lead) => lead.status === "new");
  const missingData = publishedTalents.filter((talent) => talentHealth(talent).score < 80);
  const missingConnections = publishedTalents.filter(
    (talent) =>
      !(connectionsByTalent.get(talent.id) ?? []).some(
        (connection) => connection.sync_enabled && connection.profile_url,
      ),
  );
  const syncErrors = (dashboard?.connections ?? []).filter(
    (connection) =>
      connection.connection_method === "oauth" &&
      (connection.connection_status === "error" || connection.last_sync_error),
  );
  const staleThreshold = Date.now() - 48 * 60 * 60 * 1000;
  const pendingMetricConnections = (dashboard?.connections ?? []).filter(
    (connection) =>
      connection.connection_method === "oauth" &&
      Boolean(connection.profile_url) &&
      connection.sync_enabled &&
      connection.connection_status !== "error" &&
      (connection.connection_status !== "connected" ||
        !connection.last_synced_at ||
        new Date(connection.last_synced_at).getTime() < staleThreshold),
  );
  const pendingMetricTalentIds = new Set(
    pendingMetricConnections.map((connection) => connection.talent_id),
  );
  const pendingMetricConnectionIds = new Set(
    pendingMetricConnections.map((connection) => connection.id),
  );

  function handleDrop(targetTalentId: string) {
    if (!draggedTalentId || draggedTalentId === targetTalentId) return;

    const currentIds = orderedTalents.map((talent) => talent.id);
    const previousIds = [...currentIds];
    const nextIds = currentIds.filter((id) => id !== draggedTalentId);
    const targetIndex = nextIds.indexOf(targetTalentId);
    if (targetIndex < 0) return;

    nextIds.splice(targetIndex, 0, draggedTalentId);
    setOrderedTalentIds(nextIds);
    setDraggedTalentId(null);
    setDropTargetTalentId(null);
    reorderMutation.mutate({ ids: nextIds, previousIds });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (accessQuery.isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <PortalShell
      eyebrow="Central administrativa"
      title="Operação dos Media Kits"
      description="Acompanhe publicação, qualidade dos dados, conexões sociais, acessos e oportunidades comerciais em um só lugar."
      onSignOut={() => void handleSignOut()}
    >
      <Toaster />
      {!isAdmin ? (
        <section className="rounded-[28px] border border-primary/30 bg-primary/10 p-7">
          <h2 className="font-display text-xl font-bold text-foreground">Acesso não autorizado</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Esta conta não possui o papel de administrador. Se ela for de um creator, acesse o
            portal de conexões.
          </p>
          <Link
            to="/creator"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
          >
            Ir para o portal do creator
          </Link>
        </section>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-2 md:flex-row md:items-center">
            <div
              role="tablist"
              aria-label="Seções administrativas"
              className="flex flex-1 gap-1 overflow-x-auto"
            >
              {VIEW_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={view === item.key}
                    onClick={() => setView(item.key)}
                    className={`gbz-interactive inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[18px] px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] transition-colors ${
                      view === item.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground fine-hover:hover:bg-muted fine-hover:hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="gbz-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-[18px] border border-border px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
            >
              <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              {syncMutation.isPending ? "Sincronizando" : "Atualizar"}
            </button>
          </div>

          {dashboardQuery.isLoading ? (
            <p className="mt-8 text-sm text-muted-foreground">Carregando a operação...</p>
          ) : dashboardQuery.isError ? (
            <p className="mt-8 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm text-primary">
              {dashboardQuery.error.message}
            </p>
          ) : view === "overview" ? (
            <div className="mt-6 space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <KpiCard
                  icon={UsersRound}
                  label="Media Kits"
                  value={publishedTalents.length}
                  detail="publicados no diretório"
                />
                <KpiCard
                  icon={MessageSquareText}
                  label="Novas respostas"
                  value={newLeads.length}
                  detail="marcas e creators aguardando retorno"
                  urgent
                />
                <KpiCard
                  icon={AlertTriangle}
                  label="Dados incompletos"
                  value={missingData.length}
                  detail="Media Kits abaixo de 80%"
                  urgent
                />
                <KpiCard
                  icon={WifiOff}
                  label="Sem conexão"
                  value={missingConnections.length}
                  detail="talentos sem nenhuma rede ativa"
                  urgent
                />
                <KpiCard
                  icon={Activity}
                  label="Erros de sync"
                  value={syncErrors.length}
                  detail="integrações que exigem revisão"
                  urgent
                />
                <KpiCard
                  icon={RefreshCw}
                  label="Atualização pendente"
                  value={pendingMetricTalentIds.size}
                  detail="creators aguardando métricas novas"
                  urgent
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                <article className="rounded-[28px] border border-border bg-surface p-5 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-primary">
                        Prioridades
                      </p>
                      <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.03em]">
                        Fila de atenção
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setView("talents")}
                      className="text-xs font-semibold text-primary"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="mt-6 space-y-3">
                    {publishedTalents
                      .filter(
                        (talent) =>
                          talentHealth(talent).score < 100 ||
                          !connectionsByTalent.get(talent.id)?.length ||
                          pendingMetricTalentIds.has(talent.id),
                      )
                      .slice(0, 7)
                      .map((talent) => {
                        const health = talentHealth(talent);
                        const connected = (connectionsByTalent.get(talent.id) ?? []).filter(
                          (item) => item.sync_enabled,
                        ).length;
                        const awaitingMetrics = (connectionsByTalent.get(talent.id) ?? []).filter(
                          (item) => pendingMetricConnectionIds.has(item.id),
                        ).length;
                        return (
                          <button
                            key={talent.id}
                            type="button"
                            onClick={() => {
                              setEditing(talent);
                              setView("talents");
                            }}
                            className="gbz-interactive flex w-full items-center gap-4 rounded-2xl border border-border bg-background p-4 text-left transition-colors fine-hover:hover:border-primary/60"
                          >
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted font-display text-sm font-bold text-foreground">
                              {talent.stage_name.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-sm font-bold">
                                {talent.stage_name}
                              </span>
                              <span className="mt-1 block truncate text-xs text-muted-foreground">
                                {health.missing.length
                                  ? `Falta: ${health.missing.join(", ")}`
                                  : awaitingMetrics
                                    ? `${awaitingMetrics} conexões aguardando dados`
                                    : "Dados essenciais completos"}
                              </span>
                            </span>
                            <span className="text-right text-xs text-muted-foreground">
                              {health.score}%<br />
                              {connected} redes
                            </span>
                          </button>
                        );
                      })}
                    {publishedTalents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum Media Kit publicado.</p>
                    ) : null}
                  </div>
                </article>

                <article className="rounded-[28px] border border-border bg-surface p-5 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-primary">
                        Entrada
                      </p>
                      <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.03em]">
                        Últimas respostas
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setView("leads")}
                      className="text-xs font-semibold text-primary"
                    >
                      Abrir inbox
                    </button>
                  </div>
                  <div className="mt-6 space-y-3">
                    {(dashboard?.leads ?? []).slice(0, 6).map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-bold">{lead.name}</p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {lead.kind === "brand" ? lead.company : lead.creator_type}
                            </p>
                          </div>
                          <StatusPill status={lead.status} />
                        </div>
                        <p className="mt-3 text-[0.65rem] uppercase tracking-[0.12em] text-subtle">
                          {lead.kind === "brand" ? "Marca" : "Creator"} ·{" "}
                          {formatDate(lead.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </div>
          ) : view === "talents" ? (
            <section className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-md">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Buscar Media Kit"
                    aria-label="Buscar Media Kit"
                    className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground sm:max-w-[18rem]">
                  Arraste pelo ícone de alça para definir a ordem exibida na frontpage.
                </p>
                <button
                  type="button"
                  onClick={() => setEditing({ ...EMPTY_TALENT })}
                  className="gbz-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Novo talento
                </button>
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-border bg-surface">
                <div className="hidden grid-cols-[1.25fr_0.8fr_0.7fr_0.8fr_auto] gap-4 border-b border-border px-6 py-4 font-display text-[0.6rem] font-bold uppercase tracking-[0.15em] text-subtle lg:grid">
                  <span>Talento</span>
                  <span>Qualidade</span>
                  <span>Conexões</span>
                  <span>Acesso</span>
                  <span>Ação</span>
                </div>
                <div className="divide-y divide-border">
                  {talentRows.map((talent) => {
                    const health = talentHealth(talent);
                    const connections = connectionsByTalent.get(talent.id) ?? [];
                    const assignedProfile = profilesById.get(accessByTalent.get(talent.id) ?? "");
                    const isDragging = draggedTalentId === talent.id;
                    const isDropTarget =
                      dropTargetTalentId === talent.id && draggedTalentId !== talent.id;
                    return (
                      <article
                        key={talent.id}
                        onDragOver={(event) => {
                          if (!draggedTalentId || draggedTalentId === talent.id) return;
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                          setDropTargetTalentId(talent.id);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          handleDrop(talent.id);
                        }}
                        className={`grid gap-4 px-5 py-5 transition-[background-color,opacity] lg:grid-cols-[1.25fr_0.8fr_0.7fr_0.8fr_auto] lg:items-center lg:px-6 ${
                          isDragging ? "opacity-45" : ""
                        } ${isDropTarget ? "bg-primary/10" : ""}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            draggable={!reorderMutation.isPending}
                            role="button"
                            tabIndex={0}
                            aria-label={`Arrastar ${talent.stage_name} para reordenar`}
                            title="Arraste para reordenar"
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", talent.id);
                              setDraggedTalentId(talent.id);
                              setDropTargetTalentId(null);
                            }}
                            onDragEnd={() => {
                              setDraggedTalentId(null);
                              setDropTargetTalentId(null);
                            }}
                            className="grid h-9 w-7 shrink-0 cursor-grab place-items-center rounded-lg text-subtle transition-colors active:cursor-grabbing fine-hover:hover:bg-muted fine-hover:hover:text-primary"
                          >
                            <GripVertical className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="font-display text-sm font-bold">
                                {talent.stage_name}
                              </h2>
                              <StatusPill status={talent.status} />
                            </div>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {talent.category} · /{talent.slug}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Completude</span>
                            <span className="font-bold">{health.score}%</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${health.score}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {connections.length ? (
                            connections
                              .slice(0, 3)
                              .map((connection) => (
                                <StatusPill
                                  key={connection.id}
                                  status={connection.connection_status}
                                />
                              ))
                          ) : (
                            <span className="text-xs text-primary">Nenhuma</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {assignedProfile?.email ?? "Sem creator atribuído"}
                        </p>
                        <div className="flex gap-2 lg:justify-end">
                          <Link
                            to="/mediakit/$slug"
                            params={{ slug: talent.slug }}
                            target="_blank"
                            aria-label={`Abrir Media Kit de ${talent.stage_name}`}
                            className="gbz-interactive grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditing(talent)}
                            className="gbz-interactive min-h-10 rounded-full border border-border px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
                          >
                            Editar
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : view === "leads" ? (
            <section className="mt-6">
              <div className="flex flex-wrap gap-2">
                {(["all", "brand", "creator"] as LeadFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setLeadFilter(filter)}
                    className={`min-h-10 rounded-full px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] ${leadFilter === filter ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
                  >
                    {filter === "all" ? "Todas" : filter === "brand" ? "Marcas" : "Creators"}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {filteredLeads.map((lead) => (
                  <article
                    key={lead.id}
                    className="rounded-[26px] border border-border bg-surface p-5 md:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-display text-[0.6rem] font-bold uppercase tracking-[0.16em] text-primary">
                          {lead.kind === "brand" ? "Marca" : "Creator"}
                        </p>
                        <h2 className="mt-2 truncate font-display text-lg font-bold">
                          {lead.name}
                        </h2>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{lead.email}</p>
                      </div>
                      <select
                        aria-label={`Status de ${lead.name}`}
                        value={lead.status}
                        onChange={(event) =>
                          leadMutation.mutate({
                            id: lead.id,
                            status: event.target.value as LeadRow["status"],
                          })
                        }
                        className="min-h-10 rounded-full border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                      >
                        <option value="new">Nova</option>
                        <option value="contacted">Contatada</option>
                        <option value="archived">Arquivada</option>
                      </select>
                    </div>
                    <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-subtle">
                          Contexto
                        </dt>
                        <dd className="mt-2 text-muted-foreground">
                          {lead.kind === "brand" ? lead.company : lead.creator_type}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-subtle">
                          WhatsApp
                        </dt>
                        <dd className="mt-2 text-muted-foreground">
                          {lead.whatsapp || "Não informado"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-subtle">
                          {lead.kind === "brand" ? "Mensagem" : "Perfis"}
                        </dt>
                        <dd className="mt-2 whitespace-pre-wrap leading-relaxed text-muted-foreground">
                          {lead.kind === "brand" ? lead.message : lead.profiles}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-5 flex items-center gap-2 text-xs text-subtle">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDate(lead.created_at)}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
              {dashboard?.authUsersError ? (
                <div className="xl:col-span-2 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm text-primary">
                  A gestão de contas está temporariamente indisponível. A visão geral continua
                  funcionando, mas a Edge Function de usuários precisa ser republicada.
                </div>
              ) : null}
              <article className="rounded-[28px] border border-border bg-surface p-6 md:p-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <CircleUserRound className="h-5 w-5" />
                </span>
                <h2 className="mt-6 font-display text-xl font-bold tracking-[-0.03em]">
                  Acesso mínimo por design
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Cada creator recebe acesso a um único Media Kit. Ele pode apenas conectar ou
                  desconectar as próprias redes; textos, métricas manuais e publicação continuam sob
                  controle da Gamerbiz.
                </p>
                <div className="mt-6 rounded-2xl border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Gestão centralizada:</strong> crie, edite,
                  redefina senhas e exclua contas diretamente por esta tela. Senhas existentes nunca
                  são exibidas.
                </div>
              </article>
              <article className="overflow-hidden rounded-[28px] border border-border bg-surface">
                <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold">Usuários e Media Kits</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dashboard?.profiles.length ?? 0} contas disponíveis no Supabase
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...EMPTY_USER })}
                    className="gbz-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary-foreground"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Novo usuário
                  </button>
                </div>
                <div className="relative border-b border-border px-6 py-4">
                  <Search
                    className="pointer-events-none absolute left-10 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={accessTerm}
                    onChange={(event) => setAccessTerm(event.target.value)}
                    placeholder="Buscar por nome, e-mail ou Media Kit"
                    aria-label="Buscar acessos por nome, e-mail ou Media Kit"
                    className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-[border-color] focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {accessTerm ? (
                    <p className="mt-2 px-2 text-xs text-muted-foreground" aria-live="polite">
                      {accessRows.length} resultado{accessRows.length === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>
                <div className="divide-y divide-border">
                  {accessRows.map((profile) => {
                    const talentId = accessByUser.get(profile.user_id) ?? "";
                    const isCreator = dashboard?.creatorUserIds.includes(profile.user_id);
                    const isProfileAdmin = adminUserIds.has(profile.user_id);
                    return (
                      <div
                        key={profile.user_id}
                        className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_minmax(220px,0.9fr)_auto] md:items-center"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-display text-sm font-bold">
                              {profile.display_name || profile.email.split("@")[0]}
                            </p>
                            {isCreator ? (
                              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-primary">
                                Creator
                              </span>
                            ) : null}
                            {isCreator && profile.must_change_password ? (
                              <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-amber-300">
                                Troca de senha pendente
                              </span>
                            ) : null}
                            {isProfileAdmin ? (
                              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-emerald-400">
                                Administrador
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {profile.email}
                          </p>
                        </div>
                        {isProfileAdmin ? (
                          <div className="flex min-h-11 items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 text-xs font-semibold text-emerald-300">
                            Acesso total — sem Media Kit
                          </div>
                        ) : (
                          <select
                            value={talentId}
                            onChange={(event) =>
                              accessMutation.mutate({
                                userId: profile.user_id,
                                talentId: event.target.value || null,
                              })
                            }
                            disabled={accessMutation.isPending}
                            aria-label={`Media Kit atribuído a ${profile.email}`}
                            className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                          >
                            <option value="">Sem Media Kit</option>
                            {(dashboard?.talents ?? []).map((talent) => (
                              <option key={talent.id} value={talent.id}>
                                {talent.stage_name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setEditingUser({
                              userId: profile.user_id,
                              email: profile.email,
                              displayName: profile.display_name || "",
                              password: "",
                              role: isProfileAdmin ? "admin" : "creator",
                              talentId,
                            })
                          }
                          aria-label={`Editar usuário ${profile.email}`}
                          className="gbz-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors fine-hover:hover:border-primary fine-hover:hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Editar
                        </button>
                      </div>
                    );
                  })}
                  {accessRows.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-muted-foreground">
                      Nenhum acesso encontrado.
                    </p>
                  ) : null}
                </div>
              </article>
            </section>
          )}
        </>
      )}

      {editing ? (
        <TalentEditorDialog
          talent={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={() => saveMutation.mutate(editing)}
          onDelete={
            editing.id
              ? () => {
                  if (
                    window.confirm(`Excluir permanentemente o Media Kit de ${editing.stage_name}?`)
                  ) {
                    deleteMutation.mutate(editing.id);
                  }
                }
              : undefined
          }
          saving={saveMutation.isPending}
          deleting={deleteMutation.isPending}
        />
      ) : null}

      {editingUser ? (
        <UserEditorDialog
          value={editingUser}
          talents={dashboard?.talents ?? []}
          currentUserId={accessQuery.data?.userId}
          onChange={setEditingUser}
          onClose={() => setEditingUser(null)}
          onSave={() => userMutation.mutate(editingUser)}
          onDelete={
            editingUser.userId
              ? () => {
                  if (window.confirm(`Excluir permanentemente o usuário ${editingUser.email}?`)) {
                    deleteUserMutation.mutate(editingUser.userId!);
                  }
                }
              : undefined
          }
          saving={userMutation.isPending}
          deleting={deleteUserMutation.isPending}
        />
      ) : null}
    </PortalShell>
  );
}
