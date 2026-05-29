"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PoliticasPrivacidadText() {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "politicas_privacidad")
      .single()
      .then(({ data, error }: { data: { value: string } | null; error: unknown }) => {
        if (data && !error) {
          setHtml(data.value);
        } else {
          console.error("Error fetching politicas_privacidad:", error);
          setHtml("");
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-7 bg-slate-200 rounded w-1/3 mt-8" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-4/6" />
      </div>
    );
  }

  if (!html) return null;

  return <div className="space-y-6" dangerouslySetInnerHTML={{ __html: html }} />;
}
