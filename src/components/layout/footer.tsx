import { Mail } from "lucide-react";
import { FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { Logo } from "@/components/ui/logo";
import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";
import { legalPath } from "@/lib/legal-routes";
import { gamerbizLinks } from "@/data/links";

export function Footer({ homeHrefPrefix = "" }: { homeHrefPrefix?: string }) {
  const { lang, t } = useI18n();
  const { openBrandModal, openCreatorModal } = useModals();

  const navLinks = [{ href: "/blogs", label: "Blog" }];

  const socials = [
    { label: "Instagram", icon: FaInstagram, href: gamerbizLinks.instagram },
    { label: "YouTube", icon: FaYoutube, href: gamerbizLinks.youtube },
    { label: "LinkedIn", icon: FaLinkedin, href: gamerbizLinks.linkedin },
  ];

  return (
    <footer id="contato" className="border-t border-border bg-surface">
      <div className="container-gbz grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:py-20">
        <div className="lg:col-span-1">
          <Logo className="h-10" />
          <p className="mt-5 max-w-[34ch] text-sm text-muted-foreground">{t.footer.phrase}</p>
          <a
            href="mailto:contato@gamerbiz.com.br"
            className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold text-foreground transition-colors duration-[160ms] fine-hover:hover:text-primary"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            contato@gamerbiz.com.br
          </a>
        </div>

        <nav aria-label={t.footer.navigation}>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-subtle">
            {t.footer.navigation}
          </h2>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-[160ms] fine-hover:hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-subtle">
            {t.footer.social}
          </h2>
          <ul className="mt-5 flex gap-3">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="gbz-interactive flex h-11 w-11 items-center justify-center rounded-full border border-border text-subtle transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-95 fine-hover:hover:border-primary fine-hover:hover:text-primary"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            <GbzButton variant="outline" size="sm" onClick={() => openBrandModal()}>
              {t.actions.brand}
            </GbzButton>
            <GbzButton size="sm" onClick={openCreatorModal}>
              {t.actions.creator}
            </GbzButton>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-gbz flex flex-col items-center justify-between gap-4 py-6 text-center md:flex-row md:items-start md:text-left">
          <p className="text-xs text-subtle">{t.footer.rights}</p>
          <p className="max-w-[50ch] text-xs leading-relaxed text-subtle">
            CNPJ 41.605.881/0001-51
            <br />
            Rua Cel Conrado Siqueira Campos, 133 — Apt 103, Jardim das Acácias, São Paulo/SP, CEP
            04704-900
          </p>
          <nav
            aria-label={`${t.footer.privacy} / ${t.footer.terms}`}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <a
              href={legalPath("privacy", lang)}
              className="gbz-interactive inline-flex min-h-10 items-center rounded-full border border-border px-4 font-display text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:border-primary fine-hover:hover:text-primary"
            >
              {t.footer.privacy}
            </a>
            <a
              href={legalPath("tos", lang)}
              className="gbz-interactive inline-flex min-h-10 items-center rounded-full border border-border px-4 font-display text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:border-primary fine-hover:hover:text-primary"
            >
              {t.footer.terms}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
