"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const queryError = searchParams.get("error");
  const [error, setError] = useState(
    queryError === "no_admin" ? "Acceso denegado — no tienes permisos de administrador" : ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        setError("Acceso denegado — no tienes permisos de administrador");
        setLoading(false);
        return;
      }

      const redirectTo = searchParams.get("redirect") || "/admin/financiero";
      router.push(redirectTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-copper rounded-full mb-6">
            <span className="font-serif text-3xl text-white font-bold">L</span>
          </div>
          <h1 className="font-serif text-3xl text-dark-elegant mb-2">
            El Legado
          </h1>
          <p className="text-slate-600 text-sm tracking-widest uppercase">
            Panel de Administración
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-brand-copper/10">
          <h2 className="font-serif text-2xl text-dark-elegant mb-6 text-center">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-brand-copper transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cream border border-brand-copper/20 rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-brand-copper transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-copper text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-brand-copper/30 hover:scale-[1.02] transition-all duration-300 uppercase tracking-widest text-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Conectando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          &copy; 2026 El Legado - Catering y Eventos
        </p>
      </div>
    </div>
  );
}
