import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/exotic-seeds")({
  head: () => {
    const canonicalUrl = "https://visvam.in/exotic-seeds";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Exotic Seeds & Mixes — Viśvam",
      "description": "Raw Queensland Macadamia Nuts and 7-in-1 Roasted Superseeds Wellness Mix.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam"
      }
    };

    return {
      meta: [
        { title: "Exotic Superseeds & Macadamia Nuts — Viśvam" },
        {
          name: "description",
          content:
            "Shop raw Australian Macadamia nuts, chia seeds, pumpkin seeds, and 7-in-1 roasted superseeds wellness mix online.",
        },
        {
          name: "keywords",
          content: "macadamia nuts India, superseeds mix online, pumpkin seeds, chia seeds, keto nuts, exotic seeds Viśvam",
        },
        { property: "og:title", content: "Exotic Seeds & Mixes — Viśvam" },
        { property: "og:description", content: "Nutrient-rich exotic seeds and cold-shelled macadamia nuts." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Exotic Seeds & Mixes — Viśvam" },
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
  component: () => <CategoryPage category="gourmet" />,
});
