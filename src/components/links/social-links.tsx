import { FaInstagram, FaYoutube, FaTiktok, FaXTwitter } from "react-icons/fa6";
import { gamerbizLinks } from "@/data/links";
import { useI18n } from "@/i18n";

export function SocialLinks() {
  const { t } = useI18n();

  const items = [
    { url: gamerbizLinks.instagram, icon: FaInstagram, label: t.links.social.instagram },
    { url: gamerbizLinks.youtube, icon: FaYoutube, label: t.links.social.youtube },
    { url: gamerbizLinks.tiktok, icon: FaTiktok, label: t.links.social.tiktok },
    { url: gamerbizLinks.x, icon: FaXTwitter, label: t.links.social.x },
  ].filter((item): item is { url: string; icon: typeof FaInstagram; label: string } =>
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
            className="flex h-11 w-11 items-center justify-center rounded-full text-white outline-offset-2 duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground active:scale-[0.96] hover:-translate-y-0.5 hover:text-primary"
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
