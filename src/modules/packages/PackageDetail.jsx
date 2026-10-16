import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { privateApi, publicApi } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  CalendarDays,
  Building2,
  Camera,
  Car,
  ShieldCheck,
  Tag,
  Headphones,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Phone,
  Plane,
  MessageCircle,
  ChevronDown,
  Send,
  Sparkles,
  BadgePercent,
  MapPin,
  Hotel,
  Landmark,
  Wallet,
  Clock3,
  Award,
  Navigation,
} from "lucide-react";

const fetchPackage = async (slug) => {
  const res = await publicApi.get(`/api/package/packages/${slug}/`);
  return res.data?.data || res.data;
};

const formatPrice = (price) => {
  const value = Number(price) || 0;
  return value.toLocaleString("en-IN");
};

const splitLines = (text = "") => {
  return String(text)
    .split(/\r?\n|;|•/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.toLowerCase() !== "n.a.");
};

const parseItinerary = (text = "") => {
  if (!text || text === "N.A.") return [];

  const cleanText = String(text).replace(/\r/g, "").trim();

  const parts = cleanText
    .split(/(?=Day\s*\d+\s*:)/gi)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length) {
    return parts.map((item, index) => {
      const titleMatch = item.match(/^(Day\s*\d+\s*:?[^\n]*)/i);
      const title = titleMatch ? titleMatch[1].trim() : `Day ${index + 1}`;
      const description = item.replace(title, "").trim();

      return {
        day: index + 1,
        title,
        description,
      };
    });
  }

  return splitLines(text).map((item, index) => ({
    day: index + 1,
    title: `Day ${index + 1}`,
    description: item,
  }));
};

const PackageDetails = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);

  const [activeTab, setActiveTab] = useState("overview");
  const [openBookingForm, setOpenBookingForm] = useState(false);
  const [openQuoteForm, setOpenQuoteForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    adults: 1,
    children: 0,
    date: "",
    budget: "",
    request: "",
  });

  const {
    data: pkg = null,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["package", slug],
    queryFn: () => fetchPackage(slug),
    enabled: !!slug,
  });

  const images = pkg?.images || [];
  const heroImage = images?.[0]?.image || "/images/package-placeholder.jpg";

  const packageTitle = pkg?.tour_name || pkg?.title || "Holiday Package";
  const destination = pkg?.Country_City_Multicity || "India";
  const destinationName = destination.split(",")[0]?.trim() || "Dream";
  const rating = Number(pkg?.rating) || 4.8;

  const shortDescription =
    pkg?.seo_description && pkg.seo_description !== "N.A."
      ? pkg.seo_description
      : pkg?.description;

  const itineraryDays = useMemo(() => parseItinerary(pkg?.Itinery), [pkg]);
  const inclusions = useMemo(() => splitLines(pkg?.Inclusion), [pkg]);
  const exclusions = useMemo(() => splitLines(pkg?.Exclusion), [pkg]);

  const pricePerPerson = Number(pkg?.price) || 0;
  const totalPassengers = Math.max(
    1,
    Number(formData.adults) + Number(formData.children),
  );
  const totalPrice = pricePerPerson * totalPassengers;

  const handleBookClick = () => {
    if (!token) {
      navigate("/login", {
        state: { redirectTo: `/packages/${slug}`, openBooking: true },
      });
      return;
    }

    setOpenBookingForm(true);
  };

  const handleWhatsappInquiry = () => {
    const message = `Hello FlyingLyte, I want to enquire about this package:

Package: ${packageTitle}
Destination: ${destination}
Duration: ${pkg?.days} Days / ${pkg?.Number_of_nights} Nights
Price: ₹${formatPrice(pkg?.price)} per person

Please share more details.`;

    const phoneNumber = "919667455591";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank");
  };

  const handleQuoteWhatsapp = () => {
    if (!formData.name || !formData.phone || !formData.date) {
      toast.error("Please fill name, phone and travel date");
      return;
    }

    const message = `Hello FlyingLyte, I want to get a quote for this package:

Package: ${packageTitle}
Destination: ${destination}
Duration: ${pkg?.days} Days / ${pkg?.Number_of_nights} Nights
Starting Price: ₹${formatPrice(pkg?.price)} per person

My Details:
Name: ${formData.name}
Phone: ${formData.phone}
Travel Date: ${formData.date}
Budget: ${formData.budget || "Not mentioned"}

Please share the best quote and itinerary.`;

    const phoneNumber = "919667455591";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank");
    setOpenQuoteForm(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: packageTitle,
      text: pkg?.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Package link copied");
      }
    } catch {
      toast.error("Unable to share package");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateCount = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]:
        type === "adults"
          ? Math.max(1, Number(prev[type]) + value)
          : Math.max(0, Number(prev[type]) + value),
    }));
  };

  const createBooking = async (bookingData) => {
    const res = await privateApi.post(
      "/api/package/packages/book/",
      bookingData,
    );
    return res.data;
  };

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async (res) => {
      const booking = res.data;

      toast.success("Booking created. Redirecting to payment...");

      try {
        localStorage.setItem("packageBookingData", JSON.stringify(booking));

        const paymentPayload = {
          amount: String(Math.round(booking.total_price)),
          firstname: booking.customer?.name || formData.name,
          email: booking.customer?.email || formData.email,
          phone: booking.customer?.phone || formData.phone,
        };

        const paymentRes = await privateApi.post(
          "/payment/initiate/",
          paymentPayload,
        );

        if (typeof paymentRes.data === "string") {
          const container = document.createElement("div");
          container.innerHTML = paymentRes.data;
          container.style.display = "none";
          document.body.appendChild(container);

          const form = container.querySelector("#payuForm");

          if (form) {
            form.submit();
            return;
          }

          throw new Error("Payment form not found");
        }
      } catch (err) {
        console.log("PAYMENT ERROR:", err);
        toast.error("Payment initiation failed");
      }
    },
    onError: (err) => {
      console.log("BOOKING ERROR:", err);
      toast.error("Booking failed. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.adults ||
      !formData.date
    ) {
      toast.error("Please fill required details");
      return;
    }

    if (!token) {
      toast.error("Please login to book package");
      navigate("/login", {
        state: { redirectTo: `/packages/${slug}`, openBooking: true },
      });
      return;
    }

    bookingMutation.mutate({
      package_id: pkg.id,
      package_name: packageTitle,
      travel_date: formData.date,
      adults: Number(formData.adults),
      children: Number(formData.children),
      total_passengers: totalPassengers,
      total_price: totalPrice,
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
      request: formData.request,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--bg-main) flex items-center justify-center text-white px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-(--gold-main) border-t-transparent animate-spin" />
          <p className="text-gray-300">Loading package...</p>
        </div>
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="min-h-screen bg-(--bg-main) flex items-center justify-center text-red-400 px-4 text-center">
        Package not found
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "itinerary", label: "Itinerary" },
    { id: "inclusions", label: "Inclusions" },
    { id: "exclusions", label: "Exclusions" },
    { id: "gallery", label: "Gallery" },
  ];

  return (
    <>
      <Helmet>
        <title>{packageTitle} - FlyingLyte</title>
        <meta name="description" content={shortDescription} />
        <link rel="canonical" href={`https://www.flyinglyte.com/packages/${slug}`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FlyingLyte" />
        <meta property="og:title" content={`${packageTitle} - FlyingLyte`} />
        <meta property="og:description" content={shortDescription} />
        <meta property="og:url" content={`https://www.flyinglyte.com/packages/${slug}`} />
        <meta property="og:image" content={heroImage || "https://www.flyinglyte.com/images/HeroImage.jpg"} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${packageTitle} - FlyingLyte`} />
        <meta name="twitter:description" content={shortDescription} />
        <meta name="twitter:image" content={heroImage || "https://www.flyinglyte.com/images/HeroImage.jpg"} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": packageTitle,
            "description": shortDescription,
            "image": heroImage,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "INR",
              "price": pkg?.price || "0",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.flyinglyte.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Packages",
                "item": "https://www.flyinglyte.com/packages"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": packageTitle,
                "item": `https://www.flyinglyte.com/packages/${slug}`
              }
            ]
          })}
        </script>
      </Helmet>
      <div className="bg-(--bg-main) text-white min-h-screen pb-28 sm:pb-32 lg:pb-12 overflow-hidden">
        {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={packageTitle}
            className="w-full h-full object-cover object-center scale-100 brightness-[1.18] contrast-[1.08] saturate-[1.12]"
           loading="lazy" />

          {/* Very light overlay for clean image visibility */}
          <div className="absolute inset-0 bg-black/5" />

          {/* Soft bottom fade only */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-(--bg-main)" />

          {/* Light left shade for text readability */}
          <div className="absolute inset-0 bg-linear-to-r from-[#020617b3] via-[#02061733] to-transparent" />
        </div>

        <div className="absolute -top-24 -left-24 w-65 h-65 sm:w-[320px] sm:h-80 bg-yellow-500/8 blur-[90px] rounded-full" />
        <div className="absolute top-40 -right-24 w-65 h-65 sm:w-[320px] sm:h-80 bg-cyan-500/5 blur-[90px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-22 sm:pt-24 md:pt-28 lg:pt-30 pb-7 sm:pb-10 md:pb-12 lg:pb-16">
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
            <button
              onClick={() => navigate("/packages")}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-sm transition backdrop-blur-md"
            >
              <ArrowLeft size={15} />
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">Back to Packages</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-(--gold-main) hover:scale-105 transition">
                <Heart size={18} />
              </button>

              <button
                onClick={handleShare}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-(--gold-main) hover:scale-105 transition"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_390px] gap-7 sm:gap-8 md:gap-10 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-4xl min-w-0"
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 bg-yellow-400/15 border border-yellow-400/30 text-(--gold-main) px-3 py-1.5 rounded-full text-[11px] sm:text-sm font-semibold backdrop-blur-md">
                  <Sparkles size={14} />
                  Best Selling
                </div>

                <div className="inline-flex items-center gap-1.5 bg-red-500/15 border border-red-400/30 text-red-200 px-3 py-1.5 rounded-full text-[11px] sm:text-sm font-semibold backdrop-blur-md">
                  <BadgePercent size={14} />
                  Limited Seats
                </div>

                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white px-3 py-1.5 rounded-full text-[11px] sm:text-sm backdrop-blur-md max-w-full">
                  <MapPin size={14} className="text-(--gold-main) shrink-0" />
                  <span className="truncate max-w-55 sm:max-w-[320px] md:max-w-none">
                    {destination}
                  </span>
                </div>
              </div>

              <h1 className="text-[27px] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-(--font-hero) leading-[1.08] mb-3 sm:mb-4 md:mb-5 break-words">
                {packageTitle}
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 max-w-3xl leading-6 sm:leading-7 md:leading-8 mb-5 sm:mb-6 md:mb-7 line-clamp-3 sm:line-clamp-4">
                {shortDescription}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mb-5 sm:mb-7 md:mb-8">
                <HeroInfo
                  icon={<CalendarDays />}
                  title={`${pkg.days} Days`}
                  subtitle={`${pkg.Number_of_nights} Nights`}
                />
                <HeroInfo icon={<Hotel />} title="Hotels" subtitle="Included" />
                <HeroInfo
                  icon={<Landmark />}
                  title="Sightseeing"
                  subtitle="Included"
                />
                <HeroInfo
                  icon={<Car />}
                  title="Transfers"
                  subtitle="Included"
                />
              </div>

              <div className="relative bg-black/30 border border-white/15 rounded-[22px] sm:rounded-3xl p-4 sm:p-5 md:p-6 backdrop-blur-md max-w-3xl mb-5 sm:mb-6 md:mb-7 overflow-hidden shadow-2xl">
                <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-yellow-400/15 blur-[70px]" />

                <div className="relative grid md:grid-cols-[minmax(0,1fr)_auto] gap-5 md:gap-6 items-center">
                  <div className="min-w-0">
                    <p className="text-gray-300 text-xs sm:text-sm mb-1">
                      Starting From
                    </p>

                    <div className="flex flex-wrap items-end gap-1.5 sm:gap-2">
                      <span className="text-3xl sm:text-5xl md:text-6xl font-black text-(--gold-main)">
                        ₹{formatPrice(pkg.price)}
                      </span>
                      <span className="text-gray-200 mb-1 sm:mb-2 text-xs sm:text-base">
                        / Per Person
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-3 sm:mt-4 text-[11px] sm:text-sm text-gray-200">
                      <span className="inline-flex items-center gap-1.5">
                        <Star
                          size={15}
                          fill="currentColor"
                          className="text-(--gold-main)"
                        />
                        {rating}/5 Rating
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Award size={15} className="text-(--gold-main)" />
                        Trusted Travelers
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 md:min-w-57.5">
                    <button
                      onClick={handleBookClick}
                      className="relative overflow-hidden bg-linear-to-r from-start to-end text-black font-bold py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition shadow-[0_15px_40px_rgba(245,186,74,0.25)]"
                    >
                      <CalendarDays size={18} />
                      Book Now
                    </button>

                    <button
                      onClick={handleWhatsappInquiry}
                      className="bg-green-600/95 hover:bg-green-600 text-white font-bold py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2 transition"
                    >
                      <MessageCircle size={18} />
                      WhatsApp Enquiry
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl">
                <TrustPill icon={<ShieldCheck />} title="Secure Booking" />
                <TrustPill icon={<Wallet />} title="Best Price" />
                <TrustPill icon={<Clock3 />} title="24/7 Support" />
                <TrustPill
                  icon={<SlidersHorizontal />}
                  title="Customize Trip"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65 }}
              className="hidden lg:block"
            >
              <div className="relative bg-black/35 backdrop-blur-lg border border-white/15 rounded-[30px] p-6 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-400/20 blur-[75px] rounded-full" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-(--gold-main) mb-4">
                    <Navigation size={26} />
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    Plan Your {destinationName} Trip
                  </h3>

                  <p className="text-gray-300 text-sm mt-1 mb-5 leading-6">
                    Get a personalized itinerary and best quote from our travel
                    expert.
                  </p>

                  <div className="space-y-3">
                    <QuoteInput
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                    />

                    <QuoteInput
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                    />

                    <QuoteInput
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                    />

                    <QuoteInput
                      name="budget"
                      placeholder="Your Budget Optional"
                      value={formData.budget}
                      onChange={handleChange}
                    />

                    <button
                      type="button"
                      onClick={handleQuoteWhatsapp}
                      className="w-full bg-linear-to-r from-start to-end text-black font-bold py-3.5 rounded-2xl hover:scale-[1.02] transition"
                    >
                      Get Best Quote
                    </button>

                    <button
                      type="button"
                      onClick={handleQuoteWhatsapp}
                      className="w-full border border-green-500/50 bg-green-500/10 text-green-300 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-500/15 transition"
                    >
                      <MessageCircle size={18} />
                      Send Quote on WhatsApp
                    </button>

                    <p className="text-xs text-gray-400 text-center pt-2">
                      Our expert will call you within a few minutes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MINI GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 mt-6 sm:mt-8 md:mt-10 relative z-10">
        <div className="bg-white/3 border border-white/10 rounded-[22px] sm:rounded-[28px] p-3.5 sm:p-5 md:p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Trip Gallery
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 leading-5">
                Explore beautiful moments from this package
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className="hidden md:inline-flex items-center gap-2 border border-(--gold-main)/50 text-(--gold-main) px-4 py-2 rounded-full text-sm font-semibold hover:bg-(--gold-main) hover:text-black transition shrink-0"
            >
              <Camera size={16} />
              View All
            </button>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {images.slice(0, 4).map((img, index) => (
                <motion.button
                  key={img.id || index}
                  type="button"
                  onClick={() => setSelectedImage(img.image)}
                  whileTap={{ scale: 0.97 }}
                  className={`relative overflow-hidden group border border-white/10 bg-black/30 shadow-xl rounded-2xl sm:rounded-3xl ${
                    index === 0
                      ? "h-44 col-span-2 sm:h-72 lg:h-64 lg:col-span-2"
                      : "h-32 sm:h-64"
                  }`}
                >
                  <img
                    src={img.image}
                    alt={`Package ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                   loading="lazy" />

                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />

                  <div className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 border border-white/15 backdrop-blur-md flex items-center justify-center text-(--gold-main)">
                    <Camera size={16} />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <p className="text-white font-bold text-xs sm:text-base leading-tight">
                      {index === 0
                        ? "Destination View"
                        : index === 1
                          ? "Sightseeing"
                          : index === 2
                            ? "Tour Highlight"
                            : "Memorable Trip"}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="bg-(--bg-card) border border-white/10 rounded-2xl p-6 sm:p-8 text-center text-gray-400 text-sm">
              No gallery images available.
            </div>
          )}
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 mt-6 sm:mt-8 md:mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-(--bg-card) border border-white/10 rounded-3xl sm:rounded-[26px] p-3.5 sm:p-4 md:p-5 shadow-xl">
          <FeatureCard
            icon={<Building2 />}
            title="Hotels Included"
            text="Comfortable stays with breakfast"
          />
          <FeatureCard
            icon={<Camera />}
            title="Sightseeing"
            text="All major attractions covered"
          />
          <FeatureCard
            icon={<Car />}
            title="Transfers"
            text="Airport/Railway pickup & drop"
          />
          <FeatureCard
            icon={<Headphones />}
            title="24/7 Support"
            text="We are with you every step"
          />
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 mt-6 sm:mt-8 md:mt-10 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 sm:gap-8 lg:gap-10">
        <div className="space-y-6 sm:space-y-8 min-w-0">
          <div className="bg-(--bg-card) border border-white/10 rounded-3xl sm:rounded-[26px] overflow-hidden shadow-2xl">
            <div className="flex overflow-x-auto border-b border-white/10 bg-black/20 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative min-w-max px-4 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-semibold transition ${
                    activeTab === tab.id
                      ? "text-(--gold-main)"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}

                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="activePackageTab"
                      className="absolute left-4 right-4 bottom-0 h-0.5 rounded-full bg-(--gold-main)"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5 md:p-7 lg:p-8">
              {activeTab === "overview" && (
                <div>
                  <div className="mb-5">
                    <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] text-(--gold-main) mb-2">
                      Package Details
                    </p>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-(--font-heading) text-(--gold-main)">
                      Tour Overview
                    </h2>
                  </div>

                  <div className="bg-black/20 border border-white/10 rounded-2xl p-4 sm:p-5">
                    <p className="text-gray-300 leading-7 text-sm sm:text-base wrap-break-words">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-5 sm:mt-7">
                    <SmallBenefit
                      title="Customized Packages"
                      text="As per your needs"
                    />
                    <SmallBenefit
                      title="Flexible Travel Dates"
                      text="Travel anytime"
                    />
                    <SmallBenefit
                      title="Best Price Guarantee"
                      text="No hidden charges"
                    />
                  </div>
                </div>
              )}

              {activeTab === "itinerary" && (
                <div>
                  <div className="mb-5 sm:mb-6">
                    <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] text-(--gold-main) mb-2">
                      Day Wise Plan
                    </p>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-(--font-heading) text-(--gold-main)">
                      Itinerary Highlights
                    </h2>
                  </div>

                  {itineraryDays.length > 0 ? (
                    <div className="relative space-y-4 sm:space-y-5">
                      {itineraryDays.map((item, index) => (
                        <div
                          key={index}
                          className="relative grid grid-cols-1 md:grid-cols-[96px_minmax(0,1fr)] gap-3 sm:gap-4"
                        >
                          <div className="md:sticky md:top-24 h-fit">
                            <div className="inline-flex md:flex w-fit md:w-full items-center justify-center bg-yellow-400/10 border border-yellow-400/30 rounded-full md:rounded-2xl px-4 py-2.5 text-(--gold-main) font-bold text-xs sm:text-sm md:text-base">
                              Day {item.day}
                            </div>
                          </div>

                          <div className="bg-black/25 border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-yellow-400/30 transition min-w-0">
                            <h3 className="font-semibold text-white mb-2 text-sm sm:text-base md:text-lg leading-snug">
                              {item.title}
                            </h3>

                            <p className="text-gray-300 leading-7 text-sm sm:text-base wrap-break-words">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-5 text-center">
                      <p className="text-gray-400 text-sm">
                        No itinerary available.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "inclusions" && (
                <ListSection
                  title="Package Inclusions"
                  items={inclusions}
                  type="include"
                />
              )}

              {activeTab === "exclusions" && (
                <ListSection
                  title="Package Exclusions"
                  items={exclusions}
                  type="exclude"
                />
              )}

              {activeTab === "gallery" && (
                <div>
                  <div className="mb-5 sm:mb-6">
                    <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] text-(--gold-main) mb-2">
                      Trip Photos
                    </p>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-(--font-heading) text-(--gold-main)">
                      Gallery
                    </h2>
                  </div>

                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                      {images.map((img, index) => (
                        <button
                          key={img.id || index}
                          onClick={() => setSelectedImage(img.image)}
                          className={`relative overflow-hidden border border-white/10 bg-black/30 group shadow-lg ${
                            index === 0
                              ? "col-span-2 h-44 sm:h-72 lg:h-80 rounded-2xl sm:rounded-3xl"
                              : "h-32 sm:h-56 lg:h-64 rounded-2xl sm:rounded-3xl"
                          }`}
                        >
                          <img
                            src={img.image}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                           loading="lazy" />

                          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-80" />

                          <div className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 border border-white/15 backdrop-blur-md flex items-center justify-center text-(--gold-main)">
                            <Camera size={16} />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-5 text-center">
                      <p className="text-gray-400 text-sm">
                        No gallery images available.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {pkg.faqs?.length > 0 && (
            <div className="bg-(--bg-card) border border-white/10 rounded-3xl sm:rounded-[26px] p-4 sm:p-6 md:p-8 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-(--font-heading) text-(--gold-main) mb-5 sm:mb-6">
                Frequently Asked Questions
              </h2>

              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                {pkg.faqs.map((faq, index) => (
                  <div
                    key={faq.id || index}
                    className="bg-black/25 border border-white/10 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                      className="w-full flex items-center justify-between gap-3 p-4 text-left"
                    >
                      <span className="font-semibold text-sm sm:text-base leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`transition shrink-0 ${
                          openFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 text-gray-300 text-sm leading-6 overflow-hidden"
                        >
                          {faq.answer}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-(--bg-card) border border-white/10 rounded-[24px] sm:rounded-[26px] p-4 sm:p-5 shadow-xl">
            <TrustCard
              icon={<ShieldCheck />}
              title="100% Secure Booking"
              small="Payments are safe with us"
            />
            <TrustCard
              icon={<Tag />}
              title="Best Price Guarantee"
              small="Get the best prices always"
            />
            <TrustCard
              icon={<Headphones />}
              title="24/7 Customer Support"
              small="We are always here to help"
            />
            <TrustCard
              icon={<Send />}
              title="Easy & Fast Booking"
              small="Book in just a few minutes"
            />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="bg-(--bg-card) border border-white/10 rounded-[26px] p-6 shadow-xl">
              <p className="text-gray-400 text-sm mb-1">Starting From</p>
              <p className="text-4xl font-bold text-(--gold-main)">
                ₹{formatPrice(pkg.price)}
                <span className="text-base text-white font-normal">
                  {" "}
                  / Per Person
                </span>
              </p>

              <div className="space-y-3 mt-6">
                <button
                  onClick={handleBookClick}
                  className="w-full bg-linear-to-r from-start to-end text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                >
                  <CalendarDays size={18} />
                  Book Now
                </button>

                <button
                  onClick={handleWhatsappInquiry}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle size={18} />
                  Enquire Now
                </button>

                <button
                  onClick={handleBookClick}
                  className="w-full border border-(--gold-main) text-(--gold-main) font-bold py-4 rounded-2xl hover:bg-(--gold-main) hover:text-black transition"
                >
                  Customize This Trip
                </button>
              </div>
            </div>

            <div className="bg-(--bg-card) border border-white/10 rounded-[26px] p-6 shadow-xl">
              <h3 className="text-xl font-bold text-(--gold-main) mb-4">
                Why Book With FlyingLyte?
              </h3>

              <div className="space-y-3 text-sm text-gray-300">
                <WhyPoint text="Personalized Travel Planning" />
                <WhyPoint text="Best Price & No Hidden Charges" />
                <WhyPoint text="Comfortable Stays" />
                <WhyPoint text="Experienced Travel Experts" />
                <WhyPoint text="24/7 Assistance During Trip" />
                <WhyPoint text="Trusted by Thousands of Travelers" />
              </div>
            </div>

            <div className="bg-(--bg-card) border border-white/10 rounded-[26px] p-6 shadow-xl">
              <h3 className="font-bold mb-2">Trusted Travel Partner</h3>
              <div className="flex text-(--gold-main) gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={17} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-gray-300">
                4.8/5 based on our service quality
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* MOBILE BOTTOM CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#050812]/95 backdrop-blur-xl border-t border-white/10 px-3 sm:px-4 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleWhatsappInquiry}
            className="border border-green-500/30 bg-green-500/10 rounded-2xl py-2.5 flex flex-col items-center justify-center gap-1 text-green-400 font-semibold text-[10px] sm:text-[11px]"
          >
            <MessageCircle size={17} />
            WhatsApp
          </button>

          <a
            href="tel:+919667455591"
            className="border border-white/10 bg-white/5 rounded-2xl py-2.5 flex flex-col items-center justify-center gap-1 text-(--gold-main) font-semibold text-[10px] sm:text-[11px]"
          >
            <Phone size={17} />
            Call
          </a>

          <button
            onClick={() => setOpenQuoteForm(true)}
            className="border border-(--gold-main)/50 bg-(--gold-main)/10 rounded-2xl py-2.5 flex flex-col items-center justify-center gap-1 text-(--gold-main) font-bold text-[10px] sm:text-[11px]"
          >
            <SlidersHorizontal size={17} />
            Custom
          </button>

          <button
            onClick={handleBookClick}
            className="bg-linear-to-r from-start to-end rounded-2xl py-2.5 flex flex-col items-center justify-center gap-1 text-black font-bold text-[10px] sm:text-[11px] shadow-[0_10px_30px_rgba(245,186,74,0.25)]"
          >
            <Plane size={17} />
            Plan
          </button>
        </div>
      </div>

      {/* MOBILE QUOTE FORM */}
      <AnimatePresence>
        {openQuoteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center p-3 lg:hidden"
            onClick={() => setOpenQuoteForm(false)}
          >
            <motion.div
              initial={{ y: 90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-(--bg-card) border border-white/10 rounded-[28px] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-400/20 blur-[75px] rounded-full" />

              <div className="relative p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-(--gold-main) mb-3">
                      <Navigation size={23} />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Plan Your {destinationName} Trip
                    </h3>

                    <p className="text-gray-300 text-sm mt-1 leading-6">
                      Get a personalized itinerary and best quote from our
                      travel expert.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenQuoteForm(false)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white shrink-0"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <QuoteInput
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                  <QuoteInput
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <QuoteInput
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                  />

                  <QuoteInput
                    name="budget"
                    placeholder="Your Budget Optional"
                    value={formData.budget}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    onClick={handleQuoteWhatsapp}
                    className="w-full bg-linear-to-r from-start to-end text-black font-bold py-3.5 rounded-2xl active:scale-[0.98] transition"
                  >
                    Get Best Quote
                  </button>

                  <button
                    type="button"
                    onClick={handleQuoteWhatsapp}
                    className="w-full border border-green-500/50 bg-green-500/10 text-green-300 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-500/15 transition"
                  >
                    <MessageCircle size={18} />
                    Send Quote on WhatsApp
                  </button>

                  <p className="text-xs text-gray-400 text-center pt-1">
                    Our expert will call you within a few minutes.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {openBookingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-end md:items-center p-2 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-(--bg-card) border border-white/10 w-full max-w-2xl max-h-[94vh] overflow-hidden rounded-3xl sm:rounded-[26px] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4 md:p-6 sticky top-0 bg-(--bg-card) z-10">
                <h2 className="text-xl md:text-2xl font-(--font-heading) text-(--gold-main)">
                  Book Package
                </h2>

                <button
                  onClick={() => setOpenBookingForm(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto p-4 md:p-6 space-y-6">
                <div className="bg-black/30 border border-white/10 p-4 rounded-2xl space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Package:</span>{" "}
                    <span className="font-semibold">{packageTitle}</span>
                  </p>

                  <p>
                    <span className="text-gray-400">Destination:</span>{" "}
                    {destination}
                  </p>

                  <p>
                    <span className="text-gray-400">Duration:</span> {pkg.days}{" "}
                    Days / {pkg.Number_of_nights} Nights
                  </p>

                  <p>
                    <span className="text-gray-400">Price:</span>{" "}
                    <span className="text-(--gold-main) font-semibold">
                      ₹{formatPrice(pkg.price)} / person
                    </span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                    />
                    <InputField
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <CounterBox
                      label="Adults"
                      value={formData.adults}
                      onMinus={() => updateCount("adults", -1)}
                      onPlus={() => updateCount("adults", 1)}
                    />
                    <CounterBox
                      label="Children"
                      value={formData.children}
                      onMinus={() => updateCount("children", -1)}
                      onPlus={() => updateCount("children", 1)}
                    />
                  </div>

                  <InputField
                    label="Travel Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                  />

                  <div>
                    <label className="text-sm text-gray-400">
                      Special Requests
                    </label>
                    <textarea
                      name="request"
                      value={formData.request}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Optional message..."
                      className="w-full mt-1 p-3 rounded-xl bg-black/30 border border-white/10 focus:border-(--gold-main) outline-none text-white placeholder:text-gray-500 transition"
                    />
                  </div>

                  <div className="bg-black/30 border border-white/10 p-4 rounded-2xl text-sm space-y-2">
                    <p>
                      <span className="text-gray-400">Passengers:</span>{" "}
                      {totalPassengers}
                    </p>

                    <p>
                      <span className="text-gray-400">Price Per Person:</span> ₹
                      {formatPrice(pricePerPerson)}
                    </p>

                    <p className="text-lg font-bold text-(--gold-main)">
                      Total Price: ₹{formatPrice(totalPrice)}
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={bookingMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-linear-to-r from-start to-end text-black py-3 rounded-2xl font-semibold w-full disabled:opacity-60"
                  >
                    {bookingMutation.isPending
                      ? "Processing..."
                      : "Confirm Booking"}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMAGE PREVIEW */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 w-11 h-11 rounded-full text-white"
            >
              ✕
            </button>

            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Selected package"
              className="max-w-full max-h-[86vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

const HeroInfo = ({ icon, title, subtitle }) => (
  <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 sm:p-4 transition group shadow-lg min-h-22 sm:min-h-26">
    <div className="text-(--gold-main) mb-2 sm:mb-3 group-hover:scale-110 transition [&>svg]:w-5 sm:[&>svg]:w-7 [&>svg]:h-5 sm:[&>svg]:h-7">
      {icon}
    </div>

    <p className="font-bold text-white text-xs sm:text-base leading-tight">
      {title}
    </p>
    <p className="text-[11px] sm:text-sm text-gray-300 mt-1 leading-snug">
      {subtitle}
    </p>
  </div>
);

const TrustPill = ({ icon, title }) => (
  <div className="bg-white/6 border border-white/10 backdrop-blur-md rounded-2xl px-3 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 transition shadow-lg min-h-12">
    <div className="text-(--gold-main) shrink-0 [&>svg]:w-4 sm:[&>svg]:w-5 [&>svg]:h-4 sm:[&>svg]:h-5">
      {icon}
    </div>
    <p className="text-[11px] sm:text-sm font-semibold leading-tight">
      {title}
    </p>
  </div>
);

const TrustCard = ({ icon, title, small }) => (
  <div className="bg-black/20 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 hover:bg-white/5 transition">
    <div className="text-(--gold-main) shrink-0 [&>svg]:w-6 sm:[&>svg]:w-7 [&>svg]:h-6 sm:[&>svg]:h-7">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="font-semibold text-sm md:text-base leading-tight">
        {title}
      </p>
      {small && (
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{small}</p>
      )}
    </div>
  </div>
);

const FeatureCard = ({ icon, title, text }) => (
  <div className="flex gap-3 sm:gap-4 items-start p-3.5 sm:p-4 rounded-2xl hover:bg-white/4 transition">
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-(--gold-main) shrink-0 [&>svg]:w-5 sm:[&>svg]:w-6 [&>svg]:h-5 sm:[&>svg]:h-6">
      {icon}
    </div>
    <div className="min-w-0">
      <h3 className="font-bold text-sm sm:text-base leading-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
        {text}
      </p>
    </div>
  </div>
);

const SmallBenefit = ({ title, text }) => (
  <div className="bg-black/25 border border-white/10 rounded-2xl p-4 hover:border-yellow-400/30 transition">
    <div className="flex items-start gap-2 text-(--gold-main) font-semibold text-sm sm:text-base">
      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
      <span>{title}</span>
    </div>
    <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed">
      {text}
    </p>
  </div>
);

const ListSection = ({ title, items, type }) => (
  <div>
    <h2 className="text-xl sm:text-2xl font-(--font-heading) text-(--gold-main) mb-5 sm:mb-6">
      {title}
    </h2>

    {items.length === 0 ? (
      <p className="text-gray-400 text-sm">No details available.</p>
    ) : (
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-black/25 border border-white/10 rounded-2xl p-4 flex gap-3 hover:bg-white/4 transition"
          >
            {type === "include" ? (
              <CheckCircle2
                className="text-green-400 shrink-0 mt-0.5"
                size={18}
              />
            ) : (
              <XCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            )}

            <p className="text-gray-300 text-sm leading-6">{item}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const WhyPoint = ({ text }) => (
  <p className="flex items-center gap-2 leading-6">
    <CheckCircle2 className="text-green-400 shrink-0" size={17} />
    {text}
  </p>
);

const QuoteInput = ({ type = "text", name, value, onChange, placeholder }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full bg-black/35 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-(--gold-main) text-sm text-white placeholder:text-gray-500 transition"
  />
);

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="text-sm text-gray-400">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className="w-full mt-1 p-3 rounded-xl bg-black/30 border border-white/10 focus:border-(--gold-main) outline-none text-white placeholder:text-gray-500 transition"
    />
  </div>
);

const CounterBox = ({ label, value, onMinus, onPlus }) => (
  <div className="bg-black/30 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
    <div>
      <p className="text-xs sm:text-sm text-gray-400">{label}</p>
      <p className="text-base sm:text-lg font-semibold">{value}</p>
    </div>

    <div className="flex gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={onMinus}
        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15"
      >
        −
      </button>

      <button
        type="button"
        onClick={onPlus}
        className="w-8 h-8 rounded-xl bg-(--gold-main) text-black font-bold"
      >
        +
      </button>
    </div>
  </div>
);

export default PackageDetails;
