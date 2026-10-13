import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFlightStore } from "../../../store/flightStore";
import AirlineLogo from "../../../components/common/AirlineLogo";
import { publicApi } from "../../../services/api";

const FlightsResults = () => {
  const navigate = useNavigate();

  const {
    flights,
    setFlights,
    setFlight,
    selectedFlight,
    lastSearchPayload,
    setLastSearchPayload,
    pagination,
  } = useFlightStore();
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);


  const [restoringSearch, setRestoringSearch] = useState(false);
  const [restoreError, setRestoreError] = useState("");
  const restoreStartedRef = useRef(false);

  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortType, setSortType] = useState("cheapest");
  const [fareType, setFareType] = useState("all");

  /* ---------------- REDIRECT ---------------- */

  useEffect(() => {
    if (flights?.length > 0) return;

    if (restoreStartedRef.current) return;

    if (!lastSearchPayload) {
      return;
    }

    restoreStartedRef.current = true;

    const restoreSearch = async () => {
      try {
        setRestoringSearch(true);
        setRestoreError("");

        const restorePayload = {
          ...lastSearchPayload,
          page:
            lastSearchPayload?.page ||
            pagination?.current_page ||
            1,
        };

        const response = await publicApi.post(
          "/api/airlines/search/",
          restorePayload,
        );
        const data = response?.data;
        const newPagination = data?.pagination || null;

        

        const apiResponse =
          data?.data?.Response ||
          data?.Response ||
          data?.data ||
          data;

        const errorCode = Number(apiResponse?.Error?.ErrorCode || 0);
        const errorMessage = apiResponse?.Error?.ErrorMessage || "";

        if (errorCode && errorCode !== 0) {
          throw new Error(errorMessage || "Unable to refresh flight search");
        }

        const rawResults =
          apiResponse?.Results ||
          data?.data?.Response?.Results ||
          data?.Response?.Results ||
          [];

        const results = Array.isArray(rawResults)
          ? rawResults.flat(Infinity).filter(Boolean)
          : [];

        if (!results.length) {
          throw new Error("No flights found for your previous search");
        }

        const traceId =
          apiResponse?.TraceId ||
          data?.data?.Response?.TraceId ||
          data?.Response?.TraceId ||
          null;

        setFlights({
          flights: results,
          traceId,
          pagination: newPagination,
        }); 
      } catch (error) {
        console.error("RESTORE FLIGHT SEARCH ERROR:", error);

        setRestoreError(
          error?.response?.data?.message ||
          error?.message ||
          "Unable to reload flight results",
        );
      } finally {
        setRestoringSearch(false);
      }
    };

    restoreSearch();
  }, [
    flights,
    selectedFlight,
    lastSearchPayload,
    setFlights,
  ]);

  /* ---------------- HELPERS ---------------- */

  const getTimeCategory = (iso) => {
    const hour = new Date(iso).getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };


  const handlePageChange = async (pageNumber) => {
    const totalPages = pagination?.total_pages || 1;
    const currentPage = pagination?.current_page || 1;

    if (!lastSearchPayload) return;

    if (pageNumber < 1 || pageNumber > totalPages) return;

    if (pageNumber === currentPage) return;

    try {
      setPageLoading(true);
      setPageError("");
      setExpandedCard(null);

      const requestPayload = {
        ...lastSearchPayload,
        page: pageNumber,
      };

      const response = await publicApi.post(
        "/api/airlines/search/",
        requestPayload,
      );

      const data = response?.data;

      const apiResponse =
        data?.data?.Response ||
        data?.Response ||
        data?.data ||
        data;

      const errorCode = Number(
        apiResponse?.Error?.ErrorCode || 0,
      );

      const errorMessage =
        apiResponse?.Error?.ErrorMessage || "";

      if (errorCode && errorCode !== 0) {
        throw new Error(
          errorMessage || "Unable to load flight page",
        );
      }

      const rawResults =
        apiResponse?.Results ||
        data?.data?.Response?.Results ||
        data?.Response?.Results ||
        [];

      const results = Array.isArray(rawResults)
        ? rawResults.flat(Infinity).filter(Boolean)
        : [];

      if (!results.length) {
        throw new Error("No flights found on this page");
      }

      const traceId =
        apiResponse?.TraceId ||
        data?.data?.Response?.TraceId ||
        data?.Response?.TraceId ||
        data?.trace_id ||
        null;

      const newPagination =
        data?.pagination || null;

      setFlights({
        flights: results,
        traceId,
        pagination: newPagination,
      });

      // refresh hone par same page restore hoga
      setLastSearchPayload(requestPayload);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "FLIGHT PAGINATION ERROR:",
        error?.response?.data || error,
      );

      setPageError(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load this page",
      );
    } finally {
      setPageLoading(false);
    }
  };


  const paginationPages = useMemo(() => {
    const current = pagination?.current_page || 1;
    const total = pagination?.total_pages || 1;

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    const pages = [1];

    if (current > 4) {
      pages.push("...");
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (current < total - 3) {
      pages.push("...");
    }

    pages.push(total);

    return pages;
  }, [pagination]);

  /* ---------------- DATA ---------------- */

  const allAirlines = useMemo(() => {
    const airlineMap = new Map();

    flights.forEach((flight) => {
      const airline = flight?.Segments?.[0]?.[0]?.Airline;

      const name = airline?.AirlineName;
      const code = airline?.AirlineCode;

      if (name && !airlineMap.has(name)) {
        airlineMap.set(name, {
          name,
          code,
        });
      }
    });

    return Array.from(airlineMap.values());
  }, [flights]);

  const prices = flights.map((f) => f?.Fare?.PublishedFare || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 100000;

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  /* ---------------- FILTER ---------------- */

  const lccFlights = flights.filter((f) => f.IsLCC);
  const nonLccFlights = flights.filter((f) => !f.IsLCC);

  const filteredFlights = useMemo(() => {
    let result = flights.filter((flight) => {
      const segments = flight?.Segments?.[0] || [];
      const first = segments?.[0];

      const stops = segments.length - 1;
      const airline = first?.Airline?.AirlineName;
      const price = flight?.Fare?.PublishedFare || 0;
      const time = getTimeCategory(first?.Origin?.DepTime);

      return (
        (selectedStops.length === 0 || selectedStops.includes(stops)) &&
        (selectedAirlines.length === 0 || selectedAirlines.includes(airline)) &&
        (selectedTimes.length === 0 || selectedTimes.includes(time)) &&
        price >= priceRange[0] &&
        price <= priceRange[1] &&
        (fareType === "all" ||
          (fareType === "lcc" && flight.IsLCC) ||
          (fareType === "nonlcc" && !flight.IsLCC))
      );
    });

    if (sortType === "cheapest") {
      result.sort((a, b) => a.Fare.PublishedFare - b.Fare.PublishedFare);
    }

    if (sortType === "fastest") {
      result.sort((a, b) => {
        const aSeg = a.Segments[0];
        const bSeg = b.Segments[0];

        const aDur =
          aSeg[aSeg.length - 1].AccumulatedDuration || aSeg[0].Duration;

        const bDur =
          bSeg[bSeg.length - 1].AccumulatedDuration || bSeg[0].Duration;

        return aDur - bDur;
      });
    }

    return result;
  }, [
    flights,
    selectedStops,
    selectedAirlines,
    selectedTimes,
    priceRange,
    sortType,
    fareType,
  ]);

  if (restoringSearch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-(--bg-main) text-(--text-main)">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-[#E6B35C]" />

        <p className="text-sm text-(--text-muted)">
          Refreshing flight results...
        </p>
      </div>
    );
  }

  if (!flights || (!flights.length && !selectedFlight)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-(--bg-main) text-(--text-main)">
        <p className="text-lg font-semibold">
          {restoreError || "No flight search found"}
        </p>

        <button
          type="button"
          onClick={() => navigate("/flights")}
          className="rounded-xl bg-linear-to-r from-start to-end px-6 py-3 font-semibold text-black"
        >
          Search Flights
        </button>
      </div>
    );
  }

  /* ---------------- FILTER UI ---------------- */

  const FilterContent = () => (
    <div className="space-y-6 text-(--text-main)">
      {/* Stops */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-(--gold-main)">Stops</h4>
        {[0, 1].map((stop) => (
          <label key={stop} className="flex items-center gap-2 mb-2 text-sm">
            <input
              type="checkbox"
              checked={selectedStops.includes(stop)}
              onChange={() =>
                setSelectedStops((prev) =>
                  prev.includes(stop)
                    ? prev.filter((s) => s !== stop)
                    : [...prev, stop],
                )
              }
            />
            {stop === 0 ? "Non Stop" : "1 Stop"}
          </label>
        ))}
      </div>

      {/* Airlines */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-(--gold-main)">
          Airlines
        </h4>
        {allAirlines.map((airline) => (
          <label
            key={airline.name}
            className="flex items-center gap-2.5 mb-2 text-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedAirlines.includes(airline.name)}
              onChange={() =>
                setSelectedAirlines((prev) =>
                  prev.includes(airline.name)
                    ? prev.filter((a) => a !== airline.name)
                    : [...prev, airline.name],
                )
              }
            />

            <AirlineLogo
              airlineCode={airline.code}
              airlineName={airline.name}
              className="h-5 w-5 shrink-0 object-contain"
            />

            <span>{airline.name}</span>
          </label>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3 text-(--gold-main)">
          Fare Type
        </h4>

        {[
          { label: "All", value: "all" },
          { label: "Low Cost (LCC)", value: "lcc" },
          { label: "Full Service", value: "nonlcc" },
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setFareType(type.value)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-2 ${fareType === type.value
              ? "bg-(--gold-main) text-black"
              : "border border-(--border-soft)"
              }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Time Chips */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-(--gold-main)">
          Departure Time
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "🌅 Morning", value: "morning" },
            { label: "🌞 Afternoon", value: "afternoon" },
            { label: "🌇 Evening", value: "evening" },
            { label: "🌙 Night", value: "night" },
          ].map((t) => {
            const active = selectedTimes.includes(t.value);

            return (
              <button
                key={t.value}
                onClick={() =>
                  setSelectedTimes((prev) =>
                    prev.includes(t.value)
                      ? prev.filter((v) => v !== t.value)
                      : [...prev, t.value],
                  )
                }
                className={`text-xs rounded-lg px-3 py-2 border transition ${active
                  ? "bg-(--gold-main) text-black border-(--gold-main)"
                  : "border-(--border-soft)"
                  }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-(--bg-main) pt-20 pb-24 text-(--text-main)">
      <div className="max-w-6xl mx-auto px-3 lg:px-4 py-6 grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Desktop Filters */}
        {/* Desktop Filters */}
        <aside
          className="
    hidden lg:block
    bg-(--bg-card)
    p-6
    rounded-xl
    border border-(--border-soft)
    sticky top-24
    max-h-[calc(100vh-7rem)]
    overflow-y-auto
  "
        >
          <h3 className="font-semibold text-lg mb-4 text-(--gold-main)">
            Filters
          </h3>

          <FilterContent />
        </aside>

        <main className="space-y-4">
          {/* Sticky Top Bar */}
          <div className="lg:hidden sticky top-16 z-40 bg-(--bg-main)/90 backdrop-blur border-b border-(--border-soft) py-3 flex gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="flex-1 bg-(--bg-card) border border-(--border-soft) py-2 rounded-lg text-sm"
            >
              Filters
            </button>

            <button
              onClick={() => setShowSort(!showSort)}
              className="flex-1 bg-(--bg-card) border border-(--border-soft) py-2 rounded-lg text-sm"
            >
              Sort
            </button>
          </div>

          {/* Sort Dropdown */}
          {showSort && (
            <div className="bg-(--bg-card) border border-(--border-soft) rounded-lg p-3">
              {["cheapest", "fastest"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSortType(type);
                    setShowSort(false);
                  }}
                  className="block w-full text-left py-2 text-sm hover:text-(--gold-main)"
                >
                  {type === "cheapest" ? "Cheapest First" : "Fastest First"}
                </button>
              ))}
            </div>
          )}

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedTimes.map((t) => (
              <span
                key={t}
                className="bg-(--gold-soft) text-black px-3 py-1 rounded-full text-xs"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Flights */}
          {filteredFlights.map((flight, index) => {
            const segments = flight?.Segments?.[0] || [];
            const first = segments?.[0];
            const last = segments?.[segments.length - 1];

            const stops = segments.length - 1;
            const duration = last.AccumulatedDuration || first.Duration;

            const isExpanded = expandedCard === index;

            return (
              <div
                key={index}
                className="bg-(--bg-card) rounded-xl border border-(--border-soft) p-5 hover:shadow-lg hover:scale-[1.01] transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    {/* <img
                      src={`/airlines/${first?.Airline?.AirlineCode}.png`}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      alt=""
                      className="h-6"
                    /> */}

                    <AirlineLogo
                      airlineCode={first?.Airline?.AirlineCode}
                      airlineName={first?.Airline?.AirlineName}
                      className="h-9 w-9 shrink-0 object-contain"
                    />
                    <div>
                      <p className="font-semibold text-(--gold-main)">
                        {first.Airline.AirlineName}
                      </p>
                      <p className="text-xs text-(--text-muted)">
                        {first.Airline.AirlineCode}-{first.Airline.FlightNumber}
                      </p>

                      <span
                        className={`text-xs px-2 py-1 rounded ${flight.IsLCC
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                          }`}
                      >
                        {flight.IsLCC ? "LCC" : "Full Service"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xl font-bold text-(--gold-soft)">
                    ₹{flight.Fare.PublishedFare.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Time Row */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold">
                      {formatTime(first.Origin.DepTime)}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      {first.Origin.Airport.AirportCode}
                    </p>
                  </div>

                  <div className="text-center text-xs text-(--text-muted)">
                    <span>{formatDuration(duration)}</span>
                    <div className="flex items-center w-24 mx-auto my-1">
                      <div className="flex-1 h-px bg-(--border-soft)" />
                      ✈
                      <div className="flex-1 h-px bg-(--border-soft)" />
                    </div>
                    <span>{stops === 0 ? "Non Stop" : `${stops} Stop`}</span>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {formatTime(last.Destination.ArrTime)}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      {last.Destination.Airport.AirportCode}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : index)}
                    className="text-xs text-(--text-muted)"
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>

                  <button
                    onClick={() => {
                      setFlight(flight);
                      navigate("/fare-rule");
                    }}
                    className="bg-linear-to-r from-start to-end text-black text-sm px-5 py-2 rounded-lg hover:opacity-90"
                  >
                    Book Now
                  </button>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="mt-4 border-t border-(--border-soft) pt-4 space-y-2 text-sm">
                    {segments.map((seg, i) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {seg.Origin.Airport.AirportCode} →{" "}
                          {seg.Destination.Airport.AirportCode}
                        </span>
                        <span>
                          {formatTime(seg.Origin.DepTime)} -{" "}
                          {formatTime(seg.Destination.ArrTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}


          {pageError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
              {pageError}
            </div>
          )}

          {pagination?.total_pages > 1 && (
            <div className="flex flex-col items-center gap-3 pt-6">
              <p className="text-xs text-(--text-muted)">
                Showing page {pagination.current_page} of{" "}
                {pagination.total_pages} •{" "}
                {pagination.total_flights} flights
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">

                {/* Previous */}
                <button
                  type="button"
                  disabled={
                    !pagination.has_previous ||
                    pageLoading
                  }
                  onClick={() =>
                    handlePageChange(
                      pagination.previous_page,
                    )
                  }
                  className="
          rounded-lg
          border border-(--border-soft)
          px-3 py-2
          text-sm
          transition
          hover:border-[#E6B35C]/50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
                >
                  Previous
                </button>

                {/* Page numbers */}
                {paginationPages.map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-(--text-muted)"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      disabled={pageLoading}
                      onClick={() =>
                        handlePageChange(page)
                      }
                      className={`
              h-9 min-w-9 rounded-lg px-3 text-sm
              border transition
              ${pagination.current_page === page
                          ? "bg-(--gold-main) border-(--gold-main) text-black"
                          : "border-(--border-soft) hover:border-[#E6B35C]/50"
                        }
              disabled:opacity-50
            `}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* Next */}
                <button
                  type="button"
                  disabled={
                    !pagination.has_next ||
                    pageLoading
                  }
                  onClick={() =>
                    handlePageChange(
                      pagination.next_page,
                    )
                  }
                  className="
          rounded-lg
          border border-(--border-soft)
          px-3 py-2
          text-sm
          transition
          hover:border-[#E6B35C]/50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
                >
                  {pageLoading
                    ? "Loading..."
                    : "Next"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end lg:hidden">
          <div className="bg-(--bg-card) w-full rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-(--gold-main)">Filters</h3>
              <button onClick={() => setShowFilters(false)}>Close</button>
            </div>

            <FilterContent />

            <button
              onClick={() => setShowFilters(false)}
              className="mt-4 w-full bg-linear-to-r from-start to-end text-black py-3 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightsResults;
