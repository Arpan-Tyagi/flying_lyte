import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import FaqSection from "../components/common/FaqSection";

const FaqsPage = () => {
  return (
    <div className="bg-(--bg-main) text-white min-h-screen">
      <SEO
        title="FAQs - Flights, Hotels & Holiday Packages"
        description="Answers to common questions about booking flights, hotels and holiday packages with FlyingLyte, including payments, cancellations, baggage and customer support."
        canonical="https://www.flyinglyte.com/faqs"
      />

      <section className="px-4 pt-28 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--gold-main)">
            Help Centre
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-(--font-heading) text-(--gold-main)">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-white/70">
            Quick answers about flights, hotels and holiday packages. Can't
            find what you need?{" "}
            <Link to="/contact" className="text-(--gold-main) underline">
              Contact our travel team
            </Link>
            .
          </p>
        </div>
      </section>

      <FaqSection
        endpoint="https://api.flyinglyte.com/api/package/airlines/faqs/"
        title="Flight FAQs"
      />
      <FaqSection
        endpoint="https://api.flyinglyte.com/api/package/hotels/faqs/"
        title="Hotel FAQs"
      />
    </div>
  );
};

export default FaqsPage;
