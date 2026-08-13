import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import { fromLegalLanguageSlug } from "@/lib/legal-routes";

export const Route = createFileRoute("/privacy/$lang")({
  head: ({ params }) => ({
    meta: [
      { title: `Privacy Policy | Gamerbiz (${params.lang.toUpperCase()})` },
      {
        name: "description",
        content: "Gamerbiz privacy policy and personal data processing information.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `https://gamerbiz.com.br/privacy/${params.lang}`,
      },
    ],
  }),
  component: LocalizedPrivacyRoute,
});

function LocalizedPrivacyRoute() {
  const { lang } = Route.useParams();
  return (
    <LegalPage
      kind="privacy"
      routeKind="privacy"
      initialLang={fromLegalLanguageSlug(lang) ?? "pt-BR"}
    />
  );
}
