import { Instagram, Youtube, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function Footer() {
  const { t } = useI18n();
  const { openBrandModal, openCreatorModal } = useModals();

  const navLinks = [
    { href: "#sobre", label: t.nav.about },
    { href: "#marcas", label: t.nav.brands },
    { href: "#times", label: t.nav.teams },
    { href: "#clientes", label: t.nav.clients },
    { href: "#talentos", label: t.nav.talents },
    { href: "#cases", label: t.nav.cases },
  ];

  const socials = [
    { label: "Instagram", icon: Instagram },
    { label: "YouTube", icon: Youtube },
    { label: "LinkedIn", icon: Linkedin },
  ];

  return (
    <footer id="contato" className="border-t border-border bg-surface">
      <div className="container-gbz grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="lg:col-span-1">
          <Logo className="h-10" />
          <p className="mt-5 max-w-[34ch] text-sm text-muted-foreground">{t.footer.phrase}</p>
          <a
            href="mailto:contato@gamerbiz.com.br"
            className="mt-6 inline-flex items-center gap-2 font-display text-sm font-bold text-foreground transition-colors duration-200 hover:text-primary"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            contato@gamerbiz.com.br
          </a>
          <p className="mt-2 font-display text-sm font-bold text-primary">@gamerbizbr</p>
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
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-subtle">
            {t.footer.services}
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {[...t.brands.services, ...t.teams.services].slice(0, 6).map((service) => (
              <li key={service.key}>{service.title}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-subtle">
            {t.footer.social}
          </h2>
          <ul className="mt-5 flex gap-3">
            {socials.map((social) => (
              <li key={social.label}>
                {/* TODO: substituir por URLs oficiais quando fornecidas */}
                <a
                  href="#contato"
                  aria-disabled="true"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
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
            Rua Cel Conrado Siqueira Campos, 133 — Apt 103, Jardim das Acácias, São Paulo/SP, CEP 04704-900
          </p>
          <p className="flex flex-wrap items-center justify-center gap-4 text-xs text-subtle">
            <span title={t.footer.legalUnavailable}>{t.footer.privacy}</span>
            <span title={t.footer.legalUnavailable}>{t.footer.terms}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
