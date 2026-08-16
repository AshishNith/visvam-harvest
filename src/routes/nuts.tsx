import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/nuts")({
  head: () => ({
    meta: [
      { title: "Nuts & Dried Fruits — Viśvam" },
      {
        name: "description",
        content:
          "Handpicked California Jumbo Almonds, W240 Whole Cashews, Kashmiri Extra-Light Walnuts, Roasted Pistachios, and Organic Dried Fruits.",
      },
      { property: "og:title", content: "Nuts & Dried Fruits — Viśvam" },
      { property: "og:description", content: "Cold-stored single-origin nuts harvested at peak maturity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="nuts" />,
});
