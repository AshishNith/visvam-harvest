import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/dried-fruits")({
  head: () => {
    const canonicalUrl = "https://visvam.in/dried-fruits";
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Dried Fruits & Dates — Viśvam",
      "description": "Organic Afghani Dried Figs (Anjeer), Royal Medjool Dates, Long Green Kishmish and Wild Berries.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam"
      }
    };

    return {
      meta: [
        { title: "Organic Dried Fruits & Medjool Dates — Viśvam" },
        {
          name: "description",
          content:
            "Shop organic sun-dried Kandahar Figs (Anjeer), Royal Medjool King Dates, Long Green Kishmish, and Wild Dried Berries online with zero added sugar.",
        },
        {
          name: "keywords",
          content: "organic dried fruits, buy anjeer online, Medjool dates India, green raisins online, dried berries mix Viśvam",
        },
        { property: "og:title", content: "Dried Fruits & Dates — Viśvam" },
        { property: "og:description", content: "Naturally sun-dried organic fruits with zero added sugar." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Dried Fruits & Dates — Viśvam" },
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
