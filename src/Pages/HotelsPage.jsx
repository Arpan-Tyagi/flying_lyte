import { useRef } from "react";
import FaqSection from "../components/common/FaqSection";
import SEO from "../components/SEO";
import { Hotel, MapPin, ShieldCheck, Headphones, CalendarDays, ArrowRight, BedDouble } from "lucide-react";
import HotelsForm from "../modules/Search/HotelsForm";

const HotelsPage = () => {
    const searchRef = useRef(null);

    const recommendedDestinations = [
        { name: "Goa", subtitle: "Beaches & Resorts" },
        { name: "Manali", subtitle: "Mountain Stays" },
        { name: "Kashmir", subtitle: "Scenic Hotels" },
        { name: "Jaipur", subtitle: "Heritage Stays" },
        { name: "Delhi", subtitle: "City Hotels" },
        { name: "Dubai", subtitle: "Luxury Stays" },
    ];

    const scrollToSearch = () => {
        searchRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    return (
        <main className="min-h-screen bg-[#0B0F14] text-white">
            <SEO
                title="Book Hotels & Luxury Resorts - Best Rates"
                description="Book premium hotels and resorts in Goa, Manali, Kashmir, Dubai, and top global destinations. Verified amenities, best price guarantee, and instant booking."
                canonical="https://www.flyinglyte.com/hotels"
            />
            {/* HERO */}
            <section className="relative min-h-[700px] w-full sm:min-h-[660px] md:min-h-[620px]">
                {/* BACKGROUND */}
                <div className="absolute inset-x-0 top-0 h-[430px] overflow-hidden bg-[#0B0F14] sm:h-[500px] md:inset-0 md:h-auto">
                    <img
                        src="/images/hotelspagebackground1.webp"
                        alt="Hotel booking with FlyingLyte"
                        className="h-full w-full object-cover object-[52%_center] sm:object-[50%_center] md:object-center"
                        loading="eager"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,10,18,0.32),rgba(5,10,18,0.65)_55%,#0B0F14_100%)]" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(5,10,18,0.38)_100%)]" />
                </div>

                {/* CONTENT */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 md:pt-36 lg:px-8">
                    {/* HERO TEXT */}
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#E6B35C] sm:text-xs">
                            Hotels With FlyingLyte
                        </p>

                        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#FFF8E8] sm:text-5xl md:text-6xl">
                            Find a stay that feels{" "}
                            <span className="bg-linear-to-r from-[#F8D77D] via-[#E6B35C] to-[#C99132] bg-clip-text text-transparent">
                                just right
                            </span>
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                            Search hotels by city or hotel name, choose your dates and guests, and find the right stay for your trip.
                        </p>

                        <div className="mt-5 flex items-center justify-center gap-3">
                            <span className="h-px w-16 bg-linear-to-r from-transparent to-[#E6B35C]/70" />
                            <Hotel size={18} className="text-[#E6B35C]" />
                            <span className="h-px w-16 bg-linear-to-l from-transparent to-[#E6B35C]/70" />
                        </div>
                    </div>

                    {/* HOTEL SEARCH */}
                    <div
                        ref={searchRef}
                        className="relative mx-auto mt-9 w-full max-w-6xl overflow-visible rounded-[22px] border border-[#E6B35C]/35 bg-[#07111c] bg-[length:100%_auto] bg-[position:center_top] bg-no-repeat p-2 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:rounded-[28px] sm:bg-[length:cover] sm:bg-center sm:p-3"
                        style={{
                            backgroundImage: 'url("/images/hotel-journey-background.png")',
                        }}
                    >
                        {/* dark overlay */}
                        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[#07111c]/25" />

                        {/* readability gradient */}
                        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-linear-to-r from-[#07111c]/40 via-[#07111c]/15 to-[#07111c]/20" />

                        {/* top gold shine */}
                        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-48 -translate-x-1/2 bg-linear-to-r from-transparent via-[#FFE08A] to-transparent shadow-[0_0_18px_rgba(255,224,138,0.9)]" />

                        <div className="relative z-10 overflow-visible">
                            <HotelsForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* RECOMMENDED DESTINATIONS */}
            <section className="bg-[#0B0F14] px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6B35C]">
                                Recommended
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                                Popular hotel destinations
                            </h2>

                            <p className="mt-2 text-sm text-white/50">
                                Start with destinations travellers love exploring.
                            </p>
                        </div>

                        <button type="button" onClick={scrollToSearch} className="flex items-center gap-2 text-sm font-medium text-[#E6B35C] transition hover:text-[#F8D77D]">
                            Search Hotels
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {recommendedDestinations.map((destination) => (
                            <button
                                key={destination.name}
                                type="button"
                                onClick={scrollToSearch}
                                className="
    group relative flex items-center gap-4 overflow-hidden
    rounded-2xl
    border border-[#E6B35C]/20
    bg-[#111923]
    p-5 text-left
    transition-all duration-300
    hover:-translate-y-1
    hover:border-[#E6B35C]/45
    hover:bg-[#141D27]
    hover:shadow-[0_14px_35px_rgba(0,0,0,0.35)]
  "
                            >
                                {/* subtle full border */}
                                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/[0.03]" />

                                {/* TOP LEFT GLOW */}
                                <div className="pointer-events-none absolute -left-8 -top-8 h-20 w-20 rounded-full bg-[#E6B35C]/12 blur-2xl" />

                                {/* TOP CENTER GLOW */}
                                <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-28 -translate-x-1/2 rounded-full bg-[#E6B35C]/10 blur-2xl" />

                                {/* TOP RIGHT GLOW */}
                                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#E6B35C]/12 blur-2xl" />

                                {/* BOTTOM LEFT GLOW */}
                                <div className="pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-[#E6B35C]/10 blur-2xl" />

                                {/* BOTTOM CENTER GLOW */}
                                <div className="pointer-events-none absolute -bottom-8 left-1/2 h-16 w-28 -translate-x-1/2 rounded-full bg-[#E6B35C]/10 blur-2xl" />

                                {/* BOTTOM RIGHT GLOW */}
                                <div className="pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-[#E6B35C]/10 blur-2xl" />

                                {/* ICON */}
                                <div
                                    className="
      relative z-10 grid h-12 w-12 shrink-0 place-items-center
      rounded-xl
      border border-[#E6B35C]/20
      bg-[#E6B35C]/8
      text-[#E6B35C]
      transition duration-300
      group-hover:border-[#E6B35C]/40
      group-hover:bg-[#E6B35C]/12
    "
                                >
                                    <MapPin size={20} />
                                </div>

                                {/* TEXT */}
                                <div className="relative z-10 min-w-0 flex-1">
                                    <h3 className="font-semibold text-white">
                                        {destination.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-white/45">
                                        {destination.subtitle}
                                    </p>
                                </div>

                                {/* ARROW */}
                                <ArrowRight
                                    size={17}
                                    className="
      relative z-10
      text-white/25
      transition duration-300
      group-hover:translate-x-1
      group-hover:text-[#E6B35C]
    "
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY BOOK HOTELS */}
            <section className="border-y border-white/5 bg-[#0E141C] px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto mb-9 max-w-2xl text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6B35C]">
                            Why FlyingLyte
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                            Find the right stay with less hassle
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Hotel,
                                title: "Hotel Search",
                                text: "Search hotels by city or hotel name.",
                            },
                            {
                                icon: BedDouble,
                                title: "Room Options",
                                text: "Review available room options before booking.",
                            },
                            {
                                icon: CalendarDays,
                                title: "Clear Stay Details",
                                text: "Check dates, guests and important booking information.",
                            },
                            {
                                icon: Headphones,
                                title: "Travel Support",
                                text: "Get assistance when you need help with your stay.",
                            },
                        ].map((item) => {
                            const Icon = item.icon;

                            return (
                                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#E6B35C]/20 bg-[#E6B35C]/10 text-[#E6B35C]">
                                        <Icon size={20} />
                                    </div>

                                    <h3 className="mt-4 font-semibold text-white">{item.title}</h3>

                                    <p className="mt-2 text-sm leading-6 text-white/45">{item.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* HOTEL TIPS */}
            <section className="bg-[#0B0F14] px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 rounded-[28px] border border-[#E6B35C]/15 bg-[#101721] p-6 sm:p-8 lg:grid-cols-2 lg:p-10">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6B35C]">
                            Before You Book
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                            Check the details that matter
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                            Hotel policies and inclusions may vary by room and property. Review the details before confirming your stay.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        {[
                            "Review cancellation and refund conditions.",
                            "Check meal plans and included services.",
                            "Confirm check-in and check-out timings.",
                            "Enter guest and child details correctly.",
                        ].map((tip) => (
                            <div key={tip} className="flex items-start gap-3 rounded-xl border border-white/7 bg-white/[0.025] p-4">
                                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#E6B35C]" />

                                <p className="text-sm leading-5 text-white/65">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            <FaqSection
                endpoint="https://api.flyinglyte.com/api/package/hotels/faqs/"
                title="Hotel Frequently Asked Questions"
            />






            {/* CTA */}
            <section className="bg-[#0B0F14] px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 rounded-[28px] border border-[#E6B35C]/25 bg-linear-to-r from-[#151B21] via-[#111923] to-[#151B21] p-7 text-center sm:p-9 lg:flex-row lg:text-left">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E6B35C]">
                            Find Your Stay
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold text-white">
                            Search your next hotel with FlyingLyte
                        </h2>
                    </div>

                    <button type="button" onClick={scrollToSearch} className="rounded-full bg-linear-to-r from-[#F8DE82] to-[#EAA82A] px-7 py-3 text-sm font-semibold text-black transition hover:brightness-105">
                        Search Hotels
                    </button>
                </div>
            </section>
        </main>
    );
};

export default HotelsPage;