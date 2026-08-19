import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/gourmet")({
  head: () => {
    const canonicalUrl = "https://visvam.in/gourmet";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Gourmet — Viśvam",
      "description": "A little sweetness, a little savoury, and plenty of reasons to indulge. Carefully curated for you to discover, savour and share.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam"
      }
    };

    return {
      meta: [
        { title: "Gourmet — Viśvam | Handcrafted Dried Fruits & Superseeds" },
        {
          name: "description",
          content:
            "A little sweetness, a little savoury, and plenty of reasons to indulge. Carefully curated for you to discover, savour and share.",
        },
        {
          name: "keywords",
          content: "gourmet dry fruits, figs, Medjool dates, green kishmish, dried berries, superseeds, Viśvam",
        },
        { property: "og:title", content: "Gourmet — Viśvam" },
        { property: "og:description", content: "A little sweetness, a little savoury, and plenty of reasons to indulge. Carefully curated for you to discover, savour and share." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Gourmet — Viśvam" },
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
