import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import visvamLogo from "../assets/Visvam Logo.png";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../lib/cart-context";
import { AuthProvider } from "../lib/auth-context";

import { SiteLayout } from "../components/SiteLayout";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="flex min-h-[70vh] items-center justify-center bg-background px-6 py-24">
        <div className="max-w-lg text-center space-y-6">
          <p className="text-[11px] font-mono text-clay tracking-widest uppercase font-semibold">
            ERROR 404 &bull; COLLECTION NOT FOUND
          </p>
          <h1 className="font-display italic text-5xl sm:text-6xl text-ink">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            The dry fruit selection or page you are looking for has been relocated or is currently unavailable.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-ink text-white px-8 py-3.5 text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay transition-colors"
            >
              <span>Back to Home</span>
            </Link>
            <Link
              to="/nuts"
              className="inline-flex items-center gap-2 border border-ink text-ink px-8 py-3.5 text-[11px] font-medium tracked uppercase tracking-widest hover:bg-ink hover:text-white transition-colors"
            >
              <span>Explore Nuts Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display italic text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          An unexpected error occurred. Try refreshing or return to our homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-ink px-6 py-3 text-[11px] tracked text-white hover:bg-clay uppercase"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-ink px-6 py-3 text-[11px] tracked hover:bg-ink hover:text-white transition-colors uppercase"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

import { Analytics } from "@vercel/analytics/react";
import { PageLoader, RoutePendingLoader } from "../components/PageLoader";

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://visvam.in/#organization",
      "name": "Viśvam",
      "alternateName": "Viśvam",
      "url": "https://visvam.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://visvam.in/Visvam-Logo.png",
        "caption": "Viśvam Premium Dry Fruits Logo"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["en", "hi"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://visvam.in/#website",
      "url": "https://visvam.in",
      "name": "Viśvam — Premium Dry Fruits & Handpicked Nuts",
      "description": "Cold-stored, single-origin dry fruits, jumbo almonds, W240 cashews, organic figs, dates and luxury gift hampers.",
      "publisher": {
        "@id": "https://visvam.in/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://visvam.in/nuts?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Store",
      "@id": "https://visvam.in/#store",
      "name": "Viśvam Store",
      "url": "https://visvam.in",
      "image": "https://visvam.in/Visvam-Logo.png",
      "priceRange": "₹₹",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, Credit Card, UPI, Net Banking",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      }
    }
  ]
};

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
const gtmContainerId = import.meta.env.VITE_GTM_ID;
const googleSiteVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Viśvam — Premium Dry Fruits & Handpicked Nuts" },
      {
        name: "description",
        content:
          "Viśvam — cold-stored, single-origin dry fruits, jumbo almonds, W240 cashews, organic figs, dates and luxury gift hampers delivered in nitrogen-sealed packages.",
      },
      {
        name: "keywords",
        content:
          "dry fruits, premium nuts, California almonds, W240 cashews, Kashmiri walnuts, organic figs, Medjool dates, luxury gift hampers, cold stored dry fruits, single origin nuts, buy dry fruits online India",
      },
      { name: "author", content: "Viśvam" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      ...(googleSiteVerification
        ? [{ name: "google-site-verification", content: googleSiteVerification }]
        : []),
      { property: "og:site_name", content: "Viśvam" },
      { property: "og:title", content: "Viśvam — Premium Dry Fruits & Handpicked Nuts" },
      {
        property: "og:description",
        content: "Single-origin almonds, cashews, walnuts, dates and handcrafted luxury gift boxes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/" },
      { property: "og:image", content: "https://visvam.in/Visvam-Logo.png" },
      { property: "og:image:alt", content: "Viśvam Premium Dry Fruits" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@visvam" },
      { name: "twitter:title", content: "Viśvam — Premium Dry Fruits & Handpicked Nuts" },
      {
        name: "twitter:description",
        content: "Cold-stored, single-origin dry fruits and royal gift hampers.",
      },
      { name: "twitter:image", content: "https://visvam.in/Visvam-Logo.png" },
    ],
    links: [
      { rel: "canonical", href: "https://visvam.in/" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: visvamLogo },
      { rel: "icon", type: "image/png", href: visvamLogo },
      { rel: "shortcut icon", href: visvamLogo },
      { rel: "apple-touch-icon", href: visvamLogo },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationSchema),
      },
      ...(gaMeasurementId
        ? [
            {
              async: true,
              src: `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
            },
            {
              children: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaMeasurementId}');`,
            },
          ]
        : []),
      ...(gtmContainerId
        ? [
            {
              children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','${gtmContainerId}');`,
            },
          ]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: RoutePendingLoader,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <PageLoader />
          <Outlet />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
