import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/_next/"],
      },
    ],
    sitemap: "https://ellegado.vercel.app/sitemap.xml",
  };
}
