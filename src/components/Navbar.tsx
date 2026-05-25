"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSiteConfig } from "@/lib/site-config";

export default function Navbar() {
  const config = useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const links = config.navbar.links;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    document.body.classList.remove("overflow-hidden");
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        document.body.classList.remove("overflow-hidden");
      } else {
        document.body.classList.add("overflow-hidden");
      }
      return !prev;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    },
    [closeMenu]
  );

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-brand-copper/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href={links[0]?.href || "#inicio"}
          className="flex items-center gap-3 group"
          aria-label="Volver al inicio"
        >
          <Image
            src={config.navbar.logoUrl}
            alt="Logo EL LEGADO"
            width={40}
            height={40}
            className="h-10 w-auto logo-glow"
          />
          <span className="font-serif font-semibold text-xl tracking-widest uppercase text-brand-copper group-hover:text-brand-copper-light transition-colors">
            EL LEGADO
          </span>
        </a>

        <div className="flex items-center space-x-4 md:space-x-8 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden sm:block hover:text-brand-copper transition-colors"
            >
              {link.label}
            </a>
          ))}

          <button
            onClick={toggleMenu}
            className="sm:hidden text-brand-copper p-2 focus:outline-none relative z-[60]"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl items-center justify-center gap-4 text-xs font-medium tracking-widest uppercase transition-all duration-300 text-center px-2 ${
          isOpen ? "flex flex-col" : "hidden"
        }`}
        onKeyDown={handleKeyDown}
      >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-link hover:text-brand-copper"
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}

        <button
          onClick={closeMenu}
          className="absolute top-6 right-6 text-brand-copper z-50 pointer-events-auto"
          aria-label="Cerrar menú"
        >
          <svg className="w-8 h-8 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
