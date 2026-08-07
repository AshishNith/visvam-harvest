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
import { Analytics } from "@vercel/analytics/react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../lib/cart-context";

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
            Harvest Path Lost
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            The dry fruit selection or page you are looking for has been relocated or is unavailable in our current harvest.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-ink text-white px-8 py-3.5 text-[11px] font-medium tracked uppercase tracking-widest hover:bg-clay transition-colors"
            >
              <span>Back to Harvest Home</span>
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

import { RoutePendingLoader } from "../components/PageLoader";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Viśvam Harvest — Premium Dry Fruits & Handpicked Nuts" },
      {
        name: "description",
        content:
          "Viśvam Harvest — cold-stored, single-origin dry fruits, jumbo almonds, W240 cashews, organic figs, dates and luxury gift hampers.",
      },
      { name: "author", content: "Viśvam Harvest" },
      { property: "og:title", content: "Viśvam Harvest — Premium Dry Fruits & Handpicked Nuts" },
      {
        property: "og:description",
        content: "Single-origin almonds, cashews, walnuts, dates and handcrafted gift boxes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
      </CartProvider>
    </QueryClientProvider>
  );
}
