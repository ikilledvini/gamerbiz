import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import { fromLegalLanguageSlug } from "@/lib/legal-routes";

export const Route = createFileRoute("/tos/$lang")({
  head: ({ params }) => ({
    meta: [
      { title: `Terms of Service | Gamerbiz (${params.lang.toUpperCase()})` },
      {
        name: "description",
        content: "Terms governing access to and use of Gamerbiz digital services.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `https://gamerbiz.com.br/tos/${params.lang}`,
      },
    ],
  }),
  component: LocalizedTermsRoute,
});

function LocalizedTermsRoute() {
  const { lang } = Route.useParams();
  return (
    <LegalPage kind="terms" routeKind="tos" initialLang={fromLegalLanguageSlug(lang) ?? "pt-BR"} />
  );
}
