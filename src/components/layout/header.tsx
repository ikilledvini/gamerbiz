import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { GbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useI18n();
  const { openBrandModal, openCreatorModal } = useModals();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "#sobre", label: t.nav.about },
    { href: "#marcas", label: t.nav.brands },
    { href: "#times", label: t.nav.teams },
    { href: "#clientes", label: t.nav.clients },
    { href: "#talentos", label: t.nav.talents },
    { href: "#cases", label: t.nav.cases },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200 ease-out",
        scrolled
          ? "border-b border-border bg-background/92 backdrop-blur-md"
          : "border-b border-transparent bg-background/45 backdrop-blur-sm",
      )}
    >
      <div className="container-gbz flex h-[72px] items-center justify-between gap-6">
        <a href="#inicio" className="flex items-center" aria-label="Gamerbiz">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-display text-sm font-bold tracking-tight text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <GbzButton variant="outline" size="sm" onClick={() => openBrandModal()}>
            {t.actions.brand}
          </GbzButton>
          <GbzButton size="sm" onClick={openCreatorModal}>
            {t.actions.creator}
          </GbzButton>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 top-[72px] z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            id="mobile-menu"
            className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-border bg-background px-5 pb-10 pt-6"
            onClick={(event) => event.stopPropagation()}
          >
            <nav aria-label="Principal (mobile)" className="flex flex-col">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border py-4 font-display text-lg font-bold text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-6 flex items-center justify-center">
              <LanguageSwitcher />
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <GbzButton
                variant="outline"
                size="full"
                onClick={() => {
                  setMenuOpen(false);
                  openBrandModal();
                }}
              >
                {t.actions.brand}
              </GbzButton>
              <GbzButton
                size="full"
                onClick={() => {
                  setMenuOpen(false);
                  openCreatorModal();
                }}
              >
                {t.actions.creator}
              </GbzButton>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
