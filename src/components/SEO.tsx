import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const ORIGIN = "https://book.menswellnesscenters.com";
const DEFAULT_OG = `${ORIGIN}/og-image.png`;

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
}

/**
 * Per-route head for the paid-traffic LP subdomain.
 * - Self-referencing canonical to book.menswellnesscenters.com (never points at the WP site).
 * - Re-asserts noindex/nofollow as belt-and-suspenders on top of index.html.
 */
export const SEO = ({ title, description, ogImage }: SEOProps) => {
  const { pathname } = useLocation();
  const url = `${ORIGIN}${pathname}`;
  const image = ogImage || DEFAULT_OG;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Men's Wellness Centers" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
