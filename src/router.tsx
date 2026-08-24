import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Prefetch a route's loader data on link hover/touchstart so the click
    // itself has nothing left to wait on — this is what was making
    // navigation (menu.$slug's blocking loader especially) feel frozen.
    defaultPreload: "intent",
    // If a navigation still can't be masked by preload (e.g. no hover on
    // touch, or the preload hadn't finished), show the pending bar almost
    // immediately instead of leaving the page looking stuck for 500ms.
    defaultPendingMs: 150,
    defaultPendingMinMs: 300,
  });

  return router;
};
