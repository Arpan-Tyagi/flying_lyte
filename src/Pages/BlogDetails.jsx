import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { blogs } from "../data/blogs";

const SITE_URL = "https://www.flyinglyte.com";
const BLOG_IMAGE_PATH = "/images/blogs/";

// Blog dates are stored as "18 September 2026"; schema.org needs ISO 8601.
const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const toIsoDate = (value) => {
  const [day, monthName, year] = String(value || "").trim().split(/\s+/);
  const month = MONTHS.indexOf(String(monthName).toLowerCase()) + 1;
  if (!month || !/^\d{1,2}$/.test(day) || !/^\d{4}$/.test(year)) {
    return undefined;
  }
  return `${year}-${String(month).padStart(2, "0")}-${day.padStart(2, "0")}`;
};

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

const createSlug = (text = "") =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const parseBlogDescription = (description = "") => {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const intro = [];
  const sections = [];
  let conclusion = null;
  let currentSection = null;

  lines.forEach((line) => {
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);

    if (numberedMatch) {
      if (currentSection) sections.push(currentSection);

      currentSection = {
        number: numberedMatch[1],
        title: numberedMatch[2],
        content: [],
      };

      return;
    }

    if (line.toLowerCase() === "conclusion") {
      if (currentSection) {
        sections.push(currentSection);
        currentSection = null;
      }

      conclusion = {
        title: "Conclusion",
        content: [],
      };

      return;
    }

    if (conclusion) {
      conclusion.content.push(line);
    } else if (currentSection) {
      currentSection.content.push(line);
    } else {
      intro.push(line);
    }
  });

  if (currentSection) sections.push(currentSection);

  return { intro, sections, conclusion };
};

const BlogDetails = () => {
  const { slug } = useParams();

  const blog = blogs.find((item) => item.slug === slug);

  if (!blog) {
    return (
      <main className="min-h-screen bg-[var(--bg-main)] text-white flex items-center justify-center px-4">
        <Helmet>
          <title>Blog Not Found | FlyingLyte</title>
          <meta name="robots" content="noindex" />
          <meta
            name="description"
            content="The travel blog you are looking for could not be found. Explore more travel guides, destination tips, hotel advice, and flight booking updates on FlyingLyte."
          />
        </Helmet>

        <div className="text-center">
          <h1 className="font-heading text-4xl text-[var(--gold-main)] mb-4">
            Blog Not Found
          </h1>

          <p className="font-body text-[var(--text-muted)] mb-6">
            The blog you are trying to open may have been moved or removed.
          </p>

          <Link
            to="/blogs"
            className="font-body text-[var(--gold-soft)] hover:text-[var(--color-start)]"
          >
            Back to Blogs
          </Link>
        </div>
      </main>
    );
  }

  const { intro, sections, conclusion } = parseBlogDescription(
    blog.description,
  );

  const blogUrl = `${SITE_URL}/blogs/${blog.slug}`;
  const blogImage = getBlogImage(blog);
  const metaDescription =
    blog.shortDescription ||
    `Read ${blog.title} on FlyingLyte. Explore travel tips, destination guides, hotel booking advice, flight updates, and useful trip planning information.`;

  // Prefer posts from the same category, then fill with the newest others
  const otherBlogs = blogs.filter((item) => item.slug !== blog.slug).reverse();
  const relatedBlogs = [
    ...otherBlogs.filter((item) => item.category === blog.category),
    ...otherBlogs.filter((item) => item.category !== blog.category),
  ].slice(0, 3);

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: metaDescription,
    image: blogImage.startsWith("http") ? blogImage : `${SITE_URL}${blogImage}`,
    author: {
      "@type": "Organization",
      name: blog.author || "FlyingLyte Team",
    },
    publisher: {
      "@type": "Organization",
      name: "FlyingLyte",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/flying_logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogUrl,
    },
    url: blogUrl,
    datePublished: toIsoDate(blog.date),
    dateModified: toIsoDate(blog.date),
  };

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-white">
      <Helmet>
        <title>{`${blog.title} | FlyingLyte`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={blogUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${blog.title} | FlyingLyte`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={blogUrl} />
        <meta
          property="og:image"
          content={
            blogImage.startsWith("http") ? blogImage : `${SITE_URL}${blogImage}`
          }
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${blog.title} | FlyingLyte`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content={
            blogImage.startsWith("http") ? blogImage : `${SITE_URL}${blogImage}`
          }
        />

        <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
      </Helmet>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,222,130,0.12),transparent_35%)]" />

        <div className="relative max-w-5xl mx-auto px-4">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-body text-sm text-[var(--text-muted)]"
          >
            <Link
              to="/"
              className="text-[var(--gold-soft)] hover:text-[var(--color-start)]"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              to="/blogs"
              className="text-[var(--gold-soft)] hover:text-[var(--color-start)]"
            >
              Blogs
            </Link>
            <span>/</span>
            <span className="line-clamp-1">{blog.title}</span>
          </nav>

          <div className="mt-8">
            <p className="font-body text-sm md:text-base tracking-[0.2em] uppercase text-[var(--gold-soft)] mb-4">
              {blog.date} {blog.author ? `• ${blog.author}` : ""}{" "}
              {blog.category ? `• ${blog.category}` : ""}
            </p>

            <h1 className="font-heading text-4xl md:text-7xl text-[var(--gold-main)] leading-tight">
              {blog.title}
            </h1>

            <p className="mt-6 max-w-3xl font-body text-xl leading-8 text-[var(--text-muted)]">
              {blog.shortDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/blogs"
                className="rounded-full border border-[var(--border-soft)] px-5 py-2 font-body text-sm text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
              >
                ← Back to Blogs
              </Link>

              <Link
                to="/packages"
                className="rounded-full border border-[var(--border-soft)] px-5 py-2 font-body text-sm text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
              >
                Explore Tour Packages
              </Link>

              <Link
                to="/contact"
                className="rounded-full border border-[var(--border-soft)] px-5 py-2 font-body text-sm text-[var(--gold-soft)] hover:border-[var(--gold-main)] hover:text-[var(--gold-main)] transition"
              >
                Get Travel Help
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Clear Blog Image */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl overflow-hidden border border-[var(--border-soft)] bg-black/30 shadow-[0_30px_80px_rgba(0,0,0,0.45)] p-2 md:p-3">
          <img
            src={blogImage}
            alt={blog.title}
            className="w-full h-auto max-h-[780px] object-contain rounded-2xl"
            loading="eager"
          />
        </div>
      </section>

      {/* Blog Content */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <article className="relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border-soft)] rounded-3xl p-6 md:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(248,222,130,0.14),transparent_65%)]" />

          <div className="relative">
            <header className="mb-10">
              <p className="font-body text-sm tracking-[0.25em] uppercase text-[var(--gold-soft)] mb-3">
                Travel Guide
              </p>

              <h2 className="font-heading text-3xl md:text-5xl text-[var(--gold-main)] leading-tight">
                About This Travel Experience
              </h2>

              <p className="mt-4 font-body text-base md:text-lg leading-8 text-[var(--text-muted)]">
                This FlyingLyte travel guide is created to help you understand
                the destination, travel experience, important highlights,
                planning tips, booking ideas, and useful details before you make
                your next trip decision.
              </p>
            </header>

            {sections.length > 0 && (
              <nav
                aria-label="Blog table of contents"
                className="mb-10 rounded-3xl border border-[var(--border-soft)] bg-white/[0.04] p-5 md:p-6"
              >
                <h2 className="font-heading text-2xl text-[var(--gold-main)] mb-4">
                  What You Will Read
                </h2>

                <ul className="grid gap-3 md:grid-cols-2">
                  {sections.map((section) => (
                    <li key={section.number}>
                      <a
                        href={`#${createSlug(section.title)}`}
                        className="font-body text-[var(--text-muted)] hover:text-[var(--gold-soft)] transition"
                      >
                        {section.number}. {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {intro.length > 0 && (
              <div className="space-y-5 mb-10">
                {intro.map((paragraph, index) => (
                  <p
                    key={index}
                    className="font-body text-lg md:text-xl leading-9 text-[var(--text-main)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {sections.length > 0 && (
              <div className="grid gap-5">
                {sections.map((section) => (
                  <section
                    id={createSlug(section.title)}
                    key={section.number}
                    className="scroll-mt-28 group rounded-3xl border border-[var(--border-soft)] bg-white/[0.04] hover:bg-white/[0.07] transition p-5 md:p-7"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="shrink-0 w-12 h-12 rounded-2xl bg-linear-to-r from-start to-end text-black font-heading text-xl flex items-center justify-center shadow-lg">
                        {section.number}
                      </div>

                      <div>
                        <h2 className="font-heading text-2xl md:text-3xl text-[var(--gold-main)] leading-tight">
                          {section.title}
                        </h2>

                        <div className="mt-3 space-y-3">
                          {section.content.map((paragraph, index) => (
                            <p
                              key={index}
                              className="font-body text-base md:text-lg leading-8 text-[var(--text-muted)]"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            )}

            {conclusion && (
              <section className="mt-10 rounded-3xl border border-[var(--gold-soft)]/30 bg-[linear-gradient(135deg,rgba(248,222,130,0.12),rgba(255,255,255,0.04))] p-6 md:p-8">
                <h2 className="font-heading text-3xl md:text-4xl text-[var(--gold-main)] mb-4">
                  {conclusion.title}
                </h2>

                <div className="space-y-4">
                  {conclusion.content.map((paragraph, index) => (
                    <p
                      key={index}
                      className="font-body text-lg md:text-xl leading-9 text-[var(--text-main)]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </section>

      {/* Internal Links */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6 md:p-8">
          <h2 className="font-heading text-3xl text-[var(--gold-main)] mb-4">
            Plan Your Trip with FlyingLyte
          </h2>

          <p className="font-body text-base md:text-lg leading-8 text-[var(--text-muted)] mb-6">
            FlyingLyte helps travelers book flights, hotels, tour packages,
            group trips, honeymoon holidays, and customized travel experiences.
            Explore more travel services and get assistance for your next
            domestic or international journey.
          </p>

          <div className="flex flex-wrap gap-4">
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
          </div>
        </div>
      </section>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="mb-8 text-center">
            <p className="font-body text-sm tracking-[0.25em] uppercase text-[var(--gold-soft)]">
              More Travel Ideas
            </p>

            <h2 className="mt-3 font-heading text-3xl md:text-5xl text-[var(--gold-main)]">
              Related Travel Blogs
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {relatedBlogs.map((item) => (
              <article
                key={item.slug}
                className="rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-card)] overflow-hidden hover:-translate-y-1 transition"
              >
                <Link to={`/blogs/${item.slug}`}>
                  <img
                    src={getBlogImage(item)}
                    alt={item.title}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                </Link>

                <div className="p-5">
                  <p className="font-body text-sm text-[var(--text-muted)] mb-2">
                    {item.date}
                  </p>

                  <h3 className="font-heading text-xl text-white leading-snug hover:text-[var(--gold-main)] transition">
                    <Link to={`/blogs/${item.slug}`}>{item.title}</Link>
                  </h3>

                  <Link
                    to={`/blogs/${item.slug}`}
                    className="mt-4 inline-flex font-body text-sm text-[var(--gold-soft)] hover:text-[var(--color-start)] transition"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <Link
          to="/blogs"
          className="inline-flex items-center justify-center rounded-full px-8 py-3 font-body text-lg text-black bg-linear-to-r from-start to-end hover:scale-105 transition"
        >
          View More Blogs
        </Link>
      </section>
    </main>
  );
};

export default BlogDetails;
