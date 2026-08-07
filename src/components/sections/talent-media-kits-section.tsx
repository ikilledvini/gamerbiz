import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { TalentCard } from "@/components/ui/talent-card";
import { talents, type Talent } from "@/data/talents";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

export function TalentMediaKitsSection() {
  const { t } = useI18n();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
  });
  const [selected, setSelected] = useState(0);
  const totalPages = Math.ceil(talents.length / PAGE_SIZE);

  const scrollToPage = useCallback(
    (pageIndex: number) => {
      if (!emblaApi) return;
      const target = Math.min(pageIndex * PAGE_SIZE, talents.length - PAGE_SIZE);
      emblaApi.scrollTo(Math.max(0, target));
    },
    [emblaApi],
  );

  const scrollNextPage = useCallback(() => {
    scrollToPage(Math.min(selected + 1, totalPages - 1));
  }, [scrollToPage, selected, totalPages]);

  const scrollPrevPage = useCallback(() => {
    scrollToPage(Math.max(selected - 1, 0));
  }, [scrollToPage, selected]);

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
    if (talent.mediaKitUrl) {
      window.location.href = talent.mediaKitUrl;
      return;
    }
    toast(t.talents.unavailable, { description: talent.stageName });
  }

  return (
    <Tooltip.Provider delayDuration={150}>
      <section id="talentos" className="section-gbz bg-surface">
        <div className="container-gbz">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow-gbz">{t.talents.eyebrow}</p>
              <h2 className="title-gbz mt-4 max-w-[16ch]">{t.talents.title}</h2>
              <a
                href="#talentos"
                onClick={() => scrollToPage(0)}
                className="mt-6 inline-flex rounded-full border border-border px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
              >
                {t.talents.allButton}
              </a>
            </div>
            <div>
              <p className="max-w-[52ch] text-base text-muted-foreground">
                {t.talents.description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <p aria-live="polite" className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">
              {t.a11y.slideStatus} {selected + 1}/{totalPages}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              aria-label={t.a11y.prevSlide}
              onClick={scrollPrevPage}
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:border-primary hover:text-primary sm:flex"
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
                  scrollNextPage();
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  scrollPrevPage();
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
              onClick={scrollNextPage}
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:border-primary hover:text-primary sm:flex"
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
                className={cn(
                  "h-2 rounded-full transition-all duration-200",
                  index === selected ? "w-8 bg-primary" : "w-2 bg-border hover:bg-subtle",
                )}
              />
            ))}
          </div>
        </div>
      </section>
    </Tooltip.Provider>
  );
}
