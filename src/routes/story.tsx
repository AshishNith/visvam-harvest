import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { cImg } from "@/lib/products";
import walnuts1 from "@/assets/walnuts-1.png";

const storyImage = cImg("01_Almonds_Badam/DSC00445.jpg");

export const Route = createFileRoute("/story")({
  head: () => {
    const canonicalUrl = "https://visvam.in/story";
    const storySchema = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Our Story — Viśvam",
      "description":
        "Founded in Origin. Built on Knowledge. The best of anything is shaped at its origin. Discover the story behind Viśvam.",
      "url": canonicalUrl,
      "publisher": {
        "@type": "Organization",
        "name": "Viśvam",
      },
    };

    return {
      meta: [
        { title: "Our Story — Founded in Origin. Built on Knowledge. — Viśvam" },
        {
          name: "description",
          content:
            "Founded in Origin. Built on Knowledge. The best of anything is shaped at its origin. Discover the story behind Viśvam.",
        },
        {
          name: "keywords",
          content:
            "Viśvam story, single origin dry fruits, artisanal nuts, founded in origin, built on knowledge, Viśvam",
        },
        { property: "og:title", content: "Our Story — Founded in Origin. Built on Knowledge. — Viśvam" },
        {
          property: "og:description",
          content:
            "The best of anything is shaped at its origin. We started Viśvam to understand that beginning.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Our Story — Viśvam" },
        { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(storySchema),
        },
      ],
    };
  },
  component: Story,
});

function Story() {
  return (
    <SiteLayout>
      {/* Hero Header */}
      <section className="bg-cream/40 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
          <p className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase mb-6">
            Our Story
          </p>
          <h1 className="font-display italic text-4xl sm:text-6xl md:text-7xl lg:text-[84px] leading-[1.05] max-w-4xl mx-auto text-ink animate-fade-up">
            Founded in Origin.<br />Built on Knowledge.
          </h1>
        </div>
      </section>

      {/* Opening Movement: Origin & Character */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] lg:aspect-[5/4] rounded-2xl overflow-hidden bg-cream shadow-sm">
            <img
              src={storyImage}
              alt="An editorial still life of dates, almonds, walnuts, milk, and honey — the quiet origin of remarkable things"
              width={1200}
              height={1504}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-8 lg:pl-4">
            <div>
              <p className="font-display text-xl sm:text-2xl text-ink leading-relaxed font-normal mb-6">
                The best of anything is shaped at its origin. In the ground it grew from, the season it was gathered, the conditions that were exactly right. Long before it reaches you, that quiet beginning is where its character is decided.
              </p>
              <div className="w-12 h-px bg-border my-6" />
              <p className="text-base text-muted-foreground leading-relaxed">
                We started Viśvam to understand that beginning. Not to take it on trust, but to know it. Where the best of a thing comes from, what the right conditions ask for, how to tell what is real from what only resembles it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Centerpiece Philosophy: The Meaning of Viśvam */}
      <section className="bg-cream/60 py-20 sm:py-28 border-y border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10.5px] tracking-[0.25em] text-muted-foreground uppercase mb-6">
            The Philosophy
          </p>
          <blockquote className="font-display italic text-2xl sm:text-4xl lg:text-5xl text-ink leading-[1.25] mb-8">
            “That knowing is the whole of what we do. It is also what the name holds.”
          </blockquote>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Viśvam means the whole of everything, and to know a thing truly you have to understand all of it, from where it began to the moment it reaches your hand.
          </p>
        </div>
      </section>

      {/* Second Movement: Slow Growth & World Vision */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col justify-center space-y-6 lg:pr-6">
            <h3 className="font-display italic text-3xl sm:text-4xl text-ink leading-snug">
              One remarkable thing at a time.
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              We grow slowly, and on purpose from one remarkable thing at a time, understood fully before the next. There is a whole world we mean to bring you this way.
            </p>
            <div className="pt-4">
              <p className="font-display italic text-2xl sm:text-3xl text-clay">
                This is where it begins.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 relative aspect-square sm:aspect-[4/3] lg:aspect-[5/4] rounded-2xl overflow-hidden bg-cream shadow-sm">
            <img
              src={walnuts1}
              alt="Extra-light premium walnut halves representing mindful sourcing and single-origin quality"
              width={1200}
              height={1504}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>


      {/* Closing Call to Explore */}
      <section className="bg-ink text-white py-20 sm:py-28 text-center">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <p className="text-[11px] tracking-[0.25em] text-white/60 uppercase mb-4">
            Viśvam
          </p>
          <h2 className="font-display italic text-3xl sm:text-5xl max-w-2xl mx-auto mb-8 leading-tight">
            This is where it begins.
          </h2>
          <Link
            to="/nuts"
            className="group inline-flex items-center gap-3 text-white text-[12px] font-medium tracked uppercase tracking-widest py-2 border-b-2 border-white/80 hover:text-clay hover:border-clay transition-all duration-300"
          >
            <span>Explore The Collection</span>
            <ArrowRight
              size={15}
              className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay"
            />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
