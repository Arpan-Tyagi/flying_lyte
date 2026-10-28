import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// The SPA rewrite in vercel.json still returns HTTP 200 for unknown URLs,
// so noindex keeps them out of Google until real 404 pages are pre-rendered.
const NotFound = () => {
  return (
    <div className="min-h-[60vh] bg-(--bg-main) text-white flex items-center justify-center px-4 py-24">
      <Helmet>
        <title>Page Not Found | FlyingLyte</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="text-center">
        <h1 className="text-4xl font-(--font-heading) text-(--gold-main) mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-white/70 mb-6">
          The page you are looking for may have been moved or removed.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="text-(--gold-main) underline">
            Go to homepage
          </Link>
          <Link to="/packages" className="text-(--gold-main) underline">
            Browse holiday packages
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
