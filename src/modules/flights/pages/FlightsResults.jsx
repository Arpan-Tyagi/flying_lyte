import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFlightStore } from "../../../store/flightStore";
import AirlineLogo from "../../../components/common/AirlineLogo";
import { publicApi } from "../../../services/api";
import SEO from "../../../components/SEO";

const FlightsResults = () => {
  const navigate = useNavigate();

  const {
    flights,
    setFlights,
    setFlight,
    selectedFlight,

    // ✅ Round Trip
    outboundFlights,
    inboundFlights,
    setRoundTripFlights,
    selectedOutboundFlight,
    selectedInboundFlight,
    setOutboundFlight,
    setInboundFlight,

    lastSearchPayload,
    setLastSearchPayload,
    pagination,
  } = useFlightStore();
  const isRoundTrip =
    lastSearchPayload?.trip_type === "roundtrip";
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
    if (isRoundTrip) {
      if (
        outboundFlights?.length > 0 ||
        inboundFlights?.length > 0
      ) {
        return;
      }
    } else {
      if (flights?.length > 0) {
        return;
      }
    }

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
        const traceId =
          apiResponse?.TraceId ||
          data?.data?.Response?.TraceId ||
          data?.Response?.TraceId ||
          null;

        // const results = Array.isArray(rawResults)
        //   ? rawResults.flat(Infinity).filter(Boolean)
        //   : [];

        // if (!results.length) {
        //   throw new Error("No flights found for your previous search");
        // }




        if (isRoundTrip) {
          const outboundResults =
            Array.isArray(rawResults?.[0])
              ? rawResults[0].filter(Boolean)
              : [];

          const inboundResults =
            Array.isArray(rawResults?.[1])
              ? rawResults[1].filter(Boolean)
              : [];

          if (
            !outboundResults.length &&
            !inboundResults.length
          ) {
            throw new Error(
              "Unable to restore round trip flights"
            );
          }

          setRoundTripFlights({
            outboundFlights: outboundResults,
            inboundFlights: inboundResults,
            traceId,
            pagination: newPagination,

            // Refresh par existing selection preserve
            resetSelection: false,
          });
        } else {
          // ✅ Existing One Way logic
          const results = Array.isArray(rawResults)
            ? rawResults.flat(Infinity).filter(Boolean)
            : [];

          if (!results.length) {
            throw new Error(
              "No flights found for your previous search"
            );
          }

          setFlights({
            flights: results,
            traceId,
            pagination: newPagination,
          });
        }



        // setFlights({
        //   flights: results,
        //   traceId,
        //   pagination: newPagination,
        // });
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

    outboundFlights,
    inboundFlights,

    lastSearchPayload,

    setFlights,
    setRoundTripFlights,

    isRoundTrip,
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

      const traceId =
        apiResponse?.TraceId ||
        data?.data?.Response?.TraceId ||
        data?.Response?.TraceId ||
        data?.trace_id ||
        null;

      const newPagination =
        data?.pagination || null;

      // const results = Array.isArray(rawResults)
      //   ? rawResults.flat(Infinity).filter(Boolean)
      //   : [];

      // if (!results.length) {
      //   throw new Error("No flights found on this page");
      // }



      if (isRoundTrip) {
        const outboundResults =
          Array.isArray(rawResults?.[0])
            ? rawResults[0].filter(Boolean)
            : [];

        const inboundResults =
          Array.isArray(rawResults?.[1])
            ? rawResults[1].filter(Boolean)
            : [];

        if (
          !outboundResults.length &&
          !inboundResults.length
        ) {
          throw new Error(
            "No round trip flights found on this page"
          );
        }

        setRoundTripFlights({
          outboundFlights: outboundResults,
          inboundFlights: inboundResults,
          traceId,
          pagination: newPagination,

          // Page change par selected flights preserve
          resetSelection: false,
        });
      } else {
        // ✅ Existing One Way pagination
        const results = Array.isArray(rawResults)
          ? rawResults.flat(Infinity).filter(Boolean)
          : [];

        if (!results.length) {
          throw new Error(
            "No flights found on this page"
          );
        }

        setFlights({
          flights: results,
          traceId,
          pagination: newPagination,
        });
      }



      // setFlights({
      //   flights: results,
      //   traceId,
      //   pagination: newPagination,
      // });

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

  const renderRoundTripCard = (
    flight,
    index,
    direction,
  ) => {
    const segments =
      flight?.Segments?.[0] || [];

    const first = segments?.[0];

    const last =
      segments?.[segments.length - 1];

    if (!first || !last) {
      return null;
    }

    const isOutbound =
      direction === "outbound";

    const selectedDirectionFlight =
      isOutbound
        ? selectedOutboundFlight
        : selectedInboundFlight;

    const isSelected =
      selectedDirectionFlight?.ResultIndex ===
      flight?.ResultIndex;

    const expandedKey =
      `${direction}-${flight?.ResultIndex || index}`;

    const isExpanded =
      expandedCard === expandedKey;

    const stops =
      Math.max(0, segments.length - 1);

    const duration =
      last?.AccumulatedDuration ||
      first?.Duration ||
      0;

    const price =
      Number(
        flight?.Fare?.PublishedFare || 0,
      );

    return (
      <div
        key={
          flight?.ResultIndex ||
          `${direction}-${index}`
        }
        className={`
        rounded-2xl
        border
        bg-(--bg-card)
        p-4
        transition-all
        sm:p-5

        ${isSelected
            ? "border-[#E6B35C] shadow-[0_0_0_1px_rgba(230,179,92,0.25),0_14px_40px_rgba(0,0,0,0.24)]"
            : "border-(--border-soft) hover:border-[#E6B35C]/40"
          }
      `}
      >
        {/* Airline + Price */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AirlineLogo
              airlineCode={
                first?.Airline?.AirlineCode
              }
              airlineName={
                first?.Airline?.AirlineName
              }
              className="h-9 w-9 shrink-0 object-contain"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-(--gold-main)">
                {first?.Airline?.AirlineName}
              </p>

              <p className="text-xs text-(--text-muted)">
                {first?.Airline?.AirlineCode}-
                {first?.Airline?.FlightNumber}
              </p>

              <span
                className={`
                mt-1 inline-flex rounded-md
                px-2 py-0.5 text-[10px]
                ${flight?.IsLCC
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-green-500/10 text-green-400"
                  }
              `}
              >
                {flight?.IsLCC
                  ? "LCC"
                  : "Full Service"}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base font-bold text-(--gold-soft) sm:text-lg">
              ₹{price.toLocaleString("en-IN")}
            </p>

            <p className="text-[10px] text-(--text-muted)">
              per booking
            </p>
          </div>
        </div>

        {/* Journey */}
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <p className="text-lg font-bold sm:text-xl">
              {formatTime(
                first?.Origin?.DepTime,
              )}
            </p>

            <p className="text-xs text-(--text-muted)">
              {
                first?.Origin?.Airport
                  ?.AirportCode
              }
            </p>
          </div>

          <div className="min-w-[90px] text-center text-[11px] text-(--text-muted)">
            <p>
              {formatDuration(duration)}
            </p>

            <div className="my-1 flex items-center">
              <div className="h-px flex-1 bg-(--border-soft)" />

              <span className="px-1 text-[#E6B35C]">
                ✈
              </span>

              <div className="h-px flex-1 bg-(--border-soft)" />
            </div>

            <p>
              {stops === 0
                ? "Non Stop"
                : `${stops} Stop${stops > 1 ? "s" : ""
                }`}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold sm:text-xl">
              {formatTime(
                last?.Destination?.ArrTime,
              )}
            </p>

            <p className="text-xs text-(--text-muted)">
              {
                last?.Destination?.Airport
                  ?.AirportCode
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-(--border-soft) pt-3">
          <button
            type="button"
            onClick={() =>
              setExpandedCard(
                isExpanded
                  ? null
                  : expandedKey,
              )
            }
            className="text-xs text-(--text-muted) transition hover:text-(--gold-main)"
          >
            {isExpanded
              ? "Hide Details"
              : "View Details"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (isOutbound) {
                setOutboundFlight(flight);
              } else {
                setInboundFlight(flight);
              }
            }}
            className={`
            rounded-lg
            px-4 py-2
            text-xs font-semibold
            transition
            sm:text-sm

            ${isSelected
                ? "border border-[#E6B35C] bg-[#E6B35C]/10 text-[#E6B35C]"
                : "bg-linear-to-r from-start to-end text-black hover:brightness-105"
              }
          `}
          >
            {isSelected
              ? "Selected ✓"
              : "Select Flight"}
          </button>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 space-y-2 border-t border-(--border-soft) pt-4">
            {segments.map((seg, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-(--text-muted)">
                  {
                    seg?.Origin?.Airport
                      ?.AirportCode
                  }{" "}
                  →{" "}
                  {
                    seg?.Destination?.Airport
                      ?.AirportCode
                  }
                </span>

                <span>
                  {formatTime(
                    seg?.Origin?.DepTime,
                  )}{" "}
                  -{" "}
                  {formatTime(
                    seg?.Destination
                      ?.ArrTime,
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

  const hasRoundTripResults =
    outboundFlights?.length > 0 ||
    inboundFlights?.length > 0;

  if (
    isRoundTrip
      ? !hasRoundTripResults &&
      !selectedOutboundFlight &&
      !selectedInboundFlight
      : !flights ||
      (!flights.length && !selectedFlight)
  ) {
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


  if (isRoundTrip) {
    const outboundPrice =
      Number(
        selectedOutboundFlight
          ?.Fare?.PublishedFare || 0,
      );

    const inboundPrice =
      Number(
        selectedInboundFlight
          ?.Fare?.PublishedFare || 0,
      );

    const selectedTotal =
      outboundPrice + inboundPrice;

    return (
      <div className="min-h-screen bg-(--bg-main) pb-24 pt-20 text-(--text-main)">
        <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 lg:px-6">

          {/* Page heading */}
          <div className="mb-5 rounded-2xl border border-(--border-soft) bg-(--bg-card) p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--gold-main)">
              Round Trip Flights
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-semibold sm:text-xl">
              <span>
                {lastSearchPayload?.origin}
              </span>

              <span className="text-(--gold-main)">
                ⇄
              </span>

              <span>
                {lastSearchPayload?.destination}
              </span>
            </div>

            <p className="mt-1 text-xs text-(--text-muted)">
              Select one outbound and one return flight.
            </p>
          </div>

          {pageError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
              {pageError}
            </div>
          )}

          {/* Outbound + Inbound */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* OUTBOUND */}
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between rounded-xl border border-(--border-soft) bg-(--bg-card) px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-(--text-muted)">
                    Outbound
                  </p>

                  <p className="mt-0.5 font-semibold text-(--gold-main)">
                    {lastSearchPayload?.origin}
                    {" → "}
                    {lastSearchPayload?.destination}
                  </p>
                </div>

                <span className="rounded-full bg-[#E6B35C]/10 px-3 py-1 text-xs text-[#E6B35C]">
                  {outboundFlights?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                {outboundFlights?.length ? (
                  outboundFlights.map(
                    (flight, index) =>
                      renderRoundTripCard(
                        flight,
                        index,
                        "outbound",
                      ),
                  )
                ) : (
                  <div className="rounded-xl border border-(--border-soft) bg-(--bg-card) p-5 text-center text-sm text-(--text-muted)">
                    No outbound flights on this page.
                  </div>
                )}
              </div>
            </section>

            {/* INBOUND */}
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between rounded-xl border border-(--border-soft) bg-(--bg-card) px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-(--text-muted)">
                    Return
                  </p>

                  <p className="mt-0.5 font-semibold text-(--gold-main)">
                    {lastSearchPayload?.destination}
                    {" → "}
                    {lastSearchPayload?.origin}
                  </p>
                </div>

                <span className="rounded-full bg-[#E6B35C]/10 px-3 py-1 text-xs text-[#E6B35C]">
                  {inboundFlights?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                {inboundFlights?.length ? (
                  inboundFlights.map(
                    (flight, index) =>
                      renderRoundTripCard(
                        flight,
                        index,
                        "inbound",
                      ),
                  )
                ) : (
                  <div className="rounded-xl border border-(--border-soft) bg-(--bg-card) p-5 text-center text-sm text-(--text-muted)">
                    No return flights on this page.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Selected Journey Summary */}
          <div className="mt-6 rounded-2xl border border-[#E6B35C]/25 bg-(--bg-card) p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-center">

              <div>
                <p className="text-xs text-(--text-muted)">
                  Outbound
                </p>

                {selectedOutboundFlight ? (
                  <p className="mt-1 text-sm font-semibold">
                    {
                      selectedOutboundFlight
                        ?.Segments?.[0]?.[0]
                        ?.Airline?.AirlineName
                    }{" "}
                    · ₹
                    {outboundPrice.toLocaleString(
                      "en-IN",
                    )}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-(--text-muted)">
                    Select an outbound flight
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-(--text-muted)">
                  Return
                </p>

                {selectedInboundFlight ? (
                  <p className="mt-1 text-sm font-semibold">
                    {
                      selectedInboundFlight
                        ?.Segments?.[0]?.[0]
                        ?.Airline?.AirlineName
                    }{" "}
                    · ₹
                    {inboundPrice.toLocaleString(
                      "en-IN",
                    )}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-(--text-muted)">
                    Select a return flight
                  </p>
                )}
              </div>

              <div className="border-t border-(--border-soft) pt-3 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <p className="text-xs text-(--text-muted)">
                  Selected Fare
                </p>

                <p className="mt-1 text-xl font-bold text-(--gold-soft)">
                  ₹
                  {selectedTotal.toLocaleString(
                    "en-IN",
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {pagination?.total_pages > 1 && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-xs text-(--text-muted)">
                Page {pagination.current_page} of{" "}
                {pagination.total_pages}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
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
                  className="rounded-lg border border-(--border-soft) px-3 py-2 text-sm transition hover:border-[#E6B35C]/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {paginationPages.map(
                  (page, index) =>
                    page === "..." ? (
                      <span
                        key={`roundtrip-ellipsis-${index}`}
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
                        h-9 min-w-9
                        rounded-lg border
                        px-3 text-sm
                        transition
                        ${pagination.current_page ===
                            page
                            ? "border-(--gold-main) bg-(--gold-main) text-black"
                            : "border-(--border-soft) hover:border-[#E6B35C]/50"
                          }
                        disabled:opacity-50
                      `}
                      >
                        {page}
                      </button>
                    ),
                )}

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
                  className="rounded-lg border border-(--border-soft) px-3 py-2 text-sm transition hover:border-[#E6B35C]/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {pageLoading
                    ? "Loading..."
                    : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
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
      <SEO
        title="Flight Search Results"
        description="Search, compare, and book the cheapest domestic and international flights with FlyingLyte. Real-time fares and instant booking."
        canonical="https://www.flyinglyte.com/flights/results"
      />
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
