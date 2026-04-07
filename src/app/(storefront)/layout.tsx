import { Suspense, ViewTransition } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
// import { LanyardWrapper } from "@/components/effects/LanyardWrapper"; // hidden for now
import { Footer } from "@/components/layout/Footer";
import { Dock } from "@/components/layout/Dock";
import { ToastContainer } from "@/components/ui/ToastContainer";
import ClickSpark from "@/components/effects/ClickSpark";
import "../card-nav.css";

const AgeGate = dynamic(() => import("@/components/AgeGate").then(m => m.AgeGate));
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then(m => m.CartDrawer));
const ReturnVisitToast = dynamic(() => import("@/components/ui/ReturnVisitToast").then(m => m.ReturnVisitToast));

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClickSpark>
      <div className="storefront-content">
        <AnnouncementBar />
        <Suspense>
          <Header />
          {/* <LanyardWrapper /> */}
          <main style={{ viewTransitionName: 'main-content' }}>
            <ViewTransition>
              {children}
            </ViewTransition>
          </main>
          <Footer />
          <Dock />
          <CartDrawer />
          <ToastContainer />
          <ReturnVisitToast />
        </Suspense>
      </div>
      <AgeGate />
    </ClickSpark>
  );
}
