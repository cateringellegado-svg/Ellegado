"use client";

import Link from "next/link";
import { useSiteConfig } from "@/lib/site-config";

export default function Footer() {
  const config = useSiteConfig();

  return (
    <footer className="py-20 bg-cream text-center border-t border-brand-copper/10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 items-start text-slate-600 text-sm">
        <div className="text-left space-y-3">
          <p className="font-bold text-brand-copper mb-4 uppercase tracking-widest text-xs">
            Contacto &amp; Horarios
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-copper shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href={`mailto:${config.contact.email}`} className="hover:text-brand-copper transition-colors">{config.contact.email}</a>
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-copper shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{config.footer.phone}</span>
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-copper shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{config.footer.address}</span>
          </p>
          {config.footer.schedule.map((s, i) => (
            <p key={i} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-copper shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {s.days}: {s.hours}
            </p>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <div className="font-serif text-2xl text-brand-copper tracking-[0.3em] font-bold mb-2 uppercase">
            EL LEGADO
          </div>
          <p className="italic mb-6 text-slate-600">{config.footer.text}</p>
          <div className="flex gap-4">
            {config.social.instagram && (
              <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-copper/10 text-brand-copper flex items-center justify-center hover:bg-brand-copper hover:text-white transition-colors" aria-label="Seguinos en Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {config.social.facebook && (
              <a href={config.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-copper/10 text-brand-copper flex items-center justify-center hover:bg-brand-copper hover:text-white transition-colors" aria-label="Seguinos en Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className="text-right flex flex-col items-end space-y-2">
          <p className="font-bold text-brand-copper mb-2 uppercase tracking-widest text-xs">Legales</p>
          <Link href="/aviso-legal" className="hover:text-brand-copper transition-colors">Aviso Legal</Link>
          <Link href="/privacidad" className="hover:text-brand-copper transition-colors">Política de Privacidad</Link>
          <Link href="/terminos" className="hover:text-brand-copper transition-colors">Términos y Condiciones</Link>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-brand-copper/5 text-[10px] text-slate-400 uppercase tracking-[0.2em]">
        {config.footer.copyright}
      </div>
    </footer>
  );
}
