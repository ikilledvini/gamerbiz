import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/termos-de-servico")({
  beforeLoad: () => {
    throw redirect({ to: "/tos/$lang", params: { lang: "pt" } });
  },
});
