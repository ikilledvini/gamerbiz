import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Database,
  FileClock,
  History,
  KeyRound,
  RefreshCw,
  Search,
  ServerCog,
  TrendingUp,
  UsersRound,
  WifiOff,
  X,
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import type { TalentRow } from "@/lib/talent-mapper";
import type {
  AdminAuditRow,
  AdminNotificationRow,
  AdminUserRow,
  LeadRow,
  ProfileRow,
  SiteContentRow,
  SocialConnectionRow,
  SocialMetricSnapshotRow,
  SocialSyncRunRow,
} from "@/lib/portal.functions";
import { normalizeForSearch } from "@/lib/slug";
import { cn } from "@/lib/utils";

const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitch: "Twitch",
  twitter: "X",
};

export const PIPELINE_STAGES = [
  ["new", "Novas"],
  ["qualified", "Qualificadas"],
  ["meeting", "Reunião"],
  ["proposal", "Proposta"],
  ["negotiation", "Negociação"],
  ["won", "Ganhas"],
  ["lost", "Perdidas"],
] as const;

export type LeadDraft = {
  pipelineStage: string;
  priority: string;
  ownerId: string;
  nextActionAt: string;
  internalNotes: string;
  estimatedValue: string;
  source: string;
  tags: string;
};

function dateTime(value: string | null) {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function freshness(value: string | null) {
  if (!value) return "Nunca sincronizada";
  const hours = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 3_600_000));
  if (hours < 1) return "Atualizada agora";
  if (hours < 24) return "Há " + hours + "h";
  return "Há " + Math.round(hours / 24) + "d";
}

function metricNumber(metrics: Json, keys: string[]) {
  if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) return null;
  for (const key of keys) {
    const value = metrics[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function payloadText(payload: Json, path: string[]) {
  let current: Json | undefined = payload;
  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return "";
    current = current[key];
  }
  return typeof current === "string" ? current : "";
}

function setPayloadText(payload: Json, path: string[], value: string): Json {
  const root =
    payload && typeof payload === "object" && !Array.isArray(payload) ? { ...payload } : {};
  let current: Record<string, Json | undefined> = root;
  path.forEach((key, index) => {
    if (index === path.length - 1) {
      current[key] = value;
      return;
    }
    const child = current[key];
    const next = child && typeof child === "object" && !Array.isArray(child) ? { ...child } : {};
    current[key] = next;
    current = next;
  });
  return root;
}

function compact(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function SectionTitle({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div>
      <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-xl font-bold tracking-[-0.03em]">{title}</h2>
      <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="h-10 rounded-xl bg-muted/30" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 34 - ((value - min) / span) * 28;
      return String(x) + "," + String(y);
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 38" preserveAspectRatio="none" className="h-10 w-full" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        vectorEffect="non-scaling-stroke"
        className="text-primary"
      />
    </svg>
  );
}

export function ConnectionsPanel({
  talents,
  connections,
  snapshots,
  syncRuns,
  syncing,
  onSync,
}: {
  talents: TalentRow[];
  connections: SocialConnectionRow[];
  snapshots: SocialMetricSnapshotRow[];
  syncRuns: SocialSyncRunRow[];
  syncing: boolean;
  onSync: (ids: string[]) => void;
}) {
  const [term, setTerm] = useState("");
  const [platform, setPlatform] = useState("all");
  const [state, setState] = useState("attention");
  const [selected, setSelected] = useState<string[]>([]);
  const talentNames = useMemo(
    () => new Map(talents.map((talent) => [talent.id, talent.stage_name])),
    [talents],
  );
  const history = useMemo(() => {
    const map = new Map<string, SocialMetricSnapshotRow[]>();
    for (const snapshot of snapshots) {
      const rows = map.get(snapshot.connection_id) ?? [];
      rows.push(snapshot);
      map.set(snapshot.connection_id, rows);
    }
    for (const rows of map.values())
      rows.sort((a, b) => a.captured_at.localeCompare(b.captured_at));
    return map;
  }, [snapshots]);
  const rows = connections.filter((connection) => {
    if (connection.connection_method !== "oauth") return false;
    if (platform !== "all" && connection.platform !== platform) return false;
    const stale =
      !connection.last_synced_at ||
      Date.now() - new Date(connection.last_synced_at).getTime() > 172_800_000;
    if (state === "attention" && connection.connection_status === "connected" && !stale)
      return false;
    if (state === "connected" && connection.connection_status !== "connected") return false;
    if (state === "error" && connection.connection_status !== "error") return false;
    const needle = normalizeForSearch(term);
    return (
      !needle ||
      normalizeForSearch(
        (talentNames.get(connection.talent_id) ?? "") +
          " " +
          (connection.handle ?? "") +
          " " +
          connection.platform,
      ).includes(needle)
    );
  });

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <SectionTitle
            eyebrow="Operação social"
            title="Central de conexões"
            detail="Acompanhe autorização, frescor, falhas e histórico de cada plataforma."
          />
          <button
            type="button"
            disabled={syncing || selected.length === 0}
            onClick={() => onSync(selected)}
            className="gbz-interactive inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
            Sincronizar selecionadas {selected.length ? "(" + selected.length + ")" : ""}
          </button>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar creator, perfil ou plataforma"
              className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <select
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
            className="h-11 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          >
            <option value="all">Todas as plataformas</option>
            {Object.entries(PLATFORM_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={state}
            onChange={(event) => setState(event.target.value)}
            className="h-11 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
          >
            <option value="attention">Exigem atenção</option>
            <option value="all">Todos os estados</option>
            <option value="connected">Conectadas</option>
            <option value="error">Com erro</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-border bg-surface">
        <div className="hidden grid-cols-[auto_1.2fr_0.7fr_0.8fr_0.8fr_1fr_auto] gap-4 border-b border-border px-5 py-4 font-display text-[0.58rem] font-bold uppercase tracking-[0.14em] text-subtle xl:grid">
          <span />
          <span>Creator</span>
          <span>Plataforma</span>
          <span>Estado</span>
          <span>Última sync</span>
          <span>Histórico</span>
          <span>Ação</span>
        </div>
        <div className="divide-y divide-border">
          {rows.map((connection) => {
            const snapshotsForConnection = history.get(connection.id) ?? [];
            const chart = snapshotsForConnection.map(
              (snapshot) =>
                metricNumber(snapshot.metrics, [
                  "followers",
                  "subscriber_count",
                  "followers_count",
                  "view_count",
                ]) ?? 0,
            );
            const stale =
              !connection.last_synced_at ||
              Date.now() - new Date(connection.last_synced_at).getTime() > 172_800_000;
            const healthy = connection.connection_status === "connected" && !stale;
            return (
              <article
                key={connection.id}
                className="grid gap-4 px-5 py-5 xl:grid-cols-[auto_1.2fr_0.7fr_0.8fr_0.8fr_1fr_auto] xl:items-center"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(connection.id)}
                  onChange={() => toggle(connection.id)}
                  aria-label={"Selecionar " + (talentNames.get(connection.talent_id) ?? "conexão")}
                  className="h-4 w-4 accent-primary"
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">
                    {talentNames.get(connection.talent_id) ?? "Creator removido"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {connection.handle || connection.profile_url || "Sem perfil"}
                  </p>
                </div>
                <p className="text-sm font-semibold">{PLATFORM_LABEL[connection.platform]}</p>
                <div>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.11em]",
                      healthy
                        ? "bg-emerald-500/15 text-emerald-400"
                        : connection.connection_status === "error"
                          ? "bg-primary/15 text-primary"
                          : "bg-amber-500/15 text-amber-300",
                    )}
                  >
                    {healthy
                      ? "Saudável"
                      : connection.connection_status === "error"
                        ? "Erro"
                        : stale
                          ? "Desatualizada"
                          : "Pendente"}
                  </span>
                  {connection.last_sync_error ? (
                    <p
                      title={connection.last_sync_error}
                      className="mt-2 line-clamp-2 max-w-52 text-xs leading-relaxed text-primary"
                    >
                      {connection.last_sync_error}
                    </p>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {freshness(connection.last_synced_at)}
                </p>
                <Sparkline values={chart.slice(-18)} />
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => onSync([connection.id])}
                  className="gbz-interactive inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-4 font-display text-[0.62rem] font-bold uppercase tracking-[0.11em] text-muted-foreground fine-hover:hover:border-primary fine-hover:hover:text-primary"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Tentar
                </button>
              </article>
            );
          })}
          {!rows.length ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              Nenhuma conexão encontrada com estes filtros.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <SectionTitle
          eyebrow="Execuções"
          title="Histórico de sincronização"
          detail="Resultados das rotinas manuais e automáticas."
        />
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {syncRuns.slice(0, 6).map((run) => (
            <div key={run.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {run.trigger_source}
                </span>
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    run.failed ? "bg-primary" : "bg-emerald-400",
                  )}
                />
              </div>
              <p className="mt-4 font-display text-2xl font-bold">
                {run.succeeded}/{run.processed}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                contas atualizadas · {dateTime(run.started_at)}
              </p>
            </div>
          ))}
          {!syncRuns.length ? (
            <p className="text-sm text-muted-foreground">
              O histórico aparecerá após aplicar a migration e executar uma sincronização.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function AnalyticsPanel({
  talents,
  connections,
  snapshots,
}: {
  talents: TalentRow[];
  connections: SocialConnectionRow[];
  snapshots: SocialMetricSnapshotRow[];
}) {
  const [period, setPeriod] = useState(28);
  const cutoff = Date.now() - period * 86_400_000;
  const talentNames = useMemo(
    () => new Map(talents.map((talent) => [talent.id, talent.stage_name])),
    [talents],
  );
  const connectionById = useMemo(
    () => new Map(connections.map((connection) => [connection.id, connection])),
    [connections],
  );
  const recent = snapshots.filter((snapshot) => new Date(snapshot.captured_at).getTime() >= cutoff);
  const grouped = new Map<string, SocialMetricSnapshotRow[]>();
  for (const snapshot of recent) {
    const rows = grouped.get(snapshot.connection_id) ?? [];
    rows.push(snapshot);
    grouped.set(snapshot.connection_id, rows);
  }
  const growth = [...grouped.entries()]
    .flatMap(([connectionId, rows]) => {
      rows.sort((a, b) => a.captured_at.localeCompare(b.captured_at));
      const keys = ["followers", "subscriber_count", "followers_count", "view_count"];
      const first = metricNumber(rows[0]?.metrics ?? {}, keys);
      const last = metricNumber(rows.at(-1)?.metrics ?? {}, keys);
      const connection = connectionById.get(connectionId);
      if (first === null || last === null || !connection) return [];
      return [
        {
          connection,
          value: last - first,
          current: last,
          values: rows.map((row) => metricNumber(row.metrics, keys) ?? 0),
        },
      ];
    })
    .sort((a, b) => b.value - a.value);
  const healthy = connections.filter(
    (connection) => connection.connection_status === "connected",
  ).length;
  const stale = connections.filter(
    (connection) =>
      !connection.last_synced_at ||
      Date.now() - new Date(connection.last_synced_at).getTime() > 172_800_000,
  ).length;

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Inteligência"
            title="Analytics da operação"
            detail="Crescimento, cobertura das integrações e qualidade dos dados dos Media Kits."
          />
          <div className="flex rounded-full border border-border bg-background p-1">
            {[7, 28, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setPeriod(days)}
                className={cn(
                  "min-h-9 rounded-full px-4 text-xs font-bold",
                  period === days ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Database}
          label="Snapshots"
          value={recent.length}
          detail="pontos históricos no período"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Conexões saudáveis"
          value={healthy}
          detail="autorizações operando"
        />
        <MetricCard
          icon={Clock3}
          label="Dados vencidos"
          value={stale}
          detail="há mais de 48 horas"
        />
        <MetricCard
          icon={TrendingUp}
          label="Crescimento"
          value={growth.reduce((sum, item) => sum + Math.max(0, item.value), 0)}
          detail="crescimento agregado"
        />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
          <SectionTitle
            eyebrow="Ranking"
            title="Creators em crescimento"
            detail={"Variação observada nos últimos " + period + " dias."}
          />
          <div className="mt-5 divide-y divide-border">
            {growth.slice(0, 8).map((item, index) => (
              <div
                key={item.connection.id}
                className="grid grid-cols-[auto_1fr_100px_auto] items-center gap-4 py-4"
              >
                <span className="font-display text-xs font-bold text-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-sm font-bold">
                    {talentNames.get(item.connection.talent_id) ?? "Creator"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {PLATFORM_LABEL[item.connection.platform]} · {compact(item.current)}
                  </p>
                </div>
                <Sparkline values={item.values} />
                <span
                  className={cn(
                    "text-sm font-bold",
                    item.value >= 0 ? "text-emerald-400" : "text-primary",
                  )}
                >
                  {item.value >= 0 ? "+" : ""}
                  {compact(item.value)}
                </span>
              </div>
            ))}
            {!growth.length ? (
              <p className="py-8 text-sm text-muted-foreground">
                Ainda não há snapshots suficientes para comparar crescimento.
              </p>
            ) : null}
          </div>
        </article>
        <article className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
          <SectionTitle
            eyebrow="Cobertura"
            title="Plataformas"
            detail="Distribuição das conexões oficiais."
          />
          <div className="mt-6 space-y-5">
            {Object.entries(PLATFORM_LABEL).map(([key, label]) => {
              const count = connections.filter(
                (connection) =>
                  connection.platform === key && connection.connection_method === "oauth",
              ).length;
              const width = connections.length
                ? Math.max(3, (count / connections.length) * 100)
                : 3;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{label}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: String(width) + "%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-[24px] border border-border bg-surface p-5">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-6 font-display text-3xl font-bold">{compact(value)}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em]">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

export function LeadPipelinePanel({
  leads,
  profiles,
  onSave,
  saving,
}: {
  leads: LeadRow[];
  profiles: ProfileRow[];
  onSave: (id: string, draft: LeadDraft) => void;
  saving: boolean;
}) {
  const [term, setTerm] = useState("");
  const [editing, setEditing] = useState<LeadRow | null>(null);
  const [draft, setDraft] = useState<LeadDraft | null>(null);
  const filtered = leads.filter(
    (lead) =>
      !term ||
      normalizeForSearch(lead.name + " " + lead.email + " " + (lead.company ?? "")).includes(
        normalizeForSearch(term),
      ),
  );

  function open(lead: LeadRow) {
    setEditing(lead);
    setDraft({
      pipelineStage: lead.pipeline_stage || "new",
      priority: lead.priority || "normal",
      ownerId: lead.owner_id || "",
      nextActionAt: lead.next_action_at?.slice(0, 16) || "",
      internalNotes: lead.internal_notes || "",
      estimatedValue: lead.estimated_value?.toString() || "",
      source: lead.source || "",
      tags: lead.tags?.join(", ") || "",
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Comercial"
            title="Pipeline de oportunidades"
            detail="Organize marcas e creators por etapa, responsável, prioridade e próxima ação."
          />
          <label className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Buscar oportunidade"
              className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>
      <section className="overflow-x-auto pb-3">
        <div className="grid min-w-[1500px] grid-cols-7 gap-3">
          {PIPELINE_STAGES.map(([stage, label]) => {
            const stageLeads = filtered.filter((lead) => (lead.pipeline_stage || "new") === stage);
            const total = stageLeads.reduce(
              (sum, lead) => sum + Number(lead.estimated_value || 0),
              0,
            );
            return (
              <div key={stage} className="rounded-[22px] border border-border bg-surface/65 p-3">
                <div className="flex items-start justify-between gap-2 px-1 py-2">
                  <div>
                    <h3 className="font-display text-xs font-bold uppercase tracking-[0.1em]">
                      {label}
                    </h3>
                    <p className="mt-1 text-[0.65rem] text-muted-foreground">
                      {stageLeads.length} ·{" "}
                      {total
                        ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "sem valor"}
                    </p>
                  </div>
                  <span className="grid h-7 min-w-7 place-items-center rounded-full bg-muted text-xs font-bold">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {stageLeads.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => open(lead)}
                      className="gbz-interactive w-full rounded-2xl border border-border bg-background p-4 text-left fine-hover:hover:border-primary/50"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            lead.priority === "urgent"
                              ? "bg-primary"
                              : lead.priority === "high"
                                ? "bg-amber-400"
                                : "bg-subtle",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-bold">{lead.name}</p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {lead.company || lead.creator_type || lead.email}
                          </p>
                        </div>
                      </div>
                      {lead.next_action_at ? (
                        <p className="mt-3 flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
                          <Clock3 className="h-3 w-3" /> {dateTime(lead.next_action_at)}
                        </p>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {editing && draft ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/65"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-drawer-title"
            className="admin-drawer h-full w-full max-w-xl overflow-y-auto border-l border-border bg-surface p-6 shadow-2xl md:p-8"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.17em] text-primary">
                  {editing.kind === "brand" ? "Marca" : "Creator"}
                </p>
                <h2 id="lead-drawer-title" className="mt-2 font-display text-2xl font-bold">
                  {editing.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {editing.email} · {editing.whatsapp || "sem WhatsApp"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="gbz-interactive grid h-10 w-10 place-items-center rounded-full border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <FieldSelect
                label="Etapa"
                value={draft.pipelineStage}
                onChange={(value) => setDraft({ ...draft, pipelineStage: value })}
                options={PIPELINE_STAGES}
              />
              <FieldSelect
                label="Prioridade"
                value={draft.priority}
                onChange={(value) => setDraft({ ...draft, priority: value })}
                options={[
                  ["low", "Baixa"],
                  ["normal", "Normal"],
                  ["high", "Alta"],
                  ["urgent", "Urgente"],
                ]}
              />
              <FieldSelect
                label="Responsável"
                value={draft.ownerId}
                onChange={(value) => setDraft({ ...draft, ownerId: value })}
                options={[
                  ["", "Sem responsável"],
                  ...profiles.map(
                    (profile) =>
                      [profile.user_id, profile.display_name || profile.email] as [string, string],
                  ),
                ]}
              />
              <FieldInput
                label="Próxima ação"
                type="datetime-local"
                value={draft.nextActionAt}
                onChange={(value) => setDraft({ ...draft, nextActionAt: value })}
              />
              <FieldInput
                label="Valor estimado"
                type="number"
                value={draft.estimatedValue}
                onChange={(value) => setDraft({ ...draft, estimatedValue: value })}
              />
              <FieldInput
                label="Origem"
                value={draft.source}
                onChange={(value) => setDraft({ ...draft, source: value })}
              />
              <div className="sm:col-span-2">
                <FieldInput
                  label="Tags separadas por vírgula"
                  value={draft.tags}
                  onChange={(value) => setDraft({ ...draft, tags: value })}
                />
              </div>
              <label className="sm:col-span-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-subtle">
                Notas internas
                <textarea
                  value={draft.internalNotes}
                  onChange={(event) => setDraft({ ...draft, internalNotes: event.target.value })}
                  className="mt-2 min-h-32 w-full rounded-2xl border border-border bg-background p-4 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="mt-8 rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-subtle">
                Mensagem original
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {editing.message || editing.profiles || "Nenhuma mensagem informada."}
              </p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave(editing.id, draft)}
              className="gbz-interactive mt-8 min-h-12 w-full rounded-full bg-primary font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
            >
              {saving ? "Salvando" : "Salvar oportunidade"}
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-subtle">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
      />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <label className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-subtle">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ContentOperationsPanel({
  content,
  blogCount,
  onSave,
  saving,
}: {
  content: SiteContentRow[];
  blogCount: number;
  onSave: (item: SiteContentRow) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState<SiteContentRow | null>(null);
  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <SectionTitle
          eyebrow="Conteúdo"
          title="Conteúdo do site"
          detail="Centralize as áreas institucionais que hoje exigem publicação de código."
        />
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {content.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setEditing(item)}
            className="gbz-interactive rounded-[24px] border border-border bg-surface p-5 text-left fine-hover:hover:border-primary/55"
          >
            <div className="flex items-center justify-between gap-3">
              <FileClock className="h-5 w-5 text-primary" />
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[0.56rem] font-bold uppercase tracking-[0.12em]",
                  item.status === "published"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {item.status}
              </span>
            </div>
            <h3 className="mt-6 font-display text-lg font-bold">
              {item.title || item.content_key}
            </h3>
            <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
              {item.description || "Sem descrição editorial."}
            </p>
            <p className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-subtle">
              <span>{item.locale}</span>
              <span>{dateTime(item.updated_at)}</span>
            </p>
          </button>
        ))}
        <div className="rounded-[24px] border border-border bg-surface p-5">
          <History className="h-5 w-5 text-primary" />
          <h3 className="mt-6 font-display text-lg font-bold">Blog</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {blogCount} artigos administrados pelo CMS.
          </p>
        </div>
        {!content.length ? (
          <div className="rounded-[24px] border border-dashed border-border p-6 text-sm text-muted-foreground">
            Aplique a migration operacional para habilitar o conteúdo centralizado.
          </div>
        ) : null}
      </section>
      {editing ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="admin-dialog w-full max-w-2xl rounded-[28px] border border-border bg-surface p-6 shadow-2xl md:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  {editing.content_key}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">Editar conteúdo</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="gbz-interactive grid h-10 w-10 place-items-center rounded-full border border-border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <FieldInput
                label="Título"
                value={editing.title || ""}
                onChange={(title) => setEditing({ ...editing, title })}
              />
              <FieldSelect
                label="Estado"
                value={editing.status}
                onChange={(status) => setEditing({ ...editing, status })}
                options={[
                  ["draft", "Rascunho"],
                  ["published", "Publicado"],
                  ["archived", "Arquivado"],
                ]}
              />
              <label className="sm:col-span-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-subtle">
                Descrição
                <textarea
                  value={editing.description || ""}
                  onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                  className="mt-2 min-h-28 w-full rounded-2xl border border-border bg-background p-4 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary"
                />
              </label>
              {editing.content_key === "homepage" ? (
                <div className="sm:col-span-2 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-primary">
                      Conteúdo publicado na página inicial
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Campos vazios continuam usando o texto padrão existente no código.
                    </p>
                  </div>
                  <FieldInput
                    label="Chamada superior do hero"
                    value={payloadText(editing.payload, ["hero", "eyebrow"])}
                    onChange={(value) =>
                      setEditing({
                        ...editing,
                        payload: setPayloadText(editing.payload, ["hero", "eyebrow"], value),
                      })
                    }
                  />
                  <FieldInput
                    label="Título do hero"
                    value={payloadText(editing.payload, ["hero", "title"])}
                    onChange={(value) =>
                      setEditing({
                        ...editing,
                        payload: setPayloadText(editing.payload, ["hero", "title"], value),
                      })
                    }
                  />
                  <FieldInput
                    label="Destaque do hero"
                    value={payloadText(editing.payload, ["hero", "titleAccent"])}
                    onChange={(value) =>
                      setEditing({
                        ...editing,
                        payload: setPayloadText(editing.payload, ["hero", "titleAccent"], value),
                      })
                    }
                  />
                  <FieldInput
                    label="Título para marcas"
                    value={payloadText(editing.payload, ["brands", "title"])}
                    onChange={(value) =>
                      setEditing({
                        ...editing,
                        payload: setPayloadText(editing.payload, ["brands", "title"], value),
                      })
                    }
                  />
                  <FieldInput
                    label="Título para times"
                    value={payloadText(editing.payload, ["teams", "title"])}
                    onChange={(value) =>
                      setEditing({
                        ...editing,
                        payload: setPayloadText(editing.payload, ["teams", "title"], value),
                      })
                    }
                  />
                  <FieldInput
                    label="Chamada final"
                    value={payloadText(editing.payload, ["finalCta", "title"])}
                    onChange={(value) =>
                      setEditing({
                        ...editing,
                        payload: setPayloadText(editing.payload, ["finalCta", "title"], value),
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave(editing)}
              className="gbz-interactive mt-7 min-h-12 w-full rounded-full bg-primary font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
            >
              {saving ? "Salvando" : "Salvar conteúdo"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SystemPanel({
  connections,
  syncRuns,
  authUsersError,
  schemaReady,
}: {
  connections: SocialConnectionRow[];
  syncRuns: SocialSyncRunRow[];
  authUsersError: string | null;
  schemaReady: boolean;
}) {
  const lastRun = syncRuns[0];
  const items = [
    {
      icon: Database,
      title: "Banco de dados",
      detail: "Supabase acessível e consultas administrativas respondendo.",
      ok: true,
    },
    {
      icon: KeyRound,
      title: "Gestão de usuários",
      detail: authUsersError || "Edge Function de usuários disponível.",
      ok: !authUsersError,
    },
    {
      icon: RefreshCw,
      title: "Rotina de sincronização",
      detail: lastRun
        ? lastRun.succeeded + "/" + lastRun.processed + " contas na última execução."
        : "Ainda sem execução registrada.",
      ok: Boolean(lastRun && !lastRun.failed),
    },
    {
      icon: ServerCog,
      title: "Schema operacional",
      detail: schemaReady
        ? "Auditoria, alertas e histórico habilitados."
        : "Migration operacional ainda não aplicada no Supabase.",
      ok: schemaReady,
    },
  ];
  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <SectionTitle
          eyebrow="Infraestrutura"
          title="Saúde do sistema"
          detail="Diagnóstico seguro das dependências, sem expor chaves sensíveis."
        />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.title} className="rounded-[24px] border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-muted">
                <item.icon className="h-5 w-5" />
              </span>
              {item.ok ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-primary" />
              )}
            </div>
            <h3 className="mt-6 font-display text-lg font-bold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
          </article>
        ))}
      </section>
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <SectionTitle
          eyebrow="Integrações"
          title="Cobertura por plataforma"
          detail="Contas OAuth encontradas e estado atual."
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Object.entries(PLATFORM_LABEL).map(([key, label]) => {
            const rows = connections.filter(
              (connection) =>
                connection.platform === key && connection.connection_method === "oauth",
            );
            const errors = rows.filter(
              (connection) => connection.connection_status === "error",
            ).length;
            return (
              <div key={key} className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em]">{label}</p>
                <p className="mt-4 font-display text-2xl font-bold">{rows.length}</p>
                <p
                  className={cn("mt-1 text-xs", errors ? "text-primary" : "text-muted-foreground")}
                >
                  {errors ? errors + " com erro" : "sem falhas registradas"}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function AuditPanel({
  logs,
  notifications,
  profiles,
  onResolve,
}: {
  logs: AdminAuditRow[];
  notifications: AdminNotificationRow[];
  profiles: ProfileRow[];
  onResolve: (id: number) => void;
}) {
  const actors = new Map(
    profiles.map((profile) => [profile.user_id, profile.display_name || profile.email]),
  );
  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <SectionTitle
          eyebrow="Alertas"
          title="Central de notificações"
          detail="Pendências que precisam de uma decisão administrativa."
        />
        <div className="mt-5 space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <div className="flex items-start gap-3">
                <Bell
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    notification.severity === "critical" ? "text-primary" : "text-amber-300",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold">{notification.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-3 text-[0.62rem] uppercase tracking-[0.1em] text-subtle">
                    {dateTime(notification.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onResolve(notification.id)}
                  className="gbz-interactive rounded-full border border-border px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Resolver
                </button>
              </div>
            </article>
          ))}
          {!notifications.length ? (
            <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Nenhum alerta aberto.
            </p>
          ) : null}
        </div>
      </section>
      <section className="rounded-[26px] border border-border bg-surface p-5 md:p-6">
        <SectionTitle
          eyebrow="Governança"
          title="Histórico de atividades"
          detail="Registro cronológico das alterações feitas no painel."
        />
        <div className="mt-5 divide-y divide-border">
          {logs.map((log) => (
            <div key={log.id} className="grid grid-cols-[auto_1fr_auto] gap-4 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-muted">
                <FileClock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{log.summary}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {actors.get(log.actor_id || "") || "Sistema"} · {log.entity_type}
                </p>
              </div>
              <p className="text-xs text-subtle">{dateTime(log.created_at)}</p>
            </div>
          ))}
          {!logs.length ? (
            <p className="py-8 text-sm text-muted-foreground">
              O histórico começará a ser preenchido após aplicar a migration.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function AccessHealthSummary({
  profiles,
  authUsers,
  creatorUserIds,
}: {
  profiles: ProfileRow[];
  authUsers: AdminUserRow[];
  creatorUserIds: string[];
}) {
  const pending = profiles.filter((profile) => profile.must_change_password).length;
  const inactive = authUsers.filter((user) => !user.lastSignInAt).length;
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <MiniStat icon={UsersRound} label="Creators" value={creatorUserIds.length} />
      <MiniStat icon={KeyRound} label="Troca pendente" value={pending} />
      <MiniStat icon={WifiOff} label="Nunca acessaram" value={inactive} />
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted">
        <Icon className="h-4 w-4 text-primary" />
      </span>
      <div>
        <p className="font-display text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
