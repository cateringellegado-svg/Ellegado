import type { MetadataRoute } from "next";

const BASE_URL = "https://ellegado.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: BASE_URL, priority: 1, freq: "weekly" as const },
    { url: `${BASE_URL}/aviso-legal`, priority: 0.3, freq: "monthly" as const },
    { url: `${BASE_URL}/privacidad`, priority: 0.3, freq: "monthly" as const },
    { url: `${BASE_URL}/terminos`, priority: 0.3, freq: "monthly" as const },
  ];

  return routes.map((r) => ({
    url: r.url,
    lastModified: new Date(),
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
