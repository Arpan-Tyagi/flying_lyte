// Regenerates public/sitemap.xml from the package API and src/data/blogs.js.
// Runs automatically before `npm run build` (see "prebuild" in package.json).
// If the package API can't be reached, the existing sitemap is left untouched
// so a flaky network never ships a sitemap with packages missing.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { blogs } from "../src/data/blogs.js";

const SITE_URL = "https://www.flyinglyte.com";
const API_URL = process.env.VITE_API_BASE_URL || "https://api.flyinglyte.com";
const OUTPUT = fileURLToPath(new URL("../public/sitemap.xml", import.meta.url));

const STATIC_PATHS = [
  "/",
  "/packages",
  "/flights",
  "/hotels",
  "/blogs",
  "/about",
  "/contact",
  "/faqs",
  "/terms",
  "/privacy-policy",
  "/refund-policy",
  "/cancellation",
];

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

// "18 September 2026" -> "2026-09-18"
const blogDateToIso = (value) => {
  const [day, monthName, year] = String(value || "").trim().split(/\s+/);
  const month = MONTHS.indexOf(String(monthName).toLowerCase()) + 1;
  if (!month || !/^\d{1,2}$/.test(day) || !/^\d{4}$/.test(year)) return null;
  return `${year}-${String(month).padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const fetchAllPackages = async () => {
  const packages = [];
  let next = `${API_URL}/api/package/packages/?page=1`;

  while (next) {
    const res = await fetch(next);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${next}`);
    const body = await res.json();
    packages.push(...(body.data || []));
    next = body.next;
  }

  return packages;
};

const urlEntry = (path, lastmod) =>
  [
    "  <url>",
    `    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

const main = async () => {
  let packages;
  try {
    packages = await fetchAllPackages();
  } catch (error) {
    console.warn(`[sitemap] Package API unavailable, keeping existing sitemap: ${error.message}`);
    return;
  }

  if (!packages.length) {
    console.warn("[sitemap] Package API returned no packages, keeping existing sitemap");
    return;
  }

  const entries = [
    ...STATIC_PATHS.map((path) => urlEntry(path)),
    ...packages.map((pkg) =>
      urlEntry(
        `/packages/${encodeURIComponent(pkg.slug)}`,
        (pkg.updated_at || pkg.created_at || "").slice(0, 10) || null,
      ),
    ),
    ...blogs.map((blog) => urlEntry(`/blogs/${blog.slug}`, blogDateToIso(blog.date))),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  writeFileSync(OUTPUT, xml);
  console.log(
    `[sitemap] Wrote ${entries.length} URLs (${packages.length} packages, ${blogs.length} blogs)`,
  );
};

main();
