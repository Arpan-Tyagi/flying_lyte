import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tabs from "./Tabs";
import HotelsForm from "./HotelsForm";
//import FlightsForm from "./FlightsForm";
import { Plane, Sparkles, ArrowRight, Gift, Search, MapPin } from "lucide-react";
import FlightsForm from "./FlightsForm";

const SearchBox = () => {
  const [activeTab, setActiveTab] = useState("flights");
  const [packageQuery, setPackageQuery] = useState("");
  const [showPackageSuggestions, setShowPackageSuggestions] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const requestedTab = location.state?.searchTab;

    if (requestedTab === "hotels") {
      setActiveTab("hotels");
      return;
    }

    if (requestedTab === "flights") {
      setActiveTab("flights");
      return;
    }
    if (requestedTab === "packages") {
      setActiveTab("packages");
      return;
    }

    setActiveTab("flights");
  }, [location.pathname, location.state?.searchTab]);

  const handleTabChange = (tabId) => {
    setShowPackageSuggestions(false);
    setActiveTab(tabId);

    navigate("/", {
      state: {
        searchTab: tabId,
      },
      replace: true,
    });
  };
  const popularDestinations = [
    { name: "Goa", subtitle: "Beaches" },
    { name: "Manali", subtitle: "Mountains" },
    { name: "Kashmir", subtitle: "Nature" },
    { name: "Kerala", subtitle: "Backwaters" },
    { name: "Dubai", subtitle: "City Life" },
    { name: "Bali", subtitle: "Island" },
  ];

  const filteredPackageDestinations = packageQuery.trim()
    ? popularDestinations.filter((item) =>
      item.name.toLowerCase().includes(packageQuery.trim().toLowerCase())
    )
    : popularDestinations;
  const handleDestinationClick = (destination) => {
    navigate(`/packages?destination=${encodeURIComponent(destination)}`);
  };


  const ComingSoonCard = () => {
    return (
      <div className="relative flex min-h-[230px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#E6B35C]/30 bg-[#07111c]/20 p-5 text-center shadow-[0_18px_55px_rgba(0,0,0,0.4)] backdrop-blur-[2px] sm:min-h-[260px] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E6B35C]/10 blur-3xl" />

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E6B35C]/30 bg-[#E6B35C]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E6B35C] sm:text-xs">
          <Sparkles size={13} />
          Premium Feature
        </div>

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-start to-end text-black shadow-[0_10px_30px_rgba(230,179,92,0.25)] sm:h-14 sm:w-14">
          <Plane size={25} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#E6B35C]">
          Flights Booking
        </p>

        <h3 className="mt-2 text-2xl font-bold text-[#F2D17B] sm:text-3xl">
          Coming Soon
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-white/60">
          We are preparing a smoother premium flight booking experience.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-start to-end px-4 py-2 text-xs font-semibold text-black">
          Launching Shortly
          <ArrowRight size={14} />
        </div>
      </div>
    );
  };

  const renderPackageSearchCard = () => {
    const handleSubmit = (e) => {
      e.preventDefault();

      const query = packageQuery.trim();
      setShowPackageSuggestions(false);

      if (!query) {
        navigate("/packages");
        return;
      }

      navigate(`/packages?destination=${encodeURIComponent(query)}`);
    };

    return (
      <form onSubmit={handleSubmit} className="relative z-30 flex min-h-[210px] flex-col justify-center overflow-visible rounded-2xl border border-[#E6B35C]/30 bg-[#07111c]/35 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.4)] backdrop-blur-[2px] sm:min-h-[230px] sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E6B35C]/10 blur-3xl" />

        <div className="relative mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-start to-end text-black">
            <Gift size={21} />
          </div>

          <div className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E6B35C]">Holiday Packages</p>
            <h3 className="mt-1 text-lg font-semibold text-white sm:text-xl">Discover your next escape</h3>
          </div>
        </div>

        <label className="relative mb-1.5 text-left text-xs font-medium text-white/75">Where would you like to go?</label>

        <div className="relative flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E6B35C]" />

            {showPackageSuggestions && packageQuery.trim() && filteredPackageDestinations.length > 0 && (
              <div className="absolute left-0 top-full z-[200] mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-white/15 bg-[#0C1520]/98 p-1.5 shadow-[0_20px_55px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                {filteredPackageDestinations.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setPackageQuery(item.name);
                      setShowPackageSuggestions(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.08]"
                  >
                    <MapPin size={15} className="shrink-0 text-[#E6B35C]" />

                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.name}
                      </p>

                      <p className="text-xs text-white/45">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <input
              type="text"
              value={packageQuery}
              onChange={(e) => {
                setPackageQuery(e.target.value);
                setShowPackageSuggestions(true);
              }}

              onFocus={() => {
                if (packageQuery.trim()) {
                  setShowPackageSuggestions(true);
                }
              }}
              placeholder="Search destination or package..."
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-white/20 bg-white/[0.07] pl-10 pr-3 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/45 hover:border-white/30 focus:border-[#E6B35C]/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#E6B35C]/15"
            />
          </div>

          <button type="submit" className="h-12 rounded-xl bg-linear-to-r from-start to-end px-6 text-sm font-semibold text-black transition hover:brightness-105 sm:min-w-[150px]">
            Search Packages
          </button>
        </div>
      </form>
    );
  };

  const renderForm = () => {
    switch (activeTab) {
      case "flights":
        return <FlightsForm />;

      case "hotels":
        return <HotelsForm />;

      case "packages":
        return renderPackageSearchCard();

      default:
        return <FlightsForm />;
    }
  };

  const formBackground =
    activeTab === "hotels"
      ? "/images/hotel-journey-background.png"
      : activeTab === "packages"
        ? "/images/travel-pattern-bg.jpeg"
        : "/images/flight-clouds-background.png";

  return (
    <div className="relative z-30 mx-auto w-full max-w-5xl">





      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-[22px] p-px drop-shadow-[0_0_8px_rgba(255,224,138,0.55)] sm:rounded-[30px]"
        style={{
          background: `
      radial-gradient(circle at top left, #FFE08A 0%, rgba(255,224,138,0.85) 5%, transparent 17%),
      radial-gradient(circle at top right, #FFE08A 0%, rgba(255,224,138,0.85) 5%, transparent 17%),
      radial-gradient(circle at bottom left, #FFE08A 0%, rgba(255,224,138,0.85) 5%, transparent 17%),
      radial-gradient(circle at bottom right, #FFE08A 0%, rgba(255,224,138,0.85) 5%, transparent 17%)
    `,
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* TOP LEFT GOLD GLOW */}







      {/* TOP CENTER GOLD SHINE */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-px w-28 -translate-x-1/2 bg-linear-to-r from-transparent via-[#FFE08A] to-transparent shadow-[0_0_18px_rgba(255,224,138,0.95)] sm:w-40" />

      {/* BOTTOM CENTER GOLD SHINE */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 h-px w-32 -translate-x-1/2 bg-linear-to-r from-transparent via-[#E6B35C] to-transparent opacity-80 shadow-[0_0_16px_rgba(230,179,92,0.8)] sm:w-48" />

      {/* BOTTOM RIGHT GOLD GLOW */}




      {/* OUTER GOLD GLOW */}
      <div className="pointer-events-none absolute -inset-px rounded-[22px] bg-linear-to-r from-[#E6B35C]/30 via-[#F7CF75]/10 to-[#E6B35C]/30 opacity-60 blur-md sm:rounded-[30px]" />

      {/* MAIN SEARCH BOX */}
      <div className="relative overflow-visible rounded-[22px] border border-[#E6B35C]/40 bg-[#07111c]/90 px-2.5 py-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.55),0_0_28px_rgba(230,179,92,0.08)] backdrop-blur-xl sm:rounded-[30px] sm:px-4 sm:py-3 md:px-5 md:py-3.5">
        {/* SOFT DECORATIVE GLOW */}
        <div className="pointer-events-none absolute right-0 -top-16 h-40 w-40 rounded-full bg-[#E6B35C]/8 blur-3xl sm:-right-20 sm:-top-20 sm:h-56 sm:w-56" />

        {/* HEADING */}
        <div className="relative mb-2 text-center md:mb-3">
          <h2 className="text-xl font-semibold tracking-wide text-[#F2D17B] sm:text-2xl md:text-3xl">
            Plan Your Journey
          </h2>

          <div className="mt-2 flex items-center justify-center gap-2.5 sm:gap-3">
            <span className="h-px w-12 bg-linear-to-r from-transparent to-[#E6B35C]/70 sm:w-16" />

            <span className="grid h-6 w-6 place-items-center rounded-full border border-[#E6B35C]/40 text-xs text-[#E6B35C] sm:h-7 sm:w-7 sm:text-sm">
              ◉
            </span>

            <span className="h-px w-12 bg-linear-to-l from-transparent to-[#E6B35C]/70 sm:w-16" />
          </div>
        </div>

        {/* TABS */}
        <div className="relative">
          <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>

        {/* FORM IMAGE PANEL */}
        <div className="relative mt-2 overflow-visible rounded-2xl border border-[#E6B35C]/35 bg-[#07111c] bg-cover bg-center bg-no-repeat shadow-[0_18px_55px_rgba(0,0,0,0.4)] md:rounded-3xl" style={{ backgroundImage: `url("${formBackground}")` }}>
          {/* LIGHT DARK OVERLAY */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[#07111c]/25 md:rounded-3xl md:bg-[#07111c]/10" />

          {/* READABILITY GRADIENT */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-transparent via-[#07111c]/10 to-[#07111c]/70 md:bg-linear-to-r md:from-[#07111c]/25 md:via-[#07111c]/10 md:to-transparent md:rounded-3xl" />

          {/* EXISTING FORM */}
          <div className="relative z-10 p-1 sm:p-2">
            {renderForm()}
          </div>
        </div>
        <div className="relative mt-3">
          <div className="mb-2 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-linear-to-r from-transparent to-[#E6B35C]/70 sm:w-12" />
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#E6B35C] sm:text-[10px]">Popular Destinations</p>
            <span className="h-px w-8 bg-linear-to-l from-transparent to-[#E6B35C]/70 sm:w-12" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-6 md:overflow-visible">
            {popularDestinations.map((destination) => (
              <button key={destination.name} type="button" onClick={() => handleDestinationClick(destination.name)} className="group flex min-w-[120px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-[#E6B35C]/50 hover:bg-[#E6B35C]/10 md:min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6B35C]/25 bg-[#E6B35C]/10 text-[#E6B35C]">
                  <MapPin size={14} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white transition group-hover:text-[#F2D17B]">{destination.name}</p>
                  <p className="truncate text-[10px] text-white/45">{destination.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;