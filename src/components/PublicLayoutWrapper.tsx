"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import PaymentStatusHandler from "@/components/PaymentStatusHandler";

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
      <CookieConsent />
    </>
  );
}
