import { useRef } from "react";
import FaqSection from "../components/common/FaqSection";
import {
    Plane,
    ShieldCheck,
    Headphones,
    BadgeIndianRupee,
    ArrowRight,
    Luggage,
} from "lucide-react";
import FlightsForm from "../modules/Search/FlightsForm";

const FlightsPage = () => {
    const searchRef = useRef(null);

    const recommendedRoutes = [
        {
            from: "Delhi",
            to: "Goa",
            tag: "Beach Escape",
            image: "/images/delhi-goa.webp",
        },
        {
            from: "Delhi",
            to: "Mumbai",
            tag: "City Break",
            image: "/images/delhi-mumbai.webp",
        },
        {
            from: "Delhi",
            to: "Bengaluru",
            tag: "Business & Leisure",
            image: "/images/delhi-bengaluru.webp",
        },
        {
            from: "Delhi",
            to: "Srinagar",
            tag: "Mountain Escape",
            image: "/images/delhi-srinagar.webp",
        },
        {
            from: "Delhi",
            to: "Dubai",
            tag: "International",
            image: "/images/delhi-dubai.webp",
        },
        {
            from: "Delhi",
            to: "Jaipur",
            tag: "Weekend Trip",
            image: "/images/delhi-jaipur.webp",
        },
    ];

    const scrollToSearch = () => {
        searchRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    return (
        <main className="min-h-screen bg-[#0B0F14] text-white">
            {/* HERO */}
            <section className="relative min-h-[700px] w-full sm:min-h-[660px] md:min-h-[620px]">
                {/* BACKGROUND */}
                <div className="absolute inset-x-0 top-0 h-[430px] overflow-hidden bg-[#0B0F14] sm:h-[500px] md:inset-0 md:h-auto">
                    <img
                        src="/images/flightpagebackground1.png"
                        alt="Flight booking with FlyingLyte"
                        className="h-full w-full object-cover object-[58%_center] sm:object-[55%_center] md:object-center"
                        loading="eager"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,10,18,0.35),rgba(5,10,18,0.68)_55%,#0B0F14_100%)]" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(5,10,18,0.38)_100%)]" />
                </div>

                {/* CONTENT */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 md:pt-36 lg:px-8">
                    {/* HERO TEXT */}
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#E6B35C] sm:text-xs">
                            Flights With FlyingLyte
                        </p>

                        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#FFF8E8] sm:text-5xl md:text-6xl">
                            Find the right flight for your{" "}
                            <span className="bg-linear-to-r from-[#F8D77D] via-[#E6B35C] to-[#C99132] bg-clip-text text-transparent">
                                next journey
                            </span>
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                            Search domestic and international flights, compare available options and continue your booking with FlyingLyte.
                        </p>

                        <div className="mt-5 flex items-center justify-center gap-3">
                            <span className="h-px w-16 bg-linear-to-r from-transparent to-[#E6B35C]/70" />
                            <Plane size={18} className="text-[#E6B35C]" />
                            <span className="h-px w-16 bg-linear-to-l from-transparent to-[#E6B35C]/70" />
                        </div>
                    </div>

                    {/* FLIGHT SEARCH */}
                    <div
                        ref={searchRef}
                        className="relative mx-auto mt-9 w-full max-w-6xl overflow-visible rounded-[22px] border border-[#E6B35C]/35 bg-[#07111c] bg-[length:100%_auto] bg-[position:center_top] bg-no-repeat p-2 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:rounded-[28px] sm:bg-[length:cover] sm:bg-center sm:p-3"
                        style={{
                            backgroundImage: 'url("/images/flight-clouds-background.png")',
                        }}
                    >
                        {/* dark overlay */}
                        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[#07111c]/35" />

                        {/* readability gradient */}
                        <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-linear-to-r from-[#07111c]/55 via-[#07111c]/20 to-[#07111c]/35" />

                        {/* top gold shine */}
                        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-48 -translate-x-1/2 bg-linear-to-r from-transparent via-[#FFE08A] to-transparent shadow-[0_0_18px_rgba(255,224,138,0.9)]" />

                        <div className="relative z-10 overflow-visible">
                            <FlightsForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* RECOMMENDED ROUTES */}
            <section className="bg-[#0B0F14] px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6B35C]">
                                Recommended
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                                Popular flight routes
                            </h2>

                            <p className="mt-2 text-sm text-white/50">
                                Explore routes travellers frequently search for.
                            </p>
                        </div>

                        <button type="button" onClick={scrollToSearch} className="flex items-center gap-2 text-sm font-medium text-[#E6B35C] transition hover:text-[#F8D77D]">
                            Search Flights
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {recommendedRoutes.map((route) => (
                            <button
                                key={`${route.from}-${route.to}`}
                                type="button"
                                onClick={scrollToSearch}
                                className="
    group relative min-h-[180px] overflow-hidden rounded-2xl
    border border-white/10
    text-left
    transition duration-300
    hover:-translate-y-1
    hover:border-[#E6B35C]/40
    hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]
  "
                            >
                                {/* BACKGROUND IMAGE */}
                                <img
                                    src={route.image}
                                    alt={`${route.from} to ${route.to}`}
                                    loading="lazy"
                                    className="
  absolute inset-0 h-full w-full object-cover
  brightness-110 saturate-110
  transition duration-700
  group-hover:scale-105
  group-hover:brightness-115
"
                                />

                                {/* DARK OVERLAY */}
                                <div className="absolute inset-0 bg-black/20" />

                                {/* GRADIENT FOR TEXT */}
                                <div className="absolute inset-0 bg-linear-to-t from-[#07111c]/80 via-[#07111c]/20 to-transparent" />

                                {/* CONTENT */}
                                <div className="relative z-10 flex min-h-[180px] flex-col justify-between p-5">

                                    <div className="flex items-center justify-between">
                                        <div className="
        grid h-10 w-10 place-items-center
        rounded-xl
        border border-[#E6B35C]/30
        bg-black/35
        text-[#E6B35C]
        backdrop-blur-md
      ">
                                            <Plane size={18} />
                                        </div>

                                        <ArrowRight
                                            size={17}
                                            className="
          text-white/60
          transition
          group-hover:translate-x-1
          group-hover:text-[#E6B35C]
        "
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-lg font-semibold text-white">
                                            <span>{route.from}</span>

                                            <span className="text-[#E6B35C]">→</span>

                                            <span>{route.to}</span>
                                        </div>

                                        <p className="mt-1 text-xs text-white/70">
                                            {route.tag}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY FLYINGLYTE */}
            <section className="border-y border-white/5 bg-[#0E141C] px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto mb-9 max-w-2xl text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6B35C]">
                            Why FlyingLyte
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                            A simpler way to book flights
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Plane,
                                title: "Easy Flight Search",
                                text: "Search available flights for your route and travel dates.",
                            },
                            {
                                icon: BadgeIndianRupee,
                                title: "Clear Fare Details",
                                text: "Review fare information before continuing your booking.",
                            },
                            {
                                icon: Luggage,
                                title: "Travel Details",
                                text: "Check available baggage and other flight information.",
                            },
                            {
                                icon: Headphones,
                                title: "Travel Support",
                                text: "Get assistance from our travel team whenever needed.",
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

            {/* BOOKING TIPS */}
            <section className="bg-[#0B0F14] px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 rounded-[28px] border border-[#E6B35C]/15 bg-[#101721] p-6 sm:p-8 lg:grid-cols-2 lg:p-10">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6B35C]">
                            Before You Book
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                            A few things worth checking
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                            Flight conditions can vary by airline and fare. Review the important details before confirming your journey.
                        </p>
                    </div>

                    <div className="grid gap-3">
                        {[
                            "Check baggage allowance for your selected fare.",
                            "Review cancellation and rescheduling rules.",
                            "Confirm departure and arrival airport details.",
                            "Verify passenger names before completing the booking.",
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
                endpoint="https://api.flyinglyte.com/api/package/airlines/faqs/"
                title="Flight Frequently Asked Questions"
            />

            {/* CTA */}
            <section className="bg-[#0B0F14] px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 rounded-[28px] border border-[#E6B35C]/25 bg-linear-to-r from-[#151B21] via-[#111923] to-[#151B21] p-7 text-center sm:p-9 lg:flex-row lg:text-left">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E6B35C]">
                            Ready To Fly?
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold text-white">
                            Search your next flight with FlyingLyte
                        </h2>
                    </div>

                    <button type="button" onClick={scrollToSearch} className="rounded-full bg-linear-to-r from-[#F8DE82] to-[#EAA82A] px-7 py-3 text-sm font-semibold text-black transition hover:brightness-105">
                        Search Flights
                    </button>
                </div>
            </section>
        </main>
    );
};

export default FlightsPage;