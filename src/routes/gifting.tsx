import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/gifting")({
  head: () => ({
    meta: [
      { title: "Royal Gifting & Hampers — Viśvam Harvest" },
      {
        name: "description",
        content:
          "Handcrafted luxury presentation gift boxes and royal dry fruit hampers featuring vacuum-sealed fresh selections.",
      },
      { property: "og:title", content: "Royal Gifting & Hampers — Viśvam Harvest" },
      { property: "og:description", content: "Festive dry fruit gift boxes and royal gift hampers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="gifting" />,
});
