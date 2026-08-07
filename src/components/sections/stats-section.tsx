import { useCountUp, useInView } from "@/hooks/use-motion";
import { useI18n } from "@/i18n";

function StatItem({
  value,
  prefix,
  label,
  active,
}: {
  value: number;
  prefix: string;
  label: string;
  active: boolean;
}) {
  const current = useCountUp(value, active);
  return (
    <div className="border-t border-border pt-6">
      <p className="font-display text-[clamp(2.4rem,1.4rem+3vw,4rem)] font-extrabold leading-none tracking-[-0.04em]">
        <span className="text-primary">{prefix}</span>
        {current}
      </p>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const { t } = useI18n();
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="numeros" className="section-gbz">
      <div ref={ref} className="container-gbz grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow-gbz">{t.stats.eyebrow}</p>
          <h2 className="title-gbz mt-4 max-w-[14ch]">{t.stats.title}</h2>
        </div>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {t.stats.items.map((item) => (
            <StatItem
              key={item.label}
              value={item.value}
              prefix={item.prefix}
              label={item.label}
              active={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
