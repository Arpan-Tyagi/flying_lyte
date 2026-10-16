import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import PackageCard from "./PackageCard";
import { publicApi } from "../../services/api";
import SEO from "../../components/SEO";

const PACKAGE_BG_IMAGE = "/images/travel-pattern-bg.jpeg";

const fetchPackages = async (page = 1, limit = 8, destination = "") => {
  const query = new URLSearchParams({
    page,
    page_size: limit,
    destination: destination || "",
  }).toString();

  const { data } = await publicApi.get(`/api/package/packages/?${query}`);

  const packages = data?.data || data?.results || [];

  return {
    packages,
    totalPages: data?.total_pages || Math.ceil((data?.count || 0) / limit),
    currentPage: data?.current_page || page,
    next: data?.next,
    previous: data?.previous,
  };
};

const PackageSection = ({ limit = 8 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isPackagesPage = location.pathname === "/packages";

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const destinationFromUrl = searchParams.get("destination") || "";

  const [page, setPage] = useState(isPackagesPage ? pageFromUrl : 1);
  const [destination, setDestination] = useState(
    isPackagesPage ? destinationFromUrl : "",
  );
  const [debouncedDestination, setDebouncedDestination] = useState(
    isPackagesPage ? destinationFromUrl : "",
  );

  const updateUrl = (newPage, newDestination = debouncedDestination) => {
    if (!isPackagesPage) return;

    const params = new URLSearchParams();

    if (newPage > 1) {
      params.set("page", String(newPage));
    }

    if (newDestination?.trim()) {
      params.set("destination", newDestination.trim());
    }

    const queryString = params.toString();

    navigate(queryString ? `/packages?${queryString}` : "/packages");
  };

  const handlePageChange = (newPage) => {
    const validPage = Math.max(1, newPage);

    setPage(validPage);
    updateUrl(validPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!isPackagesPage) return;

    setPage(pageFromUrl);
    setDestination(destinationFromUrl);
    setDebouncedDestination(destinationFromUrl);
  }, [pageFromUrl, destinationFromUrl, isPackagesPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedDestination = destination.trim();

      setDebouncedDestination(trimmedDestination);
      setPage(1);

      if (!isPackagesPage) return;

      const params = new URLSearchParams();

      if (trimmedDestination) {
        params.set("destination", trimmedDestination);
      }

      const queryString = params.toString();

      navigate(queryString ? `/packages?${queryString}` : "/packages");
    }, 500);

    return () => clearTimeout(timer);
  }, [destination, navigate, isPackagesPage]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["packages", page, debouncedDestination, limit],
    queryFn: () => fetchPackages(page, limit, debouncedDestination),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load packages");
    }
  }, [isError]);

  const packages = data?.packages ?? [];
  const totalPages = data?.totalPages ?? 1;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 35,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className="
        relative isolate overflow-hidden bg-[#090909]
        py-20 sm:py-22 md:py-24 lg:py-28 xl:py-32
      "
    >
      {isPackagesPage && (
        <SEO
          title="Curated Holiday Tour Packages & Itineraries"
          description="Discover handpicked holiday packages for Kashmir, Kerala, Korea, Vietnam, Dubai and more. Enjoy premium stays, curated itineraries, and 24/7 travel support with FlyingLyte."
          canonical="https://www.flyinglyte.com/packages"
        />
      )}
      {/* Background Image */}
      <img
        src={PACKAGE_BG_IMAGE}
        alt=""
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-0
          h-full w-full object-cover object-center
          opacity-90
        "
       loading="lazy" />

      {/* Very light dark overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-black/15" />

      {/* Top-bottom gradient only */}
      <div
        className="
          pointer-events-none absolute inset-0 z-0
          bg-linear-to-b from-black/55 via-transparent to-black/65
        "
      />

      {/* Decorative Glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-(--gold-main)/10 blur-3xl sm:h-72 sm:w-72 md:h-96 md:w-96" />
        <div className="absolute bottom-10 -left-24 h-56 w-56 rounded-full bg-white/5 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute -right-28 top-1/3 h-64 w-64 rounded-full bg-(--gold-main)/5 blur-3xl md:h-80 md:w-80" />
      </div>

      <div
        className="
          relative z-10 mx-auto w-full max-w-7xl
          px-4 sm:px-5 md:px-6 lg:px-8
        "
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="
            mx-auto max-w-3xl text-center
            mb-7 sm:mb-8 md:mb-10 lg:mb-12
          "
        >
          <div
            className="
    mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full
    border border-(--gold-main)/30 bg-black/30
    px-3 py-1.5 sm:px-4 sm:py-2
    text-[10px] sm:text-xs md:text-sm
    font-semibold uppercase tracking-[0.18em] sm:tracking-[0.25em]
    text-(--gold-main) backdrop-blur-md
    [text-shadow:0_2px_10px_rgba(0,0,0,0.95)]
  "
          >
            <MapPin size={15} />
            Explore Packages
          </div>

          <h2
            className="
    text-2xl font-bold leading-tight text-white
    [text-shadow:0_5px_24px_rgba(0,0,0,0.95)]
    sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
  "
          >
            Curated Travel{" "}
            <span className="text-(--gold-main) [text-shadow:0_5px_24px_rgba(0,0,0,0.95)]">
              Packages
            </span>
          </h2>

          <p
            className="
    mx-auto mt-3 max-w-2xl
    text-sm leading-6 text-gray-100
    [text-shadow:0_3px_16px_rgba(0,0,0,0.95)]
    sm:mt-4 sm:text-base sm:leading-7
    md:text-lg md:leading-8
  "
          >
            Discover handpicked holiday packages designed for unforgettable
            journeys, premium stays, and smooth travel experiences.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="
            mx-auto max-w-2xl
            mb-8 sm:mb-9 md:mb-10 lg:mb-12
          "
        >
          <div
            className="
              relative rounded-2xl border border-white/10
              bg-black/35 p-1.5 sm:p-2
              shadow-2xl shadow-black/20 backdrop-blur-xl
            "
          >
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--gold-main) sm:left-4"
                size={19}
              />

              <input
                type="text"
                placeholder="Search destination, city or country..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="
                  w-full rounded-xl border border-white/10 bg-black/70
                  py-3 pl-11 pr-3 text-sm text-white outline-none
                  transition-all duration-300 placeholder:text-gray-500
                  focus:border-(--gold-main) focus:ring-2 focus:ring-(--gold-main)/25
                  sm:py-3.5 sm:pl-12 sm:pr-4 sm:text-base
                  md:py-4
                "
              />
            </div>
          </div>
        </motion.div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div
            className="
              grid grid-cols-1
              gap-4 sm:grid-cols-2 sm:gap-5
              lg:grid-cols-4 lg:gap-6 xl:gap-8
            "
          >
            {[...Array(limit)].map((_, i) => (
              <div
                key={i}
                className="
                  overflow-hidden rounded-2xl border border-white/10
                  bg-black/35 p-2.5 shadow-xl shadow-black/20
                  backdrop-blur-md sm:rounded-3xl sm:p-3
                "
              >
                <div className="h-44 animate-pulse rounded-xl bg-white/10 sm:h-52 sm:rounded-2xl md:h-56" />

                <div className="mt-4 space-y-2.5 px-1 pb-2 sm:mt-5 sm:space-y-3 sm:pb-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
                  <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-white/10 sm:mt-5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Package Grid */}
        {!isLoading && packages.length > 0 && (
          <>
            <motion.div
              className="
                grid grid-cols-1
                gap-4 sm:grid-cols-2 sm:gap-5
                lg:grid-cols-4 lg:gap-6 xl:gap-8
              "
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id || pkg._id || pkg.slug}
                  pkg={pkg}
                  variants={cardVariants}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {isPackagesPage && totalPages > 1 && (
              <div
                className="
                  mt-8 flex flex-col items-center justify-center gap-3
                  sm:mt-10 sm:flex-row sm:gap-4
                  md:mt-12 lg:mt-14
                "
              >
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || !data?.previous}
                  className="
                    flex w-full items-center justify-center gap-2 rounded-xl
                    border border-(--gold-main)/70 px-5 py-2.5
                    text-sm font-semibold text-(--gold-main)
                    transition-all duration-300
                    hover:bg-(--gold-main) hover:text-black
                    disabled:cursor-not-allowed disabled:opacity-40
                    sm:w-auto sm:px-6 sm:py-3
                  "
                >
                  <ArrowLeft size={18} />
                  Previous
                </motion.button>

                <div
                  className="
                    w-full rounded-xl border border-white/10
                    bg-black/35 px-5 py-2.5 text-center
                    text-sm font-medium text-white backdrop-blur-md
                    sm:w-auto sm:py-3
                  "
                >
                  Page <span className="text-(--gold-main)">{page}</span> of{" "}
                  <span className="text-(--gold-main)">{totalPages}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || !data?.next}
                  className="
                    flex w-full items-center justify-center gap-2 rounded-xl
                    bg-(--gold-main) px-5 py-2.5
                    text-sm font-semibold text-black
                    transition-all duration-300
                    hover:-translate-y-0.5 hover:shadow-lg hover:shadow-(--gold-main)/20
                    disabled:cursor-not-allowed disabled:opacity-40
                    sm:w-auto sm:px-6 sm:py-3
                  "
                >
                  Next
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && packages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              mx-auto mt-8 flex min-h-75 max-w-xl flex-col
              items-center justify-center rounded-2xl border border-white/10
              bg-black/35 px-5 py-10 text-center
              shadow-2xl shadow-black/20 backdrop-blur-xl
              sm:mt-10 sm:min-h-85 sm:rounded-3xl sm:px-6 sm:py-12
              md:min-h-90
            "
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--gold-main)/10 text-(--gold-main) sm:mb-5 sm:h-16 sm:w-16">
              <Search size={26} />
            </div>

            <h3 className="text-xl font-bold text-white sm:text-2xl">
              No packages found
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-300 sm:text-base">
              We could not find any package for this destination. Try searching
              another city, country, or travel place.
            </p>

            {destination && (
              <button
                type="button"
                onClick={() => setDestination("")}
                className="
                  mt-5 rounded-xl bg-(--gold-main)
                  px-5 py-2.5 text-sm font-semibold text-black
                  transition hover:opacity-90
                  sm:mt-6 sm:px-6 sm:py-3
                "
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PackageSection;
