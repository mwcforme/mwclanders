/**
 * Lightweight SEO hook — replaces react-helmet-async for this pure SPA.
 * Direct document.head manipulation: no SSR concerns, zero dependencies.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ORIGIN = "https://book.menswellnesscenters.com";
const DEFAULT_OG = `${ORIGIN}/og-image.jpg`;

function setMeta(attr: string, attrName: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${attrName}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrName);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string): void {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
}

/** Update document <head> meta tags reactively. No dependencies, pure DOM. */
export function useSEO({ title, description, ogImage }: SEOProps): null {
  const { pathname } = useLocation();
  const url  = `${ORIGIN}${pathname}`;
  const image = ogImage ?? DEFAULT_OG;

  useEffect(() => {
    document.title = title;
    setMeta("name",     "description",    description);
    setMeta("name",     "robots",         "noindex, nofollow, noarchive, nosnippet, noimageindex");
    setLink("canonical",                  url);
    setMeta("property", "og:url",         url);
    setMeta("property", "og:type",        "website");
    setMeta("property", "og:site_name",   "Men's Wellness Centers");
    setMeta("property", "og:title",       title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image",       image);
    setMeta("name",     "twitter:card",   "summary_large_image");
    setMeta("name",     "twitter:title",  title);
    setMeta("name",     "twitter:description", description);
    setMeta("name",     "twitter:image",  image);
  }, [title, description, url, image]);

  return null;
}

/** Inject a JSON-LD <script> into <head>. Returns a cleanup function. */
export function useJsonLd(json: string): void {
  useEffect(() => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = json;
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, [json]);
}
