import SearchBox from "../../modules/Search/SearchBox";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-screen min-h-[100dvh] w-full flex-col overflow-visible bg-[#0B0F14] text-white">
      {/* HERO BACKGROUND */}
      <div className="absolute left-0 right-0 top-0 h-[520px] overflow-hidden bg-[#0B0F14] sm:h-[620px] md:h-[100dvh]">
        <img
          src="/images/rome-journey-background.png"
          alt="FlyingLyte Flight, Hotel and Tour Travel"
          className="h-full w-full object-cover object-[58%_center] sm:object-[55%_center] md:object-center"
          loading="eager"
          fetchPriority="high"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,10,18,0.20),rgba(5,10,18,0.38)_42%,rgba(5,10,18,0.72)_100%)] md:bg-[linear-gradient(to_bottom,rgba(5,10,18,0.25),rgba(5,10,18,0.42)_45%,rgba(5,10,18,0.78)_100%)]" />

        {/* BOTTOM BLEND */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#0B0F14] via-[#0B0F14]/70 to-transparent sm:h-44 md:h-48" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-2 pb-3 pt-[88px] text-center sm:px-4 sm:pt-24 md:px-6 md:pb-4 md:pt-24 lg:px-8">
        {/* HEADING */}
        <div className="mx-auto mb-2 max-w-3xl sm:mb-3 md:mb-4">
          <h1 className="text-[30px] font-semibold leading-[0.95] tracking-tight sm:text-4xl md:text-5xl lg:text-5xl">
            <span className="block text-[#FFF8E8]">Smart Trips.</span>
            <span className="mt-0.5 block bg-linear-to-r from-[#F8D77D] via-[#E6B35C] to-[#C99132] bg-clip-text text-transparent sm:mt-1">
              Zero hassle.
            </span>
            <span className="sr-only"> - Premium Flights, Hotels & Holiday Tour Packages</span>
          </h1>

          {/* DIVIDER */}
          <div className="mt-2 flex items-center justify-center gap-2.5 sm:gap-4">
            <span className="h-px w-10 bg-linear-to-r from-transparent to-[#E6B35C]/70 sm:w-16" />

            <span aria-hidden="true" className="text-base text-[#E6B35C] sm:text-xl">
              ✈
            </span>

            <span className="h-px w-10 bg-linear-to-l from-transparent to-[#E6B35C]/70 sm:w-16" />
          </div>

          <p className="mt-1 text-[11px] font-medium tracking-wide text-white/85 sm:text-sm md:text-base">
            *100% Cash Booking Available
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="w-full max-w-[410px] sm:max-w-2xl md:max-w-5xl">
          <SearchBox />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;