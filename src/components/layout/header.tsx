import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { GbzButton, gbzButton } from "@/components/ui/gbz-button";
import { useModals } from "@/components/modals/modal-provider";
import { usePrefersReducedMotion } from "@/hooks/use-motion";
import { useI18n } from "@/i18n";

export function Header({ homeHrefPrefix = "" }: { homeHrefPrefix?: string }) {
  const { t } = useI18n();
  const { openBrandModal, openCreatorModal } = useModals();
  const reducedMotion = usePrefersReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMotion, setMenuMotion] = useState(false);
  const [visible, setVisible] = useState(true);

  const links = [
    { href: `${homeHrefPrefix}#sobre`, label: t.nav.about },
    { href: `${homeHrefPrefix}#marcas`, label: t.nav.brands },
    { href: `${homeHrefPrefix}#times`, label: t.nav.teams },
    { href: `${homeHrefPrefix}#clientes`, label: t.nav.clients },
    { href: `${homeHrefPrefix}#talentos`, label: t.nav.talents },
    { href: `${homeHrefPrefix}#cases`, label: t.nav.cases },
  ];

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 20) {
          setVisible(true);
        } else {
          setVisible(currentScrollY <= lastScrollY);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  const menuAnimation = menuMotion
    ? "menu-motion-gbz data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-[200ms] data-[state=open]:ease-[var(--ease-out-gbz)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-[140ms]"
    : "";

  return (
    <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-[200ms] ease-[var(--ease-out-gbz)] ${
          visible || menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[140px] bg-gradient-to-b from-black/55 via-black/25 to-transparent backdrop-blur-[5px] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,black_58%,transparent_100%)]"
        />
        <div className="container-gbz relative z-10 flex justify-center py-4">
          <div className="flex h-[68px] w-full max-w-[1240px] items-center gap-6">
            <a
              href={`${homeHrefPrefix}#inicio`}
              className="flex shrink-0 items-center"
              aria-label="Gamerbiz"
            >
              <Logo className="h-10" />
            </a>

            <nav
              aria-label="Principal"
              className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:flex 2xl:gap-6"
            >
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap font-display text-[0.9rem] font-bold tracking-tight text-white/80 transition-colors duration-[160ms] fine-hover:hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden shrink-0 items-center justify-end gap-2 xl:flex">
              <LanguageSwitcher className="mr-3" />
              <GbzButton variant="outline" size="sm" onClick={() => openBrandModal()}>
                {t.actions.brand}
              </GbzButton>
              <GbzButton size="sm" onClick={openCreatorModal}>
                {t.actions.creator}
              </GbzButton>
              <a
                href="/auth"
                className={gbzButton({ variant: "ghost", size: "sm", className: "text-white/55" })}
              >
                Login
              </a>
            </div>

            <Dialog.Trigger asChild>
              <button
                type="button"
                className="gbz-interactive ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-[transform,border-color,color] duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97] fine-hover:hover:border-primary fine-hover:hover:text-primary xl:hidden"
                aria-label={t.a11y.openMenu}
                onClick={(event) => setMenuMotion(event.detail > 0 && !reducedMotion)}
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </Dialog.Trigger>
          </div>
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className={`fixed inset-0 z-[65] bg-black/80 ${menuAnimation}`} />
        <Dialog.Content
          onEscapeKeyDown={() => setMenuMotion(false)}
          className={`fixed inset-0 z-[70] flex flex-col bg-background outline-none xl:hidden ${menuAnimation}`}
        >
          <Dialog.Title className="sr-only">{t.a11y.openMenu}</Dialog.Title>
          <div className="container-gbz flex h-[92px] shrink-0 items-center justify-between border-b border-border">
            <Logo className="h-10" />
            <Dialog.Close asChild>
              <button
                type="button"
                className="gbz-interactive flex h-11 w-11 items-center justify-center rounded-full border border-primary text-foreground transition-transform duration-[160ms] ease-[var(--ease-out-gbz)] active:scale-[0.97]"
                aria-label={t.a11y.closeMenu}
                onClick={(event) => setMenuMotion(event.detail > 0 && !reducedMotion)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="container-gbz min-h-0 flex-1 overflow-y-auto pb-10 pt-6">
            <nav aria-label="Principal (mobile)" className="flex flex-col">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => {
                    setMenuMotion(event.detail > 0 && !reducedMotion);
                    setMenuOpen(false);
                  }}
                  className="border-b border-border py-4 font-display text-lg font-bold text-foreground transition-colors duration-[160ms] fine-hover:hover:text-primary"
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
                  setMenuMotion(false);
                  setMenuOpen(false);
                  openBrandModal();
                }}
              >
                {t.actions.brand}
              </GbzButton>
              <GbzButton
                size="full"
                onClick={() => {
                  setMenuMotion(false);
                  setMenuOpen(false);
                  openCreatorModal();
                }}
              >
                {t.actions.creator}
              </GbzButton>
              <a
                href="/auth"
                onClick={() => {
                  setMenuMotion(false);
                  setMenuOpen(false);
                }}
                className={gbzButton({
                  variant: "ghost",
                  size: "full",
                  className: "text-muted-foreground",
                })}
              >
                Login
              </a>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
