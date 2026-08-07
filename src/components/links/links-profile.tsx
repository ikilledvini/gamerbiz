import { useI18n } from "@/i18n";
import avatarAsset from "@/assets/gamerbiz-links-avatar.png.asset.json";

export function LinksProfile() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-surface sm:h-28 sm:w-28">
        <img
          src={avatarAsset.url}
          alt="Gamerbiz"
          className="h-full w-full object-cover"
        />
      </div>
      <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-[2.05rem]">
        Gamerbiz
      </h1>
      <p className="mt-2 text-base text-muted-foreground sm:text-lg">{t.links.tagline}</p>
    </div>
  );
}
