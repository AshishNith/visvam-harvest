import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/dried-fruits")({
  head: () => ({
    meta: [
      { title: "Dried Fruits & Dates — Viśvam" },
      {
        name: "description",
        content:
          "Organic Afghani Dried Figs (Anjeer), Royal Medjool Dates, Long Green Kishmish and Wild Berries.",
      },
      { property: "og:title", content: "Dried Fruits & Dates — Viśvam" },
      { property: "og:description", content: "Naturally sun-dried organic fruits with zero added sugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="gourmet" />,
});
