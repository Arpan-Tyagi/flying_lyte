import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { blogs } from "../data/blogs";

const BLOG_IMAGE_PATH = "/images/blogs/";

const getBlogImage = (blog) => {
  const image = String(blog?.image || "").trim();

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return image;
  }

  return `${BLOG_IMAGE_PATH}${image || `${blog.slug}.jpg`}`;
};

const Blogs = () => {
  const latestBlogs = [...blogs].reverse();

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-white py-24">
      <Helmet>
        <title>Travel Blogs, Guides & Tips | FlyingLyte</title>
        <meta
          name="description"
          content="Read FlyingLyte travel blogs for destination guides, flight booking tips, hotel booking advice, honeymoon packages, group tours, international trips, and travel planning ideas."
        />
        <link rel="canonical" href="https://www.flyinglyte.com/blogs" />

        {/* Open Graph */}
        <meta property="og:type" content="blog" />
        <meta property="og:site_name" content="FlyingLyte" />
        <meta property="og:title" content="Travel Blogs, Guides & Tips | FlyingLyte" />
        <meta
          property="og:description"
          content="Read FlyingLyte travel blogs for destination guides, flight booking tips, hotel booking advice, honeymoon packages, group tours, international trips, and travel planning ideas."
        />
        <meta property="og:url" content="https://www.flyinglyte.com/blogs" />
        <meta property="og:image" content="https://www.flyinglyte.com/images/HeroImage.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Travel Blogs, Guides & Tips | FlyingLyte" />
        <meta
          name="twitter:description"
          content="Read FlyingLyte travel blogs for destination guides, flight booking tips, hotel booking advice, honeymoon packages, group tours, international trips, and travel planning ideas."
        />
        <meta name="twitter:image" content="https://www.flyinglyte.com/images/HeroImage.jpg" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        <section className="text-center mb-14">
          <p className="text-xs md:text-sm font-semibold tracking-[0.28em] uppercase text-[var(--gold-soft)]">
            FlyingLyte Travel Blog
          </p>

          <h1 className="mt-4 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--gold-main)] leading-tight">
            Travel Blogs, Guides & Tips
          </h1>

          <p className="mt-5 max-w-3xl mx-auto text-base md:text-lg leading-8 text-[var(--text-muted)]">
            Explore helpful travel blogs from FlyingLyte, including destination
            guides, hotel booking tips, flight booking advice, festival travel
            updates, honeymoon ideas, group tour guides, and smart travel
            planning suggestions for Indian travelers.
          </p>

          <p className="mt-4 max-w-3xl mx-auto text-base leading-8 text-[var(--text-muted)]">
            Whether you are planning a family vacation, a romantic getaway, a
            budget-friendly trip, a luxury holiday, or an international tour,
            our travel stories and guides help you choose the right destination,
            understand the best time to visit, compare travel options, and plan
            your journey with confidence.
          </p>

          <nav
            aria-label="Important travel links"
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/"
              className="rounded-full border border-[var(--border-soft)] px-5 py-2 font-body text-sm text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
            >
              Home
            </Link>

            <Link
              to="/flights"
              className="rounded-full border border-[var(--border-soft)] px-5 py-2 font-body text-sm text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
            >
              Book Flights
            </Link>

            <Link
              to="/hotels"
              className="rounded-full border border-[var(--border-soft)] px-5 py-2 font-body text-sm text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
            >
              Book Hotels
            </Link>

            <Link
              to="/packages"
              className="rounded-full border border-[var(--border-soft)] px-5 py-2 font-body text-sm text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
            >
              Tour Packages
            </Link>

            <Link
              to="/contact"
              className="rounded-full border border-[var(--border-soft)] px-5 py-2 font-body text-sm text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
            >
              Contact FlyingLyte
            </Link>
          </nav>
        </section>

        <section
          aria-labelledby="latest-travel-blogs"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <h2 id="latest-travel-blogs" className="sr-only">
            Latest Travel Blogs and Guides
          </h2>

          {latestBlogs.map((blog) => (
            <article
              key={blog.id || blog.slug}
              className="group bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover:-translate-y-2 transition-all duration-300"
            >
              <Link to={`/blogs/${blog.slug}`} aria-label={blog.title}>
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={getBlogImage(blog)}
                    alt={blog.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {blog.category && (
                    <span className="absolute top-4 left-4 rounded-full bg-black/60 border border-[var(--border-soft)] px-4 py-1 font-body text-sm text-[var(--gold-soft)] backdrop-blur">
                      {blog.category}
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-6">
                <p className="font-body text-sm text-[var(--text-muted)] mb-3">
                  {blog.date} {blog.author ? `• ${blog.author}` : ""}
                </p>

                <h3 className="font-heading text-2xl text-white leading-snug mb-4 group-hover:text-[var(--gold-main)] transition">
                  <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                </h3>

                <p className="font-body text-base leading-7 text-[var(--text-muted)] mb-6">
                  {blog.shortDescription ||
                    "Read this FlyingLyte travel guide for useful destination information, travel tips, hotel ideas, flight planning advice, and smart suggestions for your next trip."}
                </p>

                <Link
                  to={`/blogs/${blog.slug}`}
                  className="inline-flex items-center gap-2 font-body text-lg text-[var(--gold-soft)] hover:text-[var(--color-start)] transition"
                >
                  Read Travel Guide
                  <span className="group-hover:translate-x-1 transition">
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-20 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-soft)] p-8 md:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <p className="font-body text-sm md:text-base tracking-[0.25em] uppercase text-[var(--gold-soft)]">
            Plan Better with FlyingLyte
          </p>

          <h2 className="mt-4 font-heading text-3xl md:text-5xl text-[var(--gold-main)]">
            Book Flights, Hotels and Holiday Packages
          </h2>

          <p className="mt-5 max-w-3xl mx-auto font-body text-base md:text-lg leading-8 text-[var(--text-muted)]">
            FlyingLyte helps travelers plan and book domestic and international
            trips with reliable flight options, comfortable hotels, customized
            holiday packages, group tours, honeymoon packages, and destination
            support. Our blogs are created to make travel planning easier,
            clearer, and more useful before you confirm your booking.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/packages"
              className="rounded-full bg-[var(--gold-main)] px-7 py-3 font-body text-base font-semibold text-black hover:bg-[var(--gold-soft)] transition"
            >
              Explore Packages
            </Link>

            <Link
              to="/contact"
              className="rounded-full border border-[var(--border-soft)] px-7 py-3 font-body text-base font-semibold text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
            >
              Get Travel Assistance
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Blogs;
