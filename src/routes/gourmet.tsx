import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/gourmet")({
  head: () => ({
    meta: [
      { title: "Gourmet Selection — Viśvam" },
      {
        name: "description",
        content:
          "Organic Kandahar Dried Figs, Royal Medjool Dates, Long Kishmish, Wild Berries & 7-in-1 Roasted Superseeds.",
      },
      { property: "og:title", content: "Gourmet Selection — Viśvam" },
      { property: "og:description", content: "Sun-dried organic fruits and roasted superseed mixes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="gourmet" />,
});
