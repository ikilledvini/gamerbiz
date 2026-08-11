import { cn } from "@/lib/utils";

type MediaKitSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  level?: "h2" | "h3";
  className?: string;
  id?: string;
};

export function MediaKitSectionHeading({
  eyebrow,
  title,
  description,
  level = "h2",
  className,
  id,
}: MediaKitSectionHeadingProps) {
  const Heading = level;

  return (
    <div className={className}>
      <p className="eyebrow-gbz flex items-center gap-3">
        <span className="inline-block h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
        {eyebrow}
      </p>
      <Heading
        id={id}
        className="mt-3 max-w-[24ch] font-display text-2xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground md:text-3xl lg:text-4xl"
      >
        {title}
      </Heading>
      {description ? (
        <p className="mt-4 max-w-[64ch] text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
