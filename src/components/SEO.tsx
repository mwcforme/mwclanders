/**
 * SEO component — thin wrapper around useSEO hook.
 * Replaces react-helmet-async with direct DOM manipulation (pure SPA, no SSR).
 */
import { useSEO, type SEOProps } from "@/lib/useSEO";

export const SEO = (props: SEOProps): null => useSEO(props);
