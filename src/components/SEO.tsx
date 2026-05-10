import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_URL = "https://s-reptrack.app";
const DEFAULT_IMAGE = `${SITE_URL}/icon-512.png`;
const LOCALES = ["fr", "en", "es", "de", "it", "pt", "nl", "pl", "ru", "ja", "zh", "hi", "pa", "ta", "th", "id"];

export const SEO = ({
  title,
  description,
  canonical,
  keywords,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const fullTitle = title.includes("S-reptrack") ? title : `${title} | S-reptrack`;
  const url = canonical ? (canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`) : SITE_URL;
  const truncatedTitle = fullTitle.length > 60 ? fullTitle.slice(0, 57) + "..." : fullTitle;
  const truncatedDesc = description.length > 160 ? description.slice(0, 157) + "..." : description;
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{truncatedTitle}</title>
      <meta name="title" content={truncatedTitle} />
      <meta name="description" content={truncatedDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="S-reptrack" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={image} />

      {/* hreflang */}
      {LOCALES.map((loc) => (
        <link key={loc} rel="alternate" hrefLang={loc} href={url} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={url} />

      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
