import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/gifting")({
  head: () => {
    const canonicalUrl = "https://visvam.in/gifting";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Royal Gifting & Hampers — Viśvam",
      "description": "Handcrafted luxury presentation gift boxes and royal dry fruit hampers featuring vacuum-sealed fresh selections.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam"
      }
    };

    return {
      meta: [
        { title: "Royal Dry Fruit Gifting & Luxury Hampers — Viśvam" },
        {
          name: "description",
          content:
            "Shop handcrafted luxury dry fruit gift boxes, corporate gift hampers, and festive celebration boxes containing single-origin nuts and organic dates.",
        },
        {
          name: "keywords",
          content: "dry fruit gift hampers, corporate dry fruit gifting, luxury gift boxes India, Diwali dry fruit hamper, Viśvam gift box",
        },
        { property: "og:title", content: "Royal Gifting & Hampers — Viśvam" },
        { property: "og:description", content: "Festive dry fruit gift boxes and royal hampers." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Royal Gifting & Hampers — Viśvam" },
        { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(collectionSchema),
        },
      ],
    };
  },
  component: () => <CategoryPage category="gifting" />,
});
