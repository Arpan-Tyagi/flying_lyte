import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../../services/api";
import { useFlightStore } from "../../../store/flightStore";

const hasValidResultIndex = (value) => {
  return value !== null && value !== undefined && value !== "";
};

const getFareRulesFromResponse = (data) => {
  const rules =
    data?.data?.Response?.FareRules ||
    data?.Response?.FareRules ||
    data?.data?.FareRules ||
    data?.FareRules ||
    [];

  return Array.isArray(rules) ? rules : [];
};

const sanitizeFareRuleHtml = (html) => {
  if (!html) return "No details available";

  return String(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
};


const formatDuration = (value) => {
  if (!value) return null;

  const match = String(value).match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/
  );

  if (!match) return value;

  const days = Number(match[1] || 0);
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);

  const parts = [];

  if (days) {
    parts.push(
      `${days} ${days === 1 ? "day" : "days"}`
    );
  }

  if (hours) {
    parts.push(
      `${hours} ${hours === 1 ? "hour" : "hours"}`
    );
  }

  if (minutes) {
    parts.push(
      `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
    );
  }

  return parts.length
    ? parts.join(" ")
    : value;
};


const getPenaltyWindow = (rule) => {
  const from = formatDuration(
    rule?.FromDuration
  );

  const to = formatDuration(
    rule?.ToDuration
  );

  if (from && to) {
    return `${from} to ${to} before departure`;
  }

  if (from && !to) {
    return `${from} or more before departure`;
  }

  if (!from && to) {
    return `Up to ${to} before departure`;
  }

  return rule?.DepartureType ||
    "Before departure";
};


const getRuleTypeLabel = (type) => {
  if (Number(type) === 0) {
    return "Cancellation Charges";
  }

  if (Number(type) === 1) {
    return "Date Change / Rescheduling Charges";
  }

  return `Rule Type ${type ?? "-"}`;
};


const getPassengerTypeLabel = (type) => {
  if (Number(type) === 1) {
    return "Adult";
  }

  if (Number(type) === 2) {
    return "Child";
  }

  if (Number(type) === 3) {
    return "Infant";
  }

  return `Passenger ${type ?? "-"}`;
};


const formatDateTime = (value) => {
  if (
    !value ||
    String(value).startsWith("0001-01-01")
  ) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const FareRule = () => {
  const navigate = useNavigate();

  const { traceId, resultIndex, selectedFlight, isTraceExpired } =
    useFlightStore();

  const [fareRules, setFareRules] = useState([]);
  const [openRule, setOpenRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionMissing = !traceId || !hasValidResultIndex(resultIndex);

  const sessionExpired =
    typeof isTraceExpired === "function" && isTraceExpired();

  const segments = useMemo(() => {
    const list = selectedFlight?.Segments?.[0];
    return Array.isArray(list) ? list : [];
  }, [selectedFlight]);

  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  const airline = firstSegment?.Airline;
  const fare = selectedFlight?.Fare;

  useEffect(() => {
    if (sessionMissing) {
      setLoading(false);
      return;
    }

    if (sessionExpired) {
      setLoading(false);
      setError("Your flight search session is older than 15 minutes.");
      return;
    }

    let isMounted = true;

    const fetchFareRules = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await publicApi.post("/api/airlines/fare-rule/", {
          TraceId: traceId,
          ResultIndex: resultIndex,
        });

        const data = response?.data;

        const errorCode =
          data?.data?.Response?.Error?.ErrorCode ||
          data?.Response?.Error?.ErrorCode ||
          data?.Error?.ErrorCode;

        const errorMessage =
          data?.data?.Response?.Error?.ErrorMessage ||
          data?.Response?.Error?.ErrorMessage ||
          data?.error ||
          data?.message;

        if (Number(errorCode) === 6) {
          throw new Error("Invalid token. Please search again.");
        }

        if (errorMessage && errorCode && Number(errorCode) !== 0) {
          throw new Error(errorMessage);
        }

        const rules = getFareRulesFromResponse(data);

        if (isMounted) {
          setFareRules(rules);
        }
      } catch (err) {
        console.error("FARE RULE ERROR:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load fare rules.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFareRules();

    return () => {
      isMounted = false;
    };
  }, [traceId, resultIndex, sessionMissing, sessionExpired]);

  const handleSearchAgain = () => {
    navigate("/");
  };

  const handleContinueBooking = () => {
    if (sessionMissing) {
      setError("Flight session expired. Please search flights again.");
      return;
    }

    if (sessionExpired) {
      setError(
        "Your flight search session is older than 15 minutes. Please search again before booking.",
      );
      return;
    }

    if (!selectedFlight) {
      setError("Selected flight missing. Please select flight again.");
      return;
    }

    navigate("/fare-quote");
  };

  if (sessionMissing) {
    return (
      <div className="min-h-screen bg-(--bg-main) text-(--text-main) flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg text-center">Flight session expired.</p>

        <button
          type="button"
          onClick={handleSearchAgain}
          className="px-6 py-3 rounded-xl bg-linear-to-r from-start to-end text-black font-semibold"
        >
          Search Flights Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg-main) flex flex-col items-center justify-center gap-4 text-(--text-main)">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-(--gold-main) rounded-full animate-spin" />
        <p className="text-sm text-(--text-muted)">Fetching Fare Rules...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-main) text-(--text-main)">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-24 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-(--gold-main)">
            Fare Rules
          </h1>

          <p className="text-sm text-(--text-muted) mt-1">
            Review the fare conditions before continuing your booking.
          </p>
        </div>

        {selectedFlight && firstSegment && lastSegment && (
          <div className="bg-(--bg-card) border border-(--border-soft) rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center justify-between md:justify-start gap-6 w-full md:w-auto">
                <div className="text-center">
                  <p className="text-xl font-bold text-(--gold-soft)">
                    {firstSegment?.Origin?.Airport?.AirportCode || "-"}
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    {firstSegment?.Origin?.Airport?.CityName || "-"}
                  </p>
                </div>

                <div className="text-(--gold-main) text-xl">✈</div>

                <div className="text-center">
                  <p className="text-xl font-bold text-(--gold-soft)">
                    {lastSegment?.Destination?.Airport?.AirportCode || "-"}
                  </p>
                  <p className="text-xs text-(--text-muted)">
                    {lastSegment?.Destination?.Airport?.CityName || "-"}
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm font-semibold text-(--gold-main)">
                  {airline?.AirlineName || "Airline"}
                </p>

                <p className="text-xs text-(--text-muted)">
                  {airline?.AirlineCode || ""}
                  {airline?.AirlineCode && airline?.FlightNumber ? "-" : ""}
                  {airline?.FlightNumber || ""}
                </p>

                <p className="mt-2 text-xl font-bold text-(--gold-soft)">
                  ₹
                  {Number(
                    fare?.PublishedFare || fare?.OfferedFare || 0,
                  ).toLocaleString("en-IN")}
                </p>

                <span
                  className={`inline-block mt-2 text-xs px-2 py-1 rounded ${selectedFlight?.IsLCC
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                    }`}
                >
                  {selectedFlight?.IsLCC ? "LCC" : "Full Service"}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <span>{error}</span>

            <button
              type="button"
              onClick={handleSearchAgain}
              className="text-(--gold-main) underline text-left md:text-right"
            >
              Search again
            </button>
          </div>
        )}

        <div className="space-y-4">
          {fareRules.length === 0 ? (
            <div className="bg-(--bg-card) border border-(--border-soft) rounded-xl p-5">
              <p className="text-sm text-(--text-muted)">
                No fare rules available for this flight.
              </p>
            </div>
          ) : (
            fareRules.map((rule, index) => {
              const origin = rule?.Origin || rule?.FromAirportCode;
              const destination = rule?.Destination || rule?.ToAirportCode;
              const airlineCode = rule?.Airline || rule?.AirlineCode;

              return (
                <div
                  key={`${origin || "rule"}-${destination || index}-${index}`}
                  className="bg-(--bg-card) border border-(--border-soft) rounded-xl shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenRule(openRule === index ? null : index)
                    }
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-(--gold-soft)">
                      {origin && destination
                        ? `${origin} → ${destination}`
                        : `Fare Rule ${index + 1}`}

                      {airlineCode ? (
                        <span className="ml-2 text-xs text-(--text-muted)">
                          {airlineCode}
                        </span>
                      ) : null}
                    </span>

                    <span className="text-lg font-bold text-(--gold-main)">
                      {openRule === index ? "−" : "+"}
                    </span>
                  </button>

                  {openRule === index && (
                    <div
                      className="
      border-t border-(--border-soft)
      px-4 sm:px-5
      py-5
      space-y-5
    "
                    >
                      {/* ==============================
        BASIC FARE INFORMATION
    ============================== */}

                      <div
                        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-3
      "
                      >
                        <div
                          className="
          rounded-xl
          border border-(--border-soft)
          bg-(--bg-main)
          p-4
        "
                        >
                          <p className="text-xs text-(--text-muted)">
                            Fare Basis
                          </p>

                          <p className="mt-1 font-semibold text-(--gold-soft)">
                            {rule?.FareBasisCode || "Not provided"}
                          </p>
                        </div>


                        <div
                          className="
          rounded-xl
          border border-(--border-soft)
          bg-(--bg-main)
          p-4
        "
                        >
                          <p className="text-xs text-(--text-muted)">
                            Fare Type
                          </p>

                          <div className="mt-2">
                            <span
                              className={`
              inline-flex
              items-center
              rounded-full
              px-3 py-1
              text-xs
              font-semibold
              ${rule?.NonRefundable
                                  ? "bg-red-500/15 text-red-400 border border-red-500/20"
                                  : "bg-green-500/15 text-green-400 border border-green-500/20"
                                }
            `}
                            >
                              {rule?.NonRefundable
                                ? "Non-Refundable"
                                : "Refundable"}
                            </span>
                          </div>
                        </div>


                        <div
                          className="
          rounded-xl
          border border-(--border-soft)
          bg-(--bg-main)
          p-4
        "
                        >
                          <p className="text-xs text-(--text-muted)">
                            Route
                          </p>

                          <p className="mt-1 font-semibold text-(--text-main)">
                            {rule?.Origin || "-"}
                            {" → "}
                            {rule?.Destination || "-"}
                          </p>
                        </div>


                        <div
                          className="
          rounded-xl
          border border-(--border-soft)
          bg-(--bg-main)
          p-4
        "
                        >
                          <p className="text-xs text-(--text-muted)">
                            Departure
                          </p>

                          <p className="mt-1 text-sm font-medium text-(--text-main)">
                            {formatDateTime(
                              rule?.DepartureTime
                            ) || "Not provided"}
                          </p>
                        </div>
                      </div>


                      {/* ==============================
        MINI FARE RULES
    ============================== */}

                      {Array.isArray(
                        rule?.MiniFareRules?.Rules
                      ) &&
                        rule.MiniFareRules.Rules.length >
                        0 ? (
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-(--gold-main)">
                              Cancellation & Change Charges
                            </h3>

                            <p className="mt-1 text-xs text-(--text-muted)">
                              Charges may vary depending on
                              how close the request is to
                              departure.
                            </p>
                          </div>


                          <div
                            className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-3
          "
                          >
                            {rule.MiniFareRules.Rules.map(
                              (miniRule, ruleIndex) => {
                                const penalties =
                                  Array.isArray(
                                    miniRule?.PaxPenalties
                                  )
                                    ? miniRule.PaxPenalties
                                    : [];

                                const isCancellation =
                                  Number(miniRule?.Type) ===
                                  0;

                                return (
                                  <div
                                    key={`${miniRule?.Type}-${ruleIndex}`}
                                    className="
                    rounded-xl
                    border border-(--border-soft)
                    bg-(--bg-main)
                    p-4
                    space-y-3
                  "
                                  >
                                    <div
                                      className="
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-2
                    "
                                    >
                                      <span
                                        className={`
                        w-fit
                        rounded-full
                        px-3 py-1
                        text-xs
                        font-semibold
                        ${isCancellation
                                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                                            : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                                          }
                      `}
                                      >
                                        {getRuleTypeLabel(
                                          miniRule?.Type
                                        )}
                                      </span>

                                      <span className="text-xs text-(--text-muted)">
                                        {miniRule?.DepartureType ||
                                          "Before departure"}
                                      </span>
                                    </div>


                                    <div>
                                      <p className="text-xs text-(--text-muted)">
                                        Time Window
                                      </p>

                                      <p className="mt-1 text-sm font-medium text-(--text-main)">
                                        {getPenaltyWindow(
                                          miniRule
                                        )}
                                      </p>
                                    </div>


                                    <div className="space-y-2">
                                      {penalties.length >
                                        0 ? (
                                        penalties.map(
                                          (
                                            penalty,
                                            penaltyIndex
                                          ) => (
                                            <div
                                              key={
                                                penaltyIndex
                                              }
                                              className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              rounded-lg
                              border border-(--border-soft)
                              px-3 py-2
                            "
                                            >
                                              <div>
                                                <p className="text-xs text-(--text-muted)">
                                                  {
                                                    getPassengerTypeLabel(
                                                      penalty?.PassengerType
                                                    )
                                                  }
                                                </p>

                                                <p className="text-xs text-(--text-muted)">
                                                  Airline fee
                                                </p>
                                              </div>

                                              <p className="font-bold text-(--gold-soft) whitespace-nowrap">
                                                {penalty?.Currency ||
                                                  "INR"}{" "}
                                                {Number(
                                                  penalty?.AirlineFee ||
                                                  0
                                                ).toLocaleString(
                                                  "en-IN"
                                                )}
                                              </p>
                                            </div>
                                          )
                                        )
                                      ) : (
                                        <p className="text-sm text-(--text-muted)">
                                          No penalty amount
                                          provided.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="
          rounded-xl
          border border-(--border-soft)
          bg-(--bg-main)
          p-4
        "
                        >
                          <p className="text-sm text-(--text-muted)">
                            Detailed cancellation or change
                            charges were not provided by the
                            airline.
                          </p>
                        </div>
                      )}


                      {/* ==============================
        FARE INCLUSIONS
    ============================== */}

                      {Array.isArray(
                        rule?.FareInclusions
                      ) &&
                        rule.FareInclusions.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-(--gold-main)">
                              Fare Inclusions
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {rule.FareInclusions.map(
                                (item, inclusionIndex) => (
                                  <span
                                    key={inclusionIndex}
                                    className="
                  rounded-full
                  border border-(--border-soft)
                  bg-(--bg-main)
                  px-3 py-1.5
                  text-xs
                  text-(--text-main)
                "
                                  >
                                    {String(item)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}


                      {/* ==============================
        RESTRICTION
    ============================== */}

                      {rule?.FareRestriction && (
                        <div
                          className="
          rounded-xl
          border border-yellow-500/20
          bg-yellow-500/5
          p-4
        "
                        >
                          <p className="text-xs font-semibold text-(--gold-main)">
                            Fare Restriction
                          </p>

                          <p className="mt-1 text-sm text-(--text-main)">
                            {String(
                              rule.FareRestriction
                            )}
                          </p>
                        </div>
                      )}


                      {/* ==============================
        ADDITIONAL DETAILS
    ============================== */}

                      {rule?.FareRuleDetail && (
                        <div>
                          <h3 className="font-semibold text-(--gold-main)">
                            Additional Fare Details
                          </h3>

                          <div
                            className="
            mt-2
            rounded-xl
            border border-(--border-soft)
            bg-(--bg-main)
            p-4
            text-sm
            text-(--text-muted)
            leading-relaxed
            prose prose-sm
            max-w-none
            prose-invert
          "
                            dangerouslySetInnerHTML={{
                              __html:
                                sanitizeFareRuleHtml(
                                  rule?.FareRuleDetail
                                ),
                            }}
                          />
                        </div>
                      )}


                      <div
                        className="
        rounded-xl
        border border-(--border-soft)
        bg-(--bg-main)
        px-4 py-3
      "
                      >
                        <p className="text-xs text-(--text-muted)">
                          Airline fare rules and penalties
                          can change until the booking is
                          ticketed. Final charges are subject
                          to the airline's applicable fare
                          conditions.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-(--bg-card) border-t border-(--border-soft)">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/flights/results")}
            className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold border border-(--border-soft) text-(--text-main)"
          >
            Back to Results
          </button>

          <button
            type="button"
            onClick={handleContinueBooking}
            disabled={Boolean(error && sessionExpired)}
            className="w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-black
            bg-linear-to-r from-start to-end
            hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Continue Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default FareRule;
