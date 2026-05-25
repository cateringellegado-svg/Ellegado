"use client";

import { useEffect } from "react";
import { useSiteConfig } from "@/lib/site-config";

export default function DynamicSEO() {
  const config = useSiteConfig();

  useEffect(() => {
    document.title = config.seo.metaTitle;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", config.seo.metaDescription);
    setMeta("keywords", config.seo.keywords.join(", "));

    const ogImage = document.querySelector<HTMLMetaElement>(`meta[property="og:image"]`);
    if (ogImage && config.seo.ogImage) ogImage.content = config.seo.ogImage;

    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && config.images.favicon) favicon.href = config.images.favicon;
  }, [config.seo, config.images.favicon]);

  return null;
}
