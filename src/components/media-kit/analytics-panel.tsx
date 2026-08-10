import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, Instagram, Music, Youtube } from "lucide-react";
import { useI18n } from "@/i18n";
import type { PlatformAnalytics, TalentAnalytics } from "@/data/talents";

const AGE_COLORS = ["#FF1F30", "#F0303F", "#E8434F", "#EE6B74", "#F19198", "#F3B3B7", "#F5D0D3"];
const GENDER_COLORS = ["#E11D33", "#8FC3DC", "#F3B3B7"];

function PanelHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-subtle">
        <span className="inline-block h-3 w-[3px] rounded-full bg-primary" aria-hidden="true" />
        {eyebrow}
      </p>
      <h3 className="mt-1.5 font-display text-lg font-extrabold uppercase tracking-[0.04em] text-foreground">
        {title}
      </h3>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[24px] border border-border bg-surface p-6">{children}</div>;
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--foreground))",
} as const;

function AgeChart({ data, eyebrow, title }: { data: { label: string; value: number }[]; eyebrow: string; title: string }) {
  return (
    <Card>
      <PanelHeading eyebrow={eyebrow} title={title} />
      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <RTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={AGE_COLORS[index % AGE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function GenderChart({ data, eyebrow, title }: { data: { label: string; value: number }[]; eyebrow: string; title: string }) {
  return (
    <Card>
      <PanelHeading eyebrow={eyebrow} title={title} />
      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={70} outerRadius={115} paddingAngle={1} stroke="none" isAnimationActive={false}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
              ))}
            </Pie>
            <RTooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap items-center justify-center gap-5">
        {data.map((entry, index) => (
          <li key={entry.label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: GENDER_COLORS[index % GENDER_COLORS.length] }}
              aria-hidden="true"
            />
            {entry.label} · {entry.value}%
          </li>
        ))}
      </ul>
    </Card>
  );
}

function BarList({
  data,
  eyebrow,
  title,
}: {
  data: { label: string; value: number }[];
  eyebrow: string;
  title: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <Card>
      <PanelHeading eyebrow={eyebrow} title={title} />
      <ul className="mt-6 flex flex-col gap-4">
        {data.map((item) => (
          <li key={item.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-semibold text-foreground">{item.label}</span>
              <span className="text-muted-foreground">{item.value}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MetricGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-[24px] border border-border bg-surface p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-subtle">{item.label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  summary: <FileText className="h-4 w-4" aria-hidden="true" />,
  youtube: <Youtube className="h-4 w-4" aria-hidden="true" />,
  instagram: <Instagram className="h-4 w-4" aria-hidden="true" />,
  tiktok: <Music className="h-4 w-4" aria-hidden="true" />,
};

export function MediaKitAnalytics({ analytics }: { analytics: TalentAnalytics | null }) {
  const { t } = useI18n();
  const a = t.mediakit.analyticsUi;

  const tabs = (
    [
      { key: "summary", label: a.summary, data: analytics?.summary },
      { key: "youtube", label: t.mediakit.platforms.youtube, data: analytics?.youtube },
      { key: "instagram", label: t.mediakit.platforms.instagram, data: analytics?.instagram },
      { key: "tiktok", label: t.mediakit.platforms.tiktok, data: analytics?.tiktok },
    ] as { key: string; label: string; data?: PlatformAnalytics | null }[]
  ).filter((tab) => tab.data);

  const [active, setActive] = useState(tabs[0]?.key ?? "summary");

  if (tabs.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-surface p-8">
        <PanelHeading eyebrow={t.mediakit.eyebrow} title={t.mediakit.analytics} />
        <p className="mt-5 text-muted-foreground">{t.mediakit.analyticsEmpty}</p>
      </div>
    );
  }

  const current = (tabs.find((tab) => tab.key === active) ?? tabs[0])!;
  const data = current.data!;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[24px] border border-border bg-surface p-3">
        <div role="tablist" aria-label={t.mediakit.analytics} className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const isActive = tab.key === current.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.key)}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 font-display text-sm font-bold duration-200 active:scale-[0.97] ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {TAB_ICONS[tab.key]}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {data.metrics && data.metrics.length > 0 ? <MetricGrid items={data.metrics} /> : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {data.age && data.age.length > 0 ? (
          <AgeChart data={data.age} eyebrow={a.reach} title={a.age} />
        ) : null}
        {data.gender && data.gender.length > 0 ? (
          <GenderChart data={data.gender} eyebrow={a.media} title={a.gender} />
        ) : null}
        {data.countries && data.countries.length > 0 ? (
          <BarList data={data.countries} eyebrow={a.reach} title={a.countries} />
        ) : null}
        {data.languages && data.languages.length > 0 ? (
          <BarList data={data.languages} eyebrow={a.reach} title={a.languages} />
        ) : null}
      </div>
    </div>
  );
}
