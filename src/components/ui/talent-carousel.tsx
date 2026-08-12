import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { TalentCard } from "@/components/ui/talent-card";
import { publishedTalents as fallbackTalents, type Talent } from "@/data/talents";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { listPublicTalents } from "@/lib/talents.functions";

const PAGE_SIZE = 5;

/**
 * Vitrine de talentos reutilizável (homepage e /links).
 * Fonte de verdade única: src/data/talents.ts
 */
export function TalentCarousel() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: publicTalents } = useQuery({
    queryKey: ["public-talents-carousel"],
    queryFn: () => listPublicTalents(),
    staleTime: 30_000,
  });
  const talents: Talent[] = publicTalents ?? fallbackTalents;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });
  const [selected, setSelected] = useState(0);
  const totalPages = Math.max(1, Math.ceil(talents.length / PAGE_SIZE));

  const scrollToPage = useCallback(
    (pageIndex: number, jump = false) => {
      if (!emblaApi) return;
      const target = Math.min(pageIndex * PAGE_SIZE, Math.max(0, talents.length - PAGE_SIZE));
      emblaApi.scrollTo(Math.max(0, target), jump);
    },
    [emblaApi, talents.length],
  );

  const scrollNextPage = useCallback(
    (jump = false) => {
      scrollToPage(Math.min(selected + 1, totalPages - 1), jump);
    },
    [scrollToPage, selected, totalPages],
  );

  const scrollPrevPage = useCallback(
    (jump = false) => {
      scrollToPage(Math.max(selected - 1, 0), jump);
    },
    [scrollToPage, selected],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const snap = emblaApi.selectedScrollSnap();
    const page = Math.min(Math.round(snap / PAGE_SIZE), totalPages - 1);
    setSelected(Math.max(0, page));
  }, [emblaApi, totalPages]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  function handleMediaKit(talent: Talent) {
    void navigate({ to: "/mediakit/$slug", params: { slug: talent.slug } });
  }

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={500}>
      <div className="mt-8 flex items-center justify-center">
        <p
          aria-live="polite"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle"
        >
          {t.a11y.slideStatus} {selected + 1}/{totalPages}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label={t.a11y.prevSlide}
          disabled={selected === 0}
          onClick={() => scrollPrevPage()}
          className="gbz-interactive hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-[transform,border-color,color,opacity] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35 fine-hover:hover:border-primary fine-hover:hover:text-primary sm:flex"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div
          className="min-w-0 flex-1 overflow-hidden"
          ref={emblaRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={t.talents.eyebrow}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollNextPage(true);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              scrollPrevPage(true);
            }
          }}
        >
          <ul className="flex gap-5 py-5">
            {talents.map((talent) => (
              <li
                key={talent.id}
                className="min-w-0 shrink-0 basis-[78%] sm:basis-[48%] lg:basis-[calc(20%-16px)]"
              >
                <TalentCard talent={talent} onMediaKit={handleMediaKit} />
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          aria-label={t.a11y.nextSlide}
          disabled={selected === totalPages - 1}
          onClick={() => scrollNextPage()}
          className="gbz-interactive hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-[transform,border-color,color,opacity] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35 fine-hover:hover:border-primary fine-hover:hover:text-primary sm:flex"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${t.a11y.goToSlide} ${index + 1}`}
            aria-current={index === selected ? "true" : undefined}
            onClick={() => scrollToPage(index)}
            className="group flex h-8 w-8 items-center justify-center rounded-full"
          >
            <span
              aria-hidden="true"
              className={cn(
                "block h-2 w-2 rounded-full transition-[transform,background-color] duration-[160ms] ease-[var(--ease-out-gbz)]",
                index === selected
                  ? "scale-x-4 bg-primary"
                  : "scale-x-100 bg-border fine-hover:group-hover:bg-subtle",
              )}
            />
          </button>
        ))}
      </div>
    </Tooltip.Provider>
  );
}
