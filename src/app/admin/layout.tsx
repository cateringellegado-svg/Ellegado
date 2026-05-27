"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const NAV_ITEMS = [
  { section: "dashboard", label: "Dashboard", href: "/admin", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
  { section: "financiero", label: "Finanzas", href: "/admin/financiero", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { section: "cotizaciones", label: "Cotizaciones", href: "/admin/cotizaciones", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { section: "eventos", label: "Eventos", href: "/admin/eventos", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { section: "clientes", label: "Clientes", href: "/admin/clientes", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
  { section: "menus", label: "Menús", href: "/admin/menus", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
  { section: "inventario", label: "Inventario", href: "/admin/inventario", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
  { section: "config", label: "Configuración", href: "/admin/configuracion", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
  { section: "cms", label: "CMS del Sitio", href: "/admin/cms", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.75M12 3v1m0 16v1m8.66-13.66l-.71.71M4.34 7.34L3.63 6.63M20.36 17.36l-.71.71M4.34 16.66l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /> },
];

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/financiero": "Finanzas",
  "/admin/cotizaciones": "Cotizaciones",
  "/admin/eventos": "Eventos",
  "/admin/clientes": "Clientes",
  "/admin/menus": "Menús",
  "/admin/inventario": "Inventario",
  "/admin/configuracion": "Configuración",
  "/admin/cms": "CMS del Sitio",
  "/admin/login": "Iniciar Sesión",
};

const IDLE_TIMEOUT = 15 * 60 * 1000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [idleWarning, setIdleWarning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;
    let idleTimer: ReturnType<typeof setTimeout>;
    let warningTimer: ReturnType<typeof setTimeout>;

    const resetIdle = () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      setIdleWarning(false);
      if (pathname === "/admin/login") return;
      warningTimer = setTimeout(() => setIdleWarning(true), IDLE_TIMEOUT - 60_000);
      idleTimer = setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error("Error signing out on idle:", e);
        }
        if (mounted) router.push("/admin/login");
      }, IDLE_TIMEOUT);
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();

    async function checkAuth() {
      try {
        if (pathname === "/admin/login") {
          if (mounted) setChecking(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && mounted) router.push("/admin/login");
      } catch (e) {
        console.error("Error checking auth:", e);
      } finally {
        if (mounted) setChecking(false);
      }
    }
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.push("/admin/login");
    }) ?? { data: null };

    const refreshInterval = setInterval(async () => {
      try {
        if (pathname === "/admin/login") return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && mounted) router.push("/admin/login");
      } catch (e) {
        console.error("Error refreshing session:", e);
      }
    }, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      listener?.subscription.unsubscribe();
    };
  }, [pathname, router, supabase]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  if (pathname === "/admin/login") return <>{children}</>;

  if (checking) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand-copper/20 border-t-brand-copper rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const breadcrumb = BREADCRUMB_MAP[pathname] || "Admin";

  return (
    <div className="bg-cream min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-brand-copper/10 z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-64 w-72`}
      >
        <div className="p-6 border-b border-brand-copper/10">
          <Link href="/admin" className="flex items-center gap-3" onClick={closeSidebar}>
            <div className="w-10 h-10 bg-brand-copper rounded-full flex items-center justify-center">
              <span className="font-serif text-white font-bold">L</span>
            </div>
            <span className="font-serif text-xl text-dark-elegant tracking-widest">EL LEGADO</span>
          </Link>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-2">Panel Admin</p>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.section}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href) ? "bg-brand-copper text-white" : "text-slate-800 hover:bg-brand-copper/10"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-copper/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-brand-copper/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-dark-elegant cursor-pointer"
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <nav className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-brand-copper font-medium">{breadcrumb}</span>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors hidden sm:block cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      {idleWarning && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 shadow-xl max-w-xs animate-in slide-in-from-bottom-2">
          <p className="text-sm font-medium">¿Sigues ahí?</p>
          <p className="text-xs mt-1 text-amber-600">Tu sesión se cerrará por inactividad en menos de 1 minuto.</p>
        </div>
      )}
    </div>
  );
}
