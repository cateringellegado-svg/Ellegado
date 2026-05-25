"use client";

import { ToastProvider } from "./Toast";
import { SiteConfigProvider } from "@/lib/site-config";
import DynamicSEO from "./DynamicSEO";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteConfigProvider>
      <DynamicSEO />
      <ToastProvider>{children}</ToastProvider>
    </SiteConfigProvider>
  );
}
