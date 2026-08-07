import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { PageLoader } from "./PageLoader";
import { ScrollProgress } from "./ScrollProgress";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <PageLoader />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ScrollProgress />
    </div>
  );
}
