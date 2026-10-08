import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { sections } from "@/components/praxis/data";

function router() {
  return createRouter({ routeTree, context: { queryClient: new QueryClient() } });
}

describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const matches = router().matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches every declared workspace section", () => {
    const r = router();
    for (const section of sections.filter((s) => s.slug)) {
      const matches = r.matchRoutes(`/${section.slug}`);
      expect(matches.at(-1)?.routeId, section.slug).toBe("/$section");
    }
  });
});
