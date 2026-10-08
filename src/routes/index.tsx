import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/praxis/dashboard";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — PRAXIS" },
      {
        name: "description",
        content:
          "Your agents, live operations, approvals and runtime health in the PRAXIS Command Center.",
      },
      { property: "og:title", content: "Command Center — PRAXIS" },
      {
        property: "og:description",
        content: "A unified command center for accountable autonomous operations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});