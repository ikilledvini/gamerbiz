import { Instagram, Youtube } from "lucide-react";
import { gamerbizLinks } from "@/data/links";
import { useI18n } from "@/i18n";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.85-2.48v-3.2a5.75 5.75 0 1 0 4.94 5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function SocialLinks() {
  const { t } = useI18n();

  const items = [
    { url: gamerbizLinks.instagram, icon: Instagram, label: t.links.social.instagram },
    { url: gamerbizLinks.youtube, icon: Youtube, label: t.links.social.youtube },
    { url: gamerbizLinks.tiktok, icon: TikTokIcon, label: t.links.social.tiktok },
    { url: gamerbizLinks.x, icon: XIcon, label: t.links.social.x },
  ].filter((item): item is { url: string; icon: typeof Instagram; label: string } =>
    Boolean(item.url),
  );

  if (items.length === 0) return null;

  return (
    <ul className="mt-8 flex items-center justify-center gap-2">
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground outline-offset-2 duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground active:scale-[0.96] hover:-translate-y-0.5 hover:text-primary"
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
