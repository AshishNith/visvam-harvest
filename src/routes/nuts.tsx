import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/nuts")({
  head: () => ({
    meta: [
      { title: "Nuts & Kernels — Viśvam Harvest" },
      {
        name: "description",
        content:
          "Handpicked California Jumbo Almonds, W240 Whole Cashews, Kashmiri Extra-Light Walnuts and Roasted Pistachios.",
      },
      { property: "og:title", content: "Nuts & Kernels — Viśvam Harvest" },
      { property: "og:description", content: "Cold-stored single-origin nuts harvested at peak maturity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="nuts" />,
});
