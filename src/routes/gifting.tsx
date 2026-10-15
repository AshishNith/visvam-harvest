import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/gifting")({
  head: () => {
    const canonicalUrl = "https://visvam.in/gifting";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Gifting — Viśvam",
      "description": "Celebratory dry fruit hampers featuring our finest nuts, dried fruits and kitchen selections.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam"
      }
    };

    return {
      meta: [
        { title: "Gifting — Viśvam | Luxury Dry Fruit Gift Boxes & Hampers" },
        {
          name: "description",
          content:
            "Celebratory dry fruit hampers featuring our finest nuts, dried fruits and kitchen selections.",
        },
        {
          name: "keywords",
          content: "luxury dry fruit gifting, bespoke corporate gifts, wedding favors dry fruits, Viśvam gifting, royal dry fruit hampers India",
        },
        { property: "og:title", content: "Gifting — Viśvam" },
        { property: "og:description", content: "Celebratory dry fruit hampers featuring our finest nuts, dried fruits and kitchen selections." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Gifting — Viśvam" },
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
