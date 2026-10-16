import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";

const PackageCard = ({ pkg }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const packageSlug = pkg.slug || pkg.Slug || pkg.tour_slug || pkg.package_slug;

  // ✅ This keeps current page, example: /packages?page=3
  const backUrl = `${location.pathname}${location.search}`;

  const handleCardClick = () => {
    if (!packageSlug) {
      console.log("Package slug missing:", pkg);
      return;
    }

    navigate(`/packages/${packageSlug}`, {
      state: {
        from: backUrl,
      },
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      onClick={handleCardClick}
      className="
        group relative rounded-3xl overflow-hidden cursor-pointer
        bg-(--bg-card)
        border border-(--border-soft)
        shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]
        hover:border-(--gold-main)
        transition-all
      "
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={pkg.images?.[0]?.image || "/images/package-placeholder.jpg"}
          alt={pkg.tour_name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/package-placeholder.jpg";
          }}
          className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-start to-end text-black shadow-lg">
          ⭐ {pkg.rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col justify-between gap-5">
        <div>
          <h3 className="text-lg font-(--font-heading) text-(--gold-main) mb-1">
            {pkg.tour_name}
          </h3>

          <p className="text-sm text-(--text-muted)">
            {pkg.Country_City_Multicity}
          </p>

          <p className="text-sm text-(--text-muted) mt-1">
            {pkg.days} Days / {pkg.Number_of_nights} Nights
          </p>
        </div>

        <div className="w-full h-px bg-(--border-soft)" />

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-(--text-main)">
            ₹{Number(pkg.price).toLocaleString()}
          </span>

          <Link
            to={`/packages/${packageSlug}`}
            state={{ from: backUrl }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-linear-to-r from-start to-end text-black shadow-lg group-hover:scale-105 transition">
              View Details
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PackageCard;
