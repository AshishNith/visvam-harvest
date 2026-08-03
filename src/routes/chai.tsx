import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/CategoryPage";

export const Route = createFileRoute("/chai")({
  head: () => ({
    meta: [
      { title: "Nuts & Kernels — Viśvam Harvest" },
    ],
  }),
  component: () => <CategoryPage category="nuts" />,
});
