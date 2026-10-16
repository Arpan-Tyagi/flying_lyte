import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, Hotel, Package, Globe, Calendar } from "lucide-react";
import SEO from "../SEO";

const AboutUs = () => {
  const navigate = useNavigate();
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const features = [
    {
      icon: Plane,
      title: "Flight Search",
      text: "Compare flights from leading global airlines",
      action: "flights",
    },
    {
      icon: Hotel,
      title: "Hotel Stays",
      text: "Discover hotels across thousands of destinations",
      action: "hotels",
    },
    {
      icon: Package,
      title: "Holiday Packages",
      text: "Explore curated holiday packages",
      path: "/packages",
    },
    {
      icon: Globe,
      title: "Exclusive Travel Deals",
      text: "Access exclusive travel deals and limited-time offers",
      path: "/packages",
    },
    {
      icon: Calendar,
      title: "Manage Bookings",
      text: "Manage bookings and itineraries in one place",
      path: "/bookings",
    },
  ];

  const location = useLocation();
  const isAboutPage = location.pathname === "/about";

  return (
    <section className="py-24 px-6 bg-(--bg-main) text-(--text-main)">
      {isAboutPage && (
        <SEO
          title="About Us - Elevating The Way The World Travels"
          description="Learn more about FlyingLyte, our vision, mission, and how we deliver seamless flight bookings, premium hotel stays, and curated holiday packages."
          canonical="https://www.flyinglyte.com/about"
        />
      )}
      <div className="max-w-6xl mx-auto space-y-24">
        {/* ABOUT */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className=" text-4xl md:text-6xl font-bold text-(--gold-main) mb-4">
            About Flyinglyte
          </h2>

          <h3 className="font-(--font-hero) text-md md:xl mb-4">
            Elevating the Way the World Travels
          </h3>

          <p className="text-(--text-muted) leading-relaxed mb-4">
            At Flyinglyte, we believe travel should be effortless, inspiring,
            and accessible. Our mission is to simplify the way people discover
            and book travel by bringing flights, hotels, and curated experiences
            together on a single trusted platform.
          </p>

          <p className="text-(--text-muted)">
            Whether you're planning a luxury getaway, a family vacation, or a
            quick business trip, Flyinglyte is designed to help you explore the
            world with confidence and convenience.
          </p>
        </motion.div>

        {/* VISION */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className=" text-3xl font-bold text-center md:text-left text-(--gold-main) mb-6">
              Our Vision
            </h2>

            <p className="text-(--text-muted) leading-relaxed mb-4">
              Our vision is to build a next-generation travel platform that
              combines smart technology, transparent pricing, and personalized
              recommendations to create a seamless travel experience.
            </p>

            <p className="text-(--text-muted)">
              We aim to make travel planning simpler while helping travelers
              unlock more opportunities to explore the world.
            </p>
          </div>

          <img
            src="/images/aboutImage.webp"
            alt="Travel"
            className="rounded-2xl shadow-lg"
            loading="lazy" />
        </motion.div>

        {/* WHAT WE OFFER */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-400/5 blur-3xl" />

          {/* Heading */}
          <div className="relative mb-10 text-center md:mb-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-(--gold-soft)">
              Travel Made Simple
            </p>

            <h2 className="text-3xl font-bold text-(--gold-main) md:text-4xl">
              What We Offer
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-(--text-muted) md:text-base">
              Everything you need to search, plan and manage your journey in one place.
            </p>

            <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-linear-to-r from-yellow-500 to-yellow-300" />
          </div>

          {/* Cards */}
          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (item.action === "flights") {
                      navigate("/", {
                        state: {
                          searchTab: "flights",
                        },
                      });

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });

                      return;
                    }

                    if (item.action === "hotels") {
                      navigate("/", {
                        state: {
                          searchTab: "hotels",
                        },
                      });

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });

                      return;
                    }

                    if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className={`
    group
    relative
    w-full
    cursor-pointer
    overflow-hidden
    rounded-2xl
    border
    border-(--border-soft)
    bg-(--bg-card)
    p-6
    text-left
    transition-all
    duration-300
    hover:border-yellow-400/40
    hover:shadow-[0_18px_50px_rgba(234,168,42,0.12)]
  `}
                >
                  {/* Card glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-yellow-400/0 blur-3xl transition duration-300 group-hover:bg-yellow-400/10" />

                  {/* Icon */}
                  <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-(--gold-soft) transition duration-300 group-hover:scale-110 group-hover:border-yellow-400/40 group-hover:bg-yellow-400/15">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <h3 className="text-lg font-semibold text-(--text-main)">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-(--text-muted)">
                      {item.text}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--gold-soft) opacity-70 transition group-hover:opacity-100">
                      Explore
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
