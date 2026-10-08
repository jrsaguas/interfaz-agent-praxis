import { createFileRoute, notFound } from "@tanstack/react-router";
import { sections } from "@/components/praxis/data";
import { SectionView } from "@/components/praxis/views";
export const Route = createFileRoute("/$section")({
  beforeLoad: ({ params }) => {
    if (!sections.some((s) => s.slug === params.section)) throw notFound();
  },
  head: ({ params }) => {
    const title = sections.find((s) => s.slug === params.section)?.label || "Workspace";
    const description = `${title} in PRAXIS: inspect, govern and operate your autonomous agent workspace.`;
    return {
      meta: [
        { title: `${title} — PRAXIS` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — PRAXIS` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: WorkspaceSection,
});
function WorkspaceSection() {
  const { section } = Route.useParams();
  return <SectionView key={section} section={section} />;
}