import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/gourmet")({
  head: () => {
    const canonicalUrl = "https://visvam.in/gourmet";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Gourmet Selection — Viśvam",
      "description": "Organic Kandahar Dried Figs, Royal Medjool Dates, Long Kishmish, Wild Berries & 7-in-1 Roasted Superseeds.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam"
      }
    };

    return {
      meta: [
        { title: "Gourmet Selection — Viśvam | Organic Figs, Medjool Dates & Superseeds" },
        {
          name: "description",
          content:
            "Buy Organic Kandahar Dried Figs (Anjeer), Royal Medjool King Dates, Long Green Kishmish, Wild Dried Berries, and 7-in-1 Superseeds Mix online.",
        },
        {
          name: "keywords",
          content: "organic anjeer online, Medjool dates India, green kishmish, dried cranberries, superseed mix, gourmet dry fruits Viśvam",
        },
        { property: "og:title", content: "Gourmet Selection — Viśvam" },
        { property: "og:description", content: "Sun-dried organic fruits and roasted superseed mixes." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Gourmet Selection — Viśvam" },
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
