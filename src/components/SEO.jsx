import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.flyinglyte.com";
const SITE_NAME = "FlyingLyte";
const DEFAULT_IMAGE = `${SITE_URL}/images/flying_logo.png`;
const DEFAULT_DESCRIPTION =
  "Book best travel packages, flights, hotels and holiday deals with FlyingLyte. Smart Trips. Zero hassle.";

const SEO = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  keywords,
  jsonLd,
}) => {
  const finalTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Premium Flights, Hotels & Holiday Packages`;

  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalCanonical = canonical || SITE_URL;
  const finalImage = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`)
    : DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={finalCanonical} />

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

      {/* Structured Data JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
