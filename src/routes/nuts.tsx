import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/nuts")({
  head: () => {
    const canonicalUrl = "https://visvam.in/nuts";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Nuts & Dried Fruits — Viśvam",
      "description": "Discover thoughtfully sourced dry fruits and nuts, designed for moments of calm, clarity, and understated indulgence.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam"
      }
    };

    return {
      meta: [
        { title: "Nuts & Dried Fruits — Viśvam | Handpicked Single-Origin Nuts" },
        {
          name: "description",
          content:
            "Discover thoughtfully sourced dry fruits and nuts, designed for moments of calm, clarity, and understated indulgence.",
        },
        {
          name: "keywords",
          content: "almonds online, cashews online, Kashmiri walnuts, roasted pistachios, buy dry fruits online, single origin nuts India",
        },
        { property: "og:title", content: "Nuts & Dried Fruits — Viśvam" },
        { property: "og:description", content: "Cold-stored single-origin nuts sourced at peak maturity." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Nuts & Dried Fruits — Viśvam" },
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
  component: () => <CategoryPage category="nuts" />,
});
