import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/exotic-seeds")({
  head: () => ({
    meta: [
      { title: "Exotic Seeds & Mixes — Viśvam Harvest" },
      {
        name: "description",
        content:
          "Raw Queensland Macadamia Nuts and 7-in-1 Roasted Superseeds Wellness Mix.",
      },
      { property: "og:title", content: "Exotic Seeds & Mixes — Viśvam Harvest" },
      { property: "og:description", content: "Nutrient-rich exotic seeds and cold-shelled macadamia nuts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="gourmet" />,
});
