import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa6";
import { FileText } from "lucide-react";
import { useI18n } from "@/i18n";
import type { PlatformAnalytics, SyncedYouTubeAnalytics, TalentAnalytics } from "@/data/talents";
import { MediaKitSectionHeading } from "./media-kit-section-heading";

const AGE_COLORS = ["#FF1F30", "#F0303F", "#E8434F", "#EE6B74", "#F19198", "#F3B3B7", "#F5D0D3"];
const GENDER_COLORS = ["#E11D33", "#8FC3DC", "#F3B3B7"];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[32px] border border-border bg-surface p-6 md:p-8">{children}</div>
  );
}

const tooltipStyle = {
  backgroundColor: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
  fontFamily: "Manrope, system-ui, sans-serif",
} as const;

const tooltipTextStyle = {
  color: "var(--foreground)",
  fontFamily: "Manrope, system-ui, sans-serif",
  fontWeight: 600,
} as const;

function AgeChart({
  data,
  eyebrow,
  title,
}: {
  data: { label: string; value: number }[];
  eyebrow: string;
  title: string;
}) {
  return (
    <Card>
      <MediaKitSectionHeading eyebrow={eyebrow} title={title} level="h3" />
      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap="18%"
            maxBarSize={90}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--muted-foreground)", fontFamily: "Manrope", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontFamily: "Manrope", fontSize: 12 }}
            />
            <RTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              contentStyle={tooltipStyle}
              itemStyle={tooltipTextStyle}
              labelStyle={tooltipTextStyle}
              separator=""
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
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

function DailyViewsChart({
  data,
  eyebrow,
  title,
}: {
  data: { label: string; value: number }[];
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="lg:col-span-2">
      <Card>
        <MediaKitSectionHeading eyebrow={eyebrow} title={title} level="h3" />
        <div
          className="mt-6 h-[300px] w-full"
          role="img"
          aria-label={`${title}: ${data.map((point) => `${point.label}, ${point.value}`).join("; ")}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="youtube-views-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                interval="preserveStartEnd"
                minTickGap={28}
                tick={{ fill: "var(--muted-foreground)", fontFamily: "Manrope", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontFamily: "Manrope", fontSize: 11 }}
              />
              <RTooltip
                cursor={{ stroke: "var(--primary)", strokeOpacity: 0.45 }}
                contentStyle={tooltipStyle}
                itemStyle={tooltipTextStyle}
                labelStyle={tooltipTextStyle}
                separator=""
                formatter={(value: number) => [new Intl.NumberFormat().format(value), ""]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={3}
                fill="url(#youtube-views-gradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function GenderChart({
  data,
  eyebrow,
  title,
}: {
  data: { label: string; value: number }[];
  eyebrow: string;
  title: string;
}) {
  return (
    <Card>
      <MediaKitSectionHeading eyebrow={eyebrow} title={title} level="h3" />
      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={115}
              paddingAngle={1}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
              ))}
            </Pie>
            <RTooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipTextStyle}
              labelStyle={tooltipTextStyle}
              separator=""
              formatter={(value: number) => [`${value}%`, ""]}
            />
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
      <MediaKitSectionHeading eyebrow={eyebrow} title={title} level="h3" />
      <ul className="mt-6 flex flex-col gap-4">
        {data.map((item) => (
          <li key={item.label}>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-foreground">{item.label}</span>
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
        <div
          key={item.label}
          className="flex flex-col items-center rounded-[32px] border border-border bg-surface p-6 text-center md:p-8"
        >
          <p className="whitespace-nowrap font-display text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-subtle">
            {item.label}
          </p>
          <p className="mt-3 whitespace-nowrap font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  summary: <FileText className="h-4 w-4" aria-hidden="true" />,
  youtube: <FaYoutube className="h-4 w-4" aria-hidden="true" />,
  instagram: <FaInstagram className="h-4 w-4" aria-hidden="true" />,
  tiktok: <FaTiktok className="h-4 w-4" aria-hidden="true" />,
};

function formatMetric(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export function MediaKitAnalytics({
  analytics,
  youtubeAnalytics,
}: {
  analytics: TalentAnalytics | null;
  youtubeAnalytics?: SyncedYouTubeAnalytics | null;
}) {
  const { lang, t } = useI18n();
  const a = t.mediakit.analyticsUi;
  const dateFormatter = new Intl.DateTimeFormat(lang, { day: "2-digit", month: "short" });
  const regionNames = new Intl.DisplayNames([lang], { type: "region" });
  const genderLabels: Record<string, string> = {
    female: a.female,
    male: a.male,
    user_specified: a.userSpecified,
  };

  const formatAgeGroup = (label: string) => {
    if (label === "age65-") return "65+";
    return label.replace(/^age/, "").replace("-", "–");
  };

  const syncedYoutube = youtubeAnalytics
    ? {
        metrics: [
          { label: a.viewsLast28Days, value: formatMetric(youtubeAnalytics.views) },
          {
            label: a.watchTime,
            value: formatMetric(youtubeAnalytics.estimatedMinutesWatched),
          },
          {
            label: a.avgViewDuration,
            value: formatDuration(youtubeAnalytics.averageViewDurationSeconds),
          },
          {
            label: a.subscribersGained,
            value: formatMetric(youtubeAnalytics.subscribersGained),
          },
          { label: a.likes, value: formatMetric(youtubeAnalytics.likes) },
          { label: a.comments, value: formatMetric(youtubeAnalytics.comments) },
        ],
        dailyViews: youtubeAnalytics.dailyViews.map((point) => ({
          label: dateFormatter.format(new Date(`${point.label}T12:00:00Z`)),
          value: point.value,
        })),
        age: youtubeAnalytics.age.map((point) => ({
          label: formatAgeGroup(point.label),
          value: point.value,
        })),
        gender: youtubeAnalytics.gender.map((point) => ({
          label: genderLabels[point.label] ?? point.label,
          value: point.value,
        })),
        countries: youtubeAnalytics.countries.map((point) => ({
          label: regionNames.of(point.label) ?? point.label,
          value: point.value,
        })),
      }
    : null;
  const effectiveYoutube =
    syncedYoutube || analytics?.youtube
      ? {
          ...(analytics?.youtube ?? {}),
          metrics: [...(analytics?.youtube?.metrics ?? []), ...(syncedYoutube?.metrics ?? [])],
        }
      : null;
  const effectiveAnalytics: TalentAnalytics | null = effectiveYoutube
    ? { ...(analytics ?? {}), youtube: effectiveYoutube }
    : analytics;

  const tabs = (
    [
      { key: "summary", label: a.summary, data: effectiveAnalytics?.summary },
      { key: "youtube", label: t.mediakit.platforms.youtube, data: effectiveYoutube },
      {
        key: "instagram",
        label: t.mediakit.platforms.instagram,
        data: effectiveAnalytics?.instagram,
      },
      { key: "tiktok", label: t.mediakit.platforms.tiktok, data: effectiveAnalytics?.tiktok },
    ] as { key: string; label: string; data?: PlatformAnalytics | null }[]
  ).filter((tab) => tab.data);

  const [active, setActive] = useState(tabs[0]?.key ?? "summary");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex === null) return;

    event.preventDefault();
    setActive(tabs[nextIndex]!.key);
    tabRefs.current[nextIndex]?.focus();
  }

  if (tabs.length === 0) {
    return (
      <div className="rounded-[40px] border border-border bg-surface p-7 md:p-10">
        <MediaKitSectionHeading eyebrow={t.mediakit.eyebrow} title={t.mediakit.analytics} />
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {t.mediakit.analyticsEmpty}
        </p>
      </div>
    );
  }

  const current = (tabs.find((tab) => tab.key === active) ?? tabs[0])!;
  const data = current.data!;

  return (
    <section className="flex flex-col gap-5" aria-labelledby="mediakit-analytics-title">
      <div className="rounded-[40px] border border-border bg-surface p-5 md:p-8">
        <MediaKitSectionHeading
          eyebrow={t.mediakit.eyebrow}
          title={t.mediakit.analytics}
          id="mediakit-analytics-title"
        />
        <div
          role="tablist"
          aria-label={t.mediakit.analytics}
          className="mt-7 flex flex-wrap items-center gap-1.5 rounded-[24px] bg-muted/70 p-1.5"
        >
          {tabs.map((tab, index) => {
            const isActive = tab.key === current.key;
            return (
              <button
                key={tab.key}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`mediakit-tab-${tab.key}`}
                aria-controls={`mediakit-panel-${tab.key}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(tab.key)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`gbz-interactive inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-display text-sm font-bold transition-[transform,background-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground fine-hover:hover:text-foreground"
                }`}
              >
                {TAB_ICONS[tab.key]}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`mediakit-panel-${current.key}`}
        aria-labelledby={`mediakit-tab-${current.key}`}
        tabIndex={0}
        className="flex flex-col gap-5 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
      >
        {data.metrics && data.metrics.length > 0 ? <MetricGrid items={data.metrics} /> : null}

        <div className="grid gap-5 lg:grid-cols-2">
          {data.dailyViews && data.dailyViews.length > 0 ? (
            <DailyViewsChart data={data.dailyViews} eyebrow={a.reach} title={a.viewsLast28Days} />
          ) : null}
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
    </section>
  );
}
