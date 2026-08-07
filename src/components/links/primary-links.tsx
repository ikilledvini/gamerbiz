import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Globe, Linkedin, Users } from "lucide-react";
import { gamerbizLinks } from "@/data/links";
import { useI18n } from "@/i18n";

const baseClass =
  "flex min-h-[60px] w-full items-center gap-3 rounded-[16px] bg-primary px-5 text-left font-display text-sm font-bold uppercase tracking-[0.08em] text-primary-foreground outline-offset-2 duration-200 ease-out [transition-property:transform,background-color,border-color,opacity] focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground active:scale-[0.97] sm:min-h-[68px] sm:text-base";

const hoverClass =
  "border border-transparent hover:-translate-y-0.5 hover:border-white/25 hover:bg-primary-dark";

export function PrimaryLinks() {
  const { t } = useI18n();

  function scrollToTalents(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = document.getElementById("talentos");
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", "#talentos");
  }

  return (
    <nav aria-label={t.links.talentsTitle} className="mt-9 flex flex-col gap-3">
      <a href="#talentos" onClick={scrollToTalents} className={`${baseClass} ${hoverClass}`}>
        <Users className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="flex-1">{t.links.talentsLink}</span>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>

      <Link to="/" className={`${baseClass} ${hoverClass}`}>
        <Globe className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="flex-1">{t.links.websiteLink}</span>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </Link>

      {gamerbizLinks.linkedin ? (
        <a
          href={gamerbizLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.links.social.linkedin}
          className={`${baseClass} ${hoverClass}`}
        >
          <Linkedin className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{t.links.linkedinLink}</span>
          <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      ) : (
        <span
          aria-disabled="true"
          className={`${baseClass} cursor-not-allowed border border-border bg-graphite text-muted-foreground opacity-70`}
        >
          <Linkedin className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{t.links.linkedinLink}</span>
          <span className="text-[0.6rem] tracking-[0.16em]">{t.links.soon}</span>
        </span>
      )}
    </nav>
  );
}
