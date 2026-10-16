import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.flyinglyte.com";
const SITE_NAME = "FlyingLyte";
const DEFAULT_TITLE = "FlyingLyte - Premium Flights, Hotels & Holiday Packages";
const DEFAULT_DESCRIPTION =
  "Smart Trips. Zero hassle. Plan your journey with exclusive deals on flights, hotels, and holiday packages.";
const DEFAULT_IMAGE = `${SITE_URL}/images/HeroImage.jpg`;

/**
 * Deep SEO Module for route-level metadata, Open Graph, Twitter Cards, and Schema.
 */
const SEO = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  keywords,
  noindex = false,
  jsonLd,
}) => {
  const finalTitle = title
    ? `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalCanonical = canonical
    ? (canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`)
    : SITE_URL;
  const finalImage = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image}`)
    : DEFAULT_IMAGE;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={finalCanonical} />

      {/* Robots control */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:alt" content={finalTitle} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
