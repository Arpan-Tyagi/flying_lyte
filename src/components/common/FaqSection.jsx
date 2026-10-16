import { useEffect, useState } from "react";

const FaqSection = ({ endpoint, title = "Frequently Asked Questions" }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFaqs = async () => {
      try {
        setLoading(true);

        const response = await fetch(endpoint, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch FAQs");
        }

        const data = await response.json();

        setFaqs(Array.isArray(data) ? data : data?.results || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("FAQ API Error:", error);
          setFaqs([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFaqs();

    return () => controller.abort();
  }, [endpoint]);

  if (!loading && faqs.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#0B0F14] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADING */}
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6B35C]">
            Need To Know
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h2>

          <p className="mt-2 text-sm text-white/50">
            Helpful answers to common booking questions.
          </p>
        </div>

        {/* LOADER */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-2xl border border-white/8 bg-[#101721]"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-2xl border border-white/8 bg-[#101721] px-5 py-4 transition hover:border-[#E6B35C]/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                  <span>{faq.question}</span>

                  <span className="shrink-0 text-xl text-[#E6B35C] transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="mt-3 border-t border-white/7 pt-3 text-sm leading-6 text-white/60">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FaqSection;