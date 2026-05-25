"use client";

import { ToastProvider } from "./Toast";
import { SiteConfigProvider } from "@/lib/site-config";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteConfigProvider>
      <ToastProvider>{children}</ToastProvider>
    </SiteConfigProvider>
  );
}
