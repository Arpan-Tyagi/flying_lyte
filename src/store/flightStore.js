import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const toBool = (value) =>
  value === true || String(value).toLowerCase() === "true";

const initialFlightValidation = {
  isPanRequiredAtBook: false,
  isPanRequiredAtTicket: false,

  isPassportRequiredAtBook: false,
  isPassportRequiredAtTicket: false,
  isPassportFullDetailRequiredAtBook: false,

  isGSTMandatory: false,

  isPriceChanged: false,
  isTimeChanged: false,
  flightDetailChangeInfo: "",

  isSeatMandatory: false,
  isMealMandatory: false,
};

const initialSearchTravellers = {
  adults: 1,
  children: 0,
  infants: 0,
  cabin: "Economy",
};

const initialFlightPagination = {
  current_page: 1,
  page_size: 20,
  total_flights: 0,
  total_pages: 1,
  has_next: false,
  has_previous: false,
  next_page: null,
  previous_page: null,
};

const getFareQuoteRoot = (fareQuote) => {
  return (
    fareQuote?.Response?.Results ||
    fareQuote?.Response?.Result ||
    fareQuote?.Response ||
    fareQuote?.Results ||
    fareQuote?.Result ||
    fareQuote ||
    {}
  );
};

const normalizeFlightValidation = (fareQuote) => {
  const data = getFareQuoteRoot(fareQuote);

  return {
    isPanRequiredAtBook: toBool(data?.IsPanRequiredAtBook),
    isPanRequiredAtTicket: toBool(data?.IsPanRequiredAtTicket),

    isPassportRequiredAtBook: toBool(data?.IsPassportRequiredAtBook),
    isPassportRequiredAtTicket: toBool(data?.IsPassportRequiredAtTicket),
    isPassportFullDetailRequiredAtBook: toBool(
      data?.IsPassportFullDetailRequiredAtBook,
    ),

    isGSTMandatory: toBool(data?.IsGSTMandatory),

    isPriceChanged: toBool(data?.IsPriceChanged || data?.ispricechanged),
    isTimeChanged: toBool(data?.IsTimeChanged || data?.istimechanged),
    flightDetailChangeInfo:
      data?.FlightDetailChangeInfo || data?.flightDetailChangeInfo || "",

    isSeatMandatory: toBool(
      data?.IsSeatMandatory ||
      data?.isseatmandatory ||
      data?.IsSeatMandatoryRequired,
    ),

    isMealMandatory: toBool(
      data?.IsMealMandatory ||
      data?.ismealmandatory ||
      data?.IsMealMandatoryRequired,
    ),
  };
};

export const useFlightStore = create(
  persist(
    (set, get) => ({
      flights: [],
      selectedFlight: null,
      traceId: null,
      resultIndex: null,


      fareQuote: null,

      // ✅ Round Trip Fare Quote
      outboundFareQuote: null,
      inboundFareQuote: null,

      isLcc: null,
      // ✅ Round Trip state
      outboundFlights: [],
      inboundFlights: [],

      selectedOutboundFlight: null,
      selectedInboundFlight: null,

      outboundResultIndex: null,
      inboundResultIndex: null,

      // ✅ Search / passenger state
      passengerCount: 1,
      searchTravellers: initialSearchTravellers,
      lastSearchAt: null,
      lastSearchPayload: null,
      pagination: initialFlightPagination,

      // ✅ FareQuote validation state
      flightValidation: initialFlightValidation,

      // ✅ SSR state
      selectedMeals: [],
      selectedSeats: [],
      selectedBaggage: [],
      ssrTotal: 0,
      // ✅ Round Trip SSR selections
      outboundSelectedSeats: [],
      outboundSelectedMeals: [],
      outboundSelectedBaggage: [],

      inboundSelectedSeats: [],
      inboundSelectedMeals: [],
      inboundSelectedBaggage: [],

      // Optional booking storage
      bookings: [],

      clearBookings: () => {
        localStorage.removeItem("bookings");
        set({ bookings: [] });
      },



      setFlights: ({ flights, traceId, pagination }) =>
        set((state) => ({
          flights: flights || [],
          traceId: traceId || null,

          pagination: pagination
            ? {
              ...initialFlightPagination,
              ...pagination,
            }
            : state.pagination,

          lastSearchAt: Date.now(),
        })),

      // ✅ Round Trip search results
      setRoundTripFlights: ({
        outboundFlights,
        inboundFlights,
        traceId,
        pagination,
        resetSelection = false,
      }) =>
        set((state) => ({
          outboundFlights: Array.isArray(outboundFlights)
            ? outboundFlights
            : [],

          inboundFlights: Array.isArray(inboundFlights)
            ? inboundFlights
            : [],

          traceId: traceId || null,

          ...(resetSelection
            ? {
              selectedOutboundFlight: null,
              selectedInboundFlight: null,
              outboundResultIndex: null,
              inboundResultIndex: null,
            }
            : {}),

          pagination: pagination
            ? {
              ...initialFlightPagination,
              ...pagination,
            }
            : state.pagination,

          lastSearchAt: Date.now(),
        })),


      setFlight: (flight) =>
        set({
          selectedFlight: flight || null,
          resultIndex:
            flight && flight.ResultIndex !== undefined ? flight.ResultIndex : null,
          isLcc: flight?.IsLCC ?? null,

          // ✅ reset SSR when user changes flight
          selectedMeals: [],
          selectedSeats: [],
          selectedBaggage: [],
          ssrTotal: 0,
        }),
      // ✅ Select outbound flight
      setOutboundFlight: (flight) =>
        set({
          selectedOutboundFlight: flight || null,

          outboundResultIndex:
            flight?.ResultIndex !== undefined
              ? flight.ResultIndex
              : null,

          // ✅ old outbound Fare Quote + SSR clear
          outboundFareQuote: null,

          outboundSelectedSeats: [],
          outboundSelectedMeals: [],
          outboundSelectedBaggage: [],
        }),

      // ✅ Select inbound / return flight
      setInboundFlight: (flight) =>
        set({
          selectedInboundFlight: flight || null,

          inboundResultIndex:
            flight?.ResultIndex !== undefined
              ? flight.ResultIndex
              : null,

          // ✅ old return Fare Quote + SSR clear
          inboundFareQuote: null,

          inboundSelectedSeats: [],
          inboundSelectedMeals: [],
          inboundSelectedBaggage: [],
        }),

      setFareQuote: (fareQuote) =>
        set({
          fareQuote,
          flightValidation: normalizeFlightValidation(fareQuote),
        }),
      // ✅ Round Trip Fare Quote
      setRoundTripFareQuotes: ({
        outboundFareQuote,
        inboundFareQuote,
      }) => {
        const outboundValidation =
          normalizeFlightValidation(outboundFareQuote);

        const inboundValidation =
          normalizeFlightValidation(inboundFareQuote);

        set({
          fareQuote: null,
          outboundFareQuote:
            outboundFareQuote || null,

          inboundFareQuote:
            inboundFareQuote || null,

          flightValidation: {
            isPanRequiredAtBook:
              outboundValidation.isPanRequiredAtBook ||
              inboundValidation.isPanRequiredAtBook,

            isPanRequiredAtTicket:
              outboundValidation.isPanRequiredAtTicket ||
              inboundValidation.isPanRequiredAtTicket,

            isPassportRequiredAtBook:
              outboundValidation.isPassportRequiredAtBook ||
              inboundValidation.isPassportRequiredAtBook,

            isPassportRequiredAtTicket:
              outboundValidation.isPassportRequiredAtTicket ||
              inboundValidation.isPassportRequiredAtTicket,

            isPassportFullDetailRequiredAtBook:
              outboundValidation.isPassportFullDetailRequiredAtBook ||
              inboundValidation.isPassportFullDetailRequiredAtBook,

            isGSTMandatory:
              outboundValidation.isGSTMandatory ||
              inboundValidation.isGSTMandatory,

            isPriceChanged:
              outboundValidation.isPriceChanged ||
              inboundValidation.isPriceChanged,

            isTimeChanged:
              outboundValidation.isTimeChanged ||
              inboundValidation.isTimeChanged,

            flightDetailChangeInfo: [
              outboundValidation.flightDetailChangeInfo,
              inboundValidation.flightDetailChangeInfo,
            ]
              .filter(Boolean)
              .join(" | "),

            isSeatMandatory:
              outboundValidation.isSeatMandatory ||
              inboundValidation.isSeatMandatory,

            isMealMandatory:
              outboundValidation.isMealMandatory ||
              inboundValidation.isMealMandatory,
          },
        });
      },

      setPassengerCount: (count) => set({ passengerCount: Number(count) || 1 }),

      // ✅ NEW: Adult / Child / Infant details for PassengerDetails page
      setSearchTravellers: (travellers) =>
        set({
          searchTravellers: {
            adults: Number(travellers?.adults || 1),
            children: Number(travellers?.children || 0),
            infants: Number(travellers?.infants || 0),
            cabin: travellers?.cabin || "Economy",
          },
        }),

      setLastSearchPayload: (payload) =>
        set({
          lastSearchPayload: payload || null,
        }),

      setSelectedMeals: (meals) => set({ selectedMeals: meals || [] }),

      setSelectedSeats: (seats) => set({ selectedSeats: seats || [] }),

      setSelectedBaggage: (baggage) => set({ selectedBaggage: baggage || [] }),


      // ✅ Round Trip Outbound SSR
      setOutboundSelectedSeats: (seats) =>
        set({
          outboundSelectedSeats: seats || [],
        }),

      setOutboundSelectedMeals: (meals) =>
        set({
          outboundSelectedMeals: meals || [],
        }),

      setOutboundSelectedBaggage: (baggage) =>
        set({
          outboundSelectedBaggage: baggage || [],
        }),

      // ✅ Round Trip Inbound SSR
      setInboundSelectedSeats: (seats) =>
        set({
          inboundSelectedSeats: seats || [],
        }),

      setInboundSelectedMeals: (meals) =>
        set({
          inboundSelectedMeals: meals || [],
        }),

      setInboundSelectedBaggage: (baggage) =>
        set({
          inboundSelectedBaggage: baggage || [],
        }),



      calculateSSRTotal: () => {
        const { selectedSeats, selectedMeals, selectedBaggage } = get();

        const total = [
          ...(selectedSeats || []),
          ...(selectedMeals || []),
          ...(selectedBaggage || []),
        ].reduce((sum, item) => sum + Number(item?.Price || 0), 0);

        set({ ssrTotal: total });
      },

      // ✅ helper: call before Book/Ticket page
      isTraceExpired: () => {
        const { lastSearchAt } = get();

        if (!lastSearchAt) return true;

        // TBO TraceId expires around 15 minutes
        return Date.now() - lastSearchAt > 15 * 60 * 1000;
      },

      // ✅ helper: use on passenger page
      requiresPan: (method = "book") => {
        const { flightValidation } = get();

        return method === "ticket"
          ? flightValidation.isPanRequiredAtTicket
          : flightValidation.isPanRequiredAtBook;
      },

      requiresPassport: (method = "book") => {
        const { flightValidation } = get();

        return method === "ticket"
          ? flightValidation.isPassportRequiredAtTicket
          : flightValidation.isPassportRequiredAtBook;
      },

      requiresFullPassportDetails: () => {
        const { flightValidation } = get();
        return flightValidation.isPassportFullDetailRequiredAtBook;
      },

      requiresGST: () => {
        const { flightValidation } = get();
        return flightValidation.isGSTMandatory;
      },

      requiresSeatSelection: () => {
        const { flightValidation } = get();
        return flightValidation.isSeatMandatory;
      },

      requiresMealSelection: () => {
        const { flightValidation } = get();
        return flightValidation.isMealMandatory;
      },

      clearFlights: () =>
        set({
          flights: [],
          selectedFlight: null,
          traceId: null,
          resultIndex: null,
          fareQuote: null,
          outboundFareQuote: null,
          inboundFareQuote: null,
          isLcc: null,

          // ✅ Round Trip reset
          outboundFlights: [],
          inboundFlights: [],

          selectedOutboundFlight: null,
          selectedInboundFlight: null,

          outboundResultIndex: null,
          inboundResultIndex: null,

          passengerCount: 1,
          searchTravellers: initialSearchTravellers,
          lastSearchAt: null,
          lastSearchPayload: null,
          pagination: initialFlightPagination,

          flightValidation: initialFlightValidation,

          selectedMeals: [],
          selectedSeats: [],
          selectedBaggage: [],
          ssrTotal: 0,
          outboundSelectedSeats: [],
          outboundSelectedMeals: [],
          outboundSelectedBaggage: [],

          inboundSelectedSeats: [],
          inboundSelectedMeals: [],
          inboundSelectedBaggage: [],
        }),

      resetBooking: () =>
        set({
          selectedFlight: null,
          resultIndex: null,
          fareQuote: null,

          outboundFareQuote: null,
          inboundFareQuote: null,

          isLcc: null,
          selectedOutboundFlight: null,
          selectedInboundFlight: null,

          outboundResultIndex: null,
          inboundResultIndex: null,

          flightValidation: initialFlightValidation,

          selectedMeals: [],
          selectedSeats: [],
          selectedBaggage: [],
          ssrTotal: 0,
          outboundSelectedSeats: [],
          outboundSelectedMeals: [],
          outboundSelectedBaggage: [],

          inboundSelectedSeats: [],
          inboundSelectedMeals: [],
          inboundSelectedBaggage: [],
        }),
    }),
    {
      name: "flight-search-storage",

      // refresh survive karega, tab/browser close hone par clear ho jayega
      storage: createJSONStorage(() => sessionStorage),

      partialize: (state) => ({
        // Search
        lastSearchPayload: state.lastSearchPayload,
        passengerCount: state.passengerCount,
        searchTravellers: state.searchTravellers,

        pagination: state.pagination,

        // Flight session
        selectedFlight: state.selectedFlight,
        traceId: state.traceId,
        resultIndex: state.resultIndex,
        isLcc: state.isLcc,
        lastSearchAt: state.lastSearchAt,
        // ✅ Round Trip selected flights
        selectedOutboundFlight:
          state.selectedOutboundFlight,

        selectedInboundFlight:
          state.selectedInboundFlight,

        outboundResultIndex:
          state.outboundResultIndex,

        inboundResultIndex:
          state.inboundResultIndex,
        // ✅ ADD THESE FOR SSR REFRESH
        fareQuote: state.fareQuote,

        // ✅ Round Trip Fare Quote
        outboundFareQuote:
          state.outboundFareQuote,

        inboundFareQuote:
          state.inboundFareQuote,

        flightValidation:
          state.flightValidation,

        // ✅ selections bhi refresh ke baad preserve rahengi
        selectedSeats: state.selectedSeats,
        selectedMeals: state.selectedMeals,
        selectedBaggage: state.selectedBaggage,
        ssrTotal: state.ssrTotal,
        outboundSelectedSeats:
          state.outboundSelectedSeats,

        outboundSelectedMeals:
          state.outboundSelectedMeals,

        outboundSelectedBaggage:
          state.outboundSelectedBaggage,

        inboundSelectedSeats:
          state.inboundSelectedSeats,

        inboundSelectedMeals:
          state.inboundSelectedMeals,

        inboundSelectedBaggage:
          state.inboundSelectedBaggage,
      }),
    },
  ),
);
