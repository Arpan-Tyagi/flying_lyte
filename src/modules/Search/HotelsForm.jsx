"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../services/api";
import { cityData } from "../hotels/HotelData";
import { countryData } from "../hotels/CountryData";
import { useHotelStore } from "../../store/hotelStore";

const MAX_ROOMS = 6;
const MAX_ADULTS_PER_ROOM = 8;
const MAX_CHILDREN_PER_ROOM = 4;
const MIN_CHILD_AGE = 1;
const MAX_CHILD_AGE = 12;
const HOTEL_CODES_PER_REQUEST = 100;
const RESPONSE_TIME_SECONDS = 23;
const HOTEL_PAGE_SIZE = 20;
const HOTEL_SEARCH_ENDPOINT = "/api/hotels/search-hotels/";

const INDIA_NATIONALITY = {
  Code: "IN",
  Name: "India",
};

const INDIA_KEYWORDS = ["india", "in", "ind"];

const INTERNATIONAL_DESTINATION_KEYWORDS = [
  "dubai",
  "abu dhabi",
  "sharjah",
  "ras al khaimah",
  "ajman",
  "uae",
  "united arab emirates",
  "singapore",
  "bangkok",
  "phuket",
  "pattaya",
  "krabi",
  "thailand",
  "bali",
  "indonesia",
  "kuala lumpur",
  "malaysia",
  "maldives",
  "vietnam",
  "sri lanka",
  "london",
  "united kingdom",
  "uk",
  "paris",
  "france",
  "rome",
  "milan",
  "italy",
  "zurich",
  "switzerland",
  "new york",
  "usa",
  "united states",
  "australia",
];

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase();

const getCityName = (city = {}) =>
  city.name ||
  city.Name ||
  city.CityName ||
  city.cityName ||
  city.DestinationName ||
  "";

const getCityCode = (city = {}) =>
  city.code || city.Code || city.CityId || city.cityId || city.CityCode || "";

const getCityCountry = (city = {}) =>
  city.country ||
  city.Country ||
  city.countryName ||
  city.CountryName ||
  city.CountryCode ||
  city.countryCode ||
  "";

const isIndiaCountry = (country = "") => {
  const value = normalizeText(country);
  if (!value) return false;

  return INDIA_KEYWORDS.some((keyword) => value === keyword);
};

const isInternationalDestination = (cityName = "", countryName = "") => {
  const country = normalizeText(countryName);
  const city = normalizeText(cityName);

  if (country) {
    return !isIndiaCountry(country);
  }

  return INTERNATIONAL_DESTINATION_KEYWORDS.some((keyword) => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, "i");

    return regex.test(city);
  });
};
const createRoom = () => ({
  adults: 1,
  children: 0,
  childAges: [],
});

const getInitialRooms = (search) => {
  if (
    Array.isArray(search?.guests?.roomGuests) &&
    search.guests.roomGuests.length
  ) {
    return search.guests.roomGuests.map((room) => {
      const ages = room.childAges || room.ChildAges || room.ChildrenAges || [];

      return {
        adults: Number(room.adults || room.Adults || 1),
        children: Number(room.children || room.Children || 0),
        childAges: Array.isArray(ages) ? ages.map(Number) : [],
      };
    });
  }

  const roomCount = Number(search?.guests?.rooms || 1);
  const totalAdults = Number(search?.guests?.adults || 1);
  const totalChildren = Number(search?.guests?.children || 0);
  const savedChildAges = Array.isArray(search?.guests?.childAges)
    ? search.guests.childAges
    : [];

  return Array.from({ length: roomCount }, (_, index) => {
    if (index === 0) {
      return {
        adults: totalAdults,
        children: totalChildren,
        childAges: savedChildAges.map(Number),
      };
    }

    return createRoom();
  });
};

const normalizeHotelSearchResponse = (payload) => {
  if (!payload) return {};
  if (Array.isArray(payload)) return { results: payload };

  const nestedData =
    payload?.data &&
      typeof payload.data === "object" &&
      !Array.isArray(payload.data)
      ? payload.data
      : null;

  if (!nestedData) return payload;

  return {
    ...payload,
    ...nestedData,
    results:
      nestedData.results ||
      nestedData.HotelResult ||
      nestedData.hotels ||
      payload.results ||
      payload.HotelResult ||
      payload.hotels ||
      [],
  };
};

const HotelsForm = () => {
  const navigate = useNavigate();

  const { search, setHotels, setSearch, setLoading, setError, resetFlow } =
    useHotelStore();

  const today = new Date().toLocaleDateString("en-CA");

  const [loading, setLocalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [cityInput, setCityInput] = useState(
    search?.hotelName || search?.cityName || ""
  );

  const [citySuggestions, setCitySuggestions] = useState([]);

  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const [hotelSuggestionsLoading, setHotelSuggestionsLoading] =
    useState(false);


  const [destinationOpen, setDestinationOpen] = useState(false);

  const [nationalityInput, setNationalityInput] = useState(
    search?.nationalityName || INDIA_NATIONALITY.Name,
  );
  const [nationalitySuggestions, setNationalitySuggestions] = useState([]);
  const [guestOpen, setGuestOpen] = useState(false);

  const cityRef = useRef(null);
  const nationalityRef = useRef(null);
  const guestRef = useRef(null);

  const [formData, setFormData] = useState({
    city: search?.city || "",
    cityName: search?.cityName || "",
    cityCountry: search?.cityCountry || "",

    // selected hotel
    hotelCode: search?.hotelCode || "",
    hotelName: search?.hotelName || "",


    nationality: search?.nationality || INDIA_NATIONALITY.Code,
    nationalityName: search?.nationalityName || INDIA_NATIONALITY.Name,
    checkIn: search?.checkIn || "",
    checkOut: search?.checkOut || "",
  });

  const [rooms, setRooms] = useState(() => getInitialRooms(search));

  const isInternationalHotelSearch = useMemo(() => {
    return isInternationalDestination(
      formData.cityName || cityInput,
      formData.cityCountry,
    );
  }, [formData.cityName, formData.cityCountry, cityInput]);

  const guests = useMemo(() => {
    const adults = rooms.reduce(
      (sum, room) => sum + Number(room.adults || 0),
      0,
    );

    const children = rooms.reduce(
      (sum, room) => sum + Number(room.children || 0),
      0,
    );

    const childAges = rooms.flatMap((room) =>
      (room.childAges || [])
        .slice(0, Number(room.children || 0))
        .map((age) => Number(age)),
    );

    const roomGuests = rooms.map((room, index) => ({
      roomIndex: index + 1,
      adults: Number(room.adults || 1),
      children: Number(room.children || 0),
      childAges: (room.childAges || [])
        .slice(0, Number(room.children || 0))
        .map((age) => Number(age)),
    }));

    return {
      adults,
      children,
      rooms: rooms.length,
      childAges,
      roomGuests,
    };
  }, [rooms]);

  const totalGuests = guests.adults + guests.children;

  useEffect(() => {
    const handleClick = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCitySuggestions([]);
        setHotelSuggestions([]);
        setDestinationOpen(false);
      }

      if (
        nationalityRef.current &&
        !nationalityRef.current.contains(e.target)
      ) {
        setNationalitySuggestions([]);
      }

      if (guestRef.current && !guestRef.current.contains(e.target)) {
        setGuestOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!isInternationalHotelSearch) return;

    setFormData((prev) => ({
      ...prev,
      nationality: INDIA_NATIONALITY.Code,
      nationalityName: INDIA_NATIONALITY.Name,
    }));

    setNationalityInput(INDIA_NATIONALITY.Name);
    setNationalitySuggestions([]);
  }, [isInternationalHotelSearch]);

  useEffect(() => {
    const finalNationality = isInternationalHotelSearch
      ? INDIA_NATIONALITY.Code
      : formData.nationality;

    const finalNationalityName = isInternationalHotelSearch
      ? INDIA_NATIONALITY.Name
      : formData.nationalityName;

    setSearch({
      ...formData,
      nationality: finalNationality,
      nationalityName: finalNationalityName,
      guests,
      currency: "INR",
      responseTime: RESPONSE_TIME_SECONDS,
      parallelSearch: true,
      hotelCodesPerRequest: HOTEL_CODES_PER_REQUEST,
      isInternationalHotelSearch,
    });
  }, [formData, guests, setSearch, isInternationalHotelSearch]);

  const searchCities = (query) => {
    if (!query) return [];

    const q = normalizeText(query);

    return cityData.cities
      .filter((city) => {
        const name = normalizeText(getCityName(city));
        const code = normalizeText(getCityCode(city));
        const country = normalizeText(getCityCountry(city));

        return name.includes(q) || code.includes(q) || country.includes(q);
      })
      .slice(0, 10);
  };



  useEffect(() => {
    const query = cityInput.trim();

    // Hotel already selected
    if (
      formData.hotelCode &&
      normalizeText(query) === normalizeText(formData.hotelName)
    ) {
      setHotelSuggestions([]);
      setHotelSuggestionsLoading(false);
      return;
    }

    // City already selected
    if (
      !formData.hotelCode &&
      formData.city &&
      normalizeText(query) === normalizeText(formData.cityName)
    ) {
      setHotelSuggestions([]);
      setHotelSuggestionsLoading(false);
      return;
    }

    // Minimum 2 characters
    if (query.length < 2) {
      setHotelSuggestions([]);
      setHotelSuggestionsLoading(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setHotelSuggestionsLoading(true);

        const response = await publicApi.get(
          "/api/hotels/hotel-suggestions/",
          {
            params: {
              q: query,
            },
          }
        );

        if (cancelled) return;

        const results = Array.isArray(response?.data?.results)
          ? response.data.results
          : [];

        setHotelSuggestions(results);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "HOTEL SUGGESTION ERROR:",
            error?.response?.data || error
          );

          setHotelSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setHotelSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    cityInput,
    formData.city,
    formData.cityName,
    formData.hotelCode,
    formData.hotelName,
  ]);

  const searchNationalities = (query) => {
    if (!query) return [];

    if (isInternationalHotelSearch) {
      return [INDIA_NATIONALITY];
    }

    const q = normalizeText(query);

    return countryData.CountryList.filter(
      (country) =>
        normalizeText(country.Name).includes(q) ||
        normalizeText(country.Code).includes(q),
    ).slice(0, 10);
  };

  const updateRoomValue = (roomIndex, field, action) => {
    setRooms((prev) => {
      const updatedRooms = [...prev];
      const currentRoom = { ...updatedRooms[roomIndex] };

      if (field === "adults") {
        const nextAdults =
          action === "inc" ? currentRoom.adults + 1 : currentRoom.adults - 1;

        currentRoom.adults = Math.min(
          MAX_ADULTS_PER_ROOM,
          Math.max(1, nextAdults),
        );
      }

      if (field === "children") {
        const nextChildren =
          action === "inc"
            ? currentRoom.children + 1
            : currentRoom.children - 1;

        const finalChildren = Math.min(
          MAX_CHILDREN_PER_ROOM,
          Math.max(0, nextChildren),
        );

        currentRoom.children = finalChildren;

        currentRoom.childAges = Array.from(
          { length: finalChildren },
          (_, index) => {
            const existingAge = Number(currentRoom.childAges?.[index]);

            return existingAge >= MIN_CHILD_AGE && existingAge <= MAX_CHILD_AGE
              ? existingAge
              : "";
          },
        );
      }

      updatedRooms[roomIndex] = currentRoom;
      return updatedRooms;
    });
  };

  const updateChildAge = (roomIndex, childIndex, value) => {
    const age = Number(value);

    setRooms((prev) => {
      const updatedRooms = [...prev];
      const currentRoom = { ...updatedRooms[roomIndex] };
      const childAges = [...(currentRoom.childAges || [])];

      childAges[childIndex] =
        age >= MIN_CHILD_AGE && age <= MAX_CHILD_AGE ? age : "";

      currentRoom.childAges = childAges;
      updatedRooms[roomIndex] = currentRoom;

      return updatedRooms;
    });
  };

  const addRoom = () => {
    setRooms((prev) => {
      if (prev.length >= MAX_ROOMS) return prev;
      return [...prev, createRoom()];
    });
  };

  const removeRoom = (roomIndex) => {
    setRooms((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, index) => index !== roomIndex);
    });
  };

  const validateSearch = (data = formData) => {
    if (!data.city || !data.cityName) {
      setErrorMsg("Please select a city or hotel from the dropdown");
      return false;
    }

    if (!data.nationality) {
      setErrorMsg("Please select nationality");
      return false;
    }

    if (isInternationalHotelSearch && data.nationality !== "IN") {
      setErrorMsg(
        "For international hotel search, only Indian nationality is allowed.",
      );
      return false;
    }

    if (!data.checkIn || !data.checkOut) {
      setErrorMsg("Select dates");
      return false;
    }

    if (data.checkOut <= data.checkIn) {
      setErrorMsg("Invalid dates");
      return false;
    }

    if (rooms.length > MAX_ROOMS) {
      setErrorMsg("Maximum 6 rooms allowed per search");
      return false;
    }

    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
      const room = rooms[roomIndex];

      if (room.adults < 1 || room.adults > MAX_ADULTS_PER_ROOM) {
        setErrorMsg(`Room ${roomIndex + 1}: adults must be between 1 and 8`);
        return false;
      }

      if (room.children > MAX_CHILDREN_PER_ROOM) {
        setErrorMsg(`Room ${roomIndex + 1}: maximum 4 children allowed`);
        return false;
      }

      for (let childIndex = 0; childIndex < room.children; childIndex++) {
        const age = Number(room.childAges?.[childIndex]);

        if (!age || age < MIN_CHILD_AGE || age > MAX_CHILD_AGE) {
          setErrorMsg(
            `Room ${roomIndex + 1}: enter valid child ${childIndex + 1
            } age between 1 and 12`,
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const finalNationality = isInternationalHotelSearch
      ? INDIA_NATIONALITY.Code
      : formData.nationality;

    const finalNationalityName = isInternationalHotelSearch
      ? INDIA_NATIONALITY.Name
      : formData.nationalityName;

    const finalFormData = {
      ...formData,
      nationality: finalNationality,
      nationalityName: finalNationalityName,
    };

    if (!validateSearch(finalFormData)) return;

    const roomGuests = rooms.map((room, index) => {
      const childAges = (room.childAges || [])
        .slice(0, Number(room.children || 0))
        .map((age) => Number(age));

      return {
        RoomIndex: index + 1,
        Adults: Number(room.adults),
        Children: Number(room.children),
        ChildAges: childAges,
        ChildrenAges: childAges,
      };
    });

    const flatChildAges = roomGuests.flatMap((room) => room.ChildAges);

    const paxRooms = roomGuests.map((room) => ({
      Adults: room.Adults,
      Children: room.Children,
      ChildrenAges: room.ChildrenAges,
    }));

    const searchPayload = {
      ...finalFormData,
      guests: {
        adults: guests.adults,
        children: guests.children,
        rooms: guests.rooms,
        childAges: flatChildAges,
        roomGuests,
      },
      currency: "INR",
      nationality: finalNationality,
      nationalityName: finalNationalityName,
      isInternationalHotelSearch,
      parallelSearch: true,
      hotelCodesPerRequest: HOTEL_CODES_PER_REQUEST,
      maxRoomsAllowed: MAX_ROOMS,
      maxAdultsPerRoom: MAX_ADULTS_PER_ROOM,
      maxChildrenPerRoom: MAX_CHILDREN_PER_ROOM,
      childAgeAllowed: "1-12",
      responseTime: RESPONSE_TIME_SECONDS,
      useFilters: true,
      showAllHotelFeed: true,
      showAllRoomFeed: true,
      exactPriceOnly: true,
      showInclusion: true,
      showMealType: true,
      showCancellationPolicy: true,
      showRateConditions: true,
      showAmenities: true,
      showRoomPromotions: true,
      showSupplements: true,
    };

    const baseApiParams = {
      city: finalFormData.city,

      ...(finalFormData.hotelCode
        ? {
          hotel_code: finalFormData.hotelCode,
        }
        : {}),

      checkin: finalFormData.checkIn,
      checkout: finalFormData.checkOut,
      nationality: finalNationality,
      GuestNationality: finalNationality,
      currency: "INR",
      pax_rooms: JSON.stringify(paxRooms),

      // Backend pagination
      page: 1,
      page_size: HOTEL_PAGE_SIZE,
    };

    const domesticApiParams = {
      ...baseApiParams,

      cityName: finalFormData.cityName,

      adults: guests.adults,
      children: guests.children,
      rooms: guests.rooms,

      roomGuests: JSON.stringify(roomGuests),

      PaxRooms: JSON.stringify(paxRooms),
      paxRooms: JSON.stringify(paxRooms),

      childAges: flatChildAges.join(","),
      ChildAges: flatChildAges.join(","),
      ChildrenAges: flatChildAges.join(","),

      responseTime: RESPONSE_TIME_SECONDS,
      parallelSearch: true,
      hotelCodesPerRequest: HOTEL_CODES_PER_REQUEST,

      useFilters: true,
      showAllHotelFeed: true,
      showAllRoomFeed: true,
      exactPriceOnly: true,
      showInclusion: true,
      showMealType: true,
      showCancellationPolicy: true,
      showRateConditions: true,
      showAmenities: true,
      showRoomPromotions: true,
      showSupplements: true,
    };

    const apiParams = isInternationalHotelSearch
      ? baseApiParams
      : domesticApiParams;

    /*
     * Store the exact request used for page 1.
     * HotelResults will reuse these params and only change page/page_size.
     */
    const paginatedSearchPayload = {
      ...searchPayload,
      requestParams: apiParams,
      requestEndpoint: HOTEL_SEARCH_ENDPOINT,
      requestMethod: "get",
      page: 1,
      pageSize: HOTEL_PAGE_SIZE,
    };

    try {
      resetFlow();
      setLocalLoading(true);
      setLoading(true);
      setError("");

      setSearch(paginatedSearchPayload);
      localStorage.setItem(
        "hotelSearchPayload",
        JSON.stringify(paginatedSearchPayload),
      );

      console.log("FINAL HOTEL SEARCH PARAMS:", apiParams);

      const res = await publicApi.get(HOTEL_SEARCH_ENDPOINT, {
        params: apiParams,
      });

      console.log("HOTEL SEARCH RESPONSE:", res.data);

      /*
       * Support both response shapes:
       * 1. { count, page, total_pages, results }
       * 2. { data: { count, page, total_pages, results } }
       */
      const hotelResponse = normalizeHotelSearchResponse(res.data);

      const hotelsData =
        hotelResponse?.HotelResult ||
        hotelResponse?.results ||
        hotelResponse?.hotels ||
        [];

      if (!Array.isArray(hotelsData) || hotelsData.length === 0) {
        const tboMessage =
          res.data?.Error?.ErrorMessage ||
          res.data?.data?.Error?.ErrorMessage ||
          res.data?.message ||
          res.data?.error ||
          "No hotels found for this destination.";

        setErrorMsg(tboMessage);
        return;
      }

      /*
       * Keep the complete response object. Do not store only hotelsData,
       * otherwise total_pages/count/has_next will be lost.
       */
      /*
       * Store the complete response directly so pagination metadata cannot
       * be stripped by custom Zustand setter logic.
       */
      useHotelStore.setState({
        search: paginatedSearchPayload,
        hotels: hotelResponse,
      });

      console.log("PAGINATION STORED:", {
        count: hotelResponse?.count,
        page: hotelResponse?.page,
        pageSize: hotelResponse?.page_size,
        totalPages: hotelResponse?.total_pages,
        hasNext: hotelResponse?.has_next,
      });

      navigate("/hotels/results");
    } catch (err) {
      console.error("HOTEL SEARCH ERROR:", err?.response?.data || err);

      const isNetworkError = err?.code === "ERR_NETWORK";

      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.Error?.ErrorMessage ||
        err?.response?.data?.data?.Error?.ErrorMessage ||
        err?.message ||
        "Hotel search failed. Please try again.";

      setError(err?.response?.data || apiMessage);

      setErrorMsg(
        isNetworkError
          ? "Hotel search failed from server. Please check backend international hotel search handling."
          : apiMessage,
      );
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[210px] flex-col justify-center overflow-visible rounded-2xl border border-white/10 bg-[#07111c]/10 p-3 shadow-2xl backdrop-blur-none space-y-3 sm:min-h-[220px] sm:p-4 md:min-h-[235px] md:p-5">
      {errorMsg && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 px-4 py-3 rounded-2xl text-center">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSearch}
        className="relative grid grid-cols-12 gap-2.5 overflow-visible sm:gap-3 md:gap-3 items-end"
      >
        <div className="relative z-40 col-span-12 min-w-0 w-full sm:col-span-6 md:col-span-3" ref={cityRef}>
          <label className="mb-1.5 block text-xs font-medium text-white/75">
            City / Hotel
          </label>

          <input
            type="text"
            placeholder="Search city or hotel"
            value={cityInput}
            autoComplete="off"
            spellCheck={false}

            onFocus={() => {
              setDestinationOpen(true);
            }}

            onChange={(e) => {
              const value = e.target.value;

              setDestinationOpen(true);
              setCityInput(value);

              // Previous selection clear
              setFormData((prev) => ({
                ...prev,
                city: "",
                cityName: "",
                cityCountry: "",
                hotelCode: "",
                hotelName: "",
              }));

              setCitySuggestions(searchCities(value));
            }}

            className="w-full h-11 px-3 rounded-xl text-sm text-white bg-white/[0.07] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl outline-none placeholder:text-white/55 transition hover:border-white/30 focus:border-[#E6B35C]/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#E6B35C]/15"
          />

          {destinationOpen &&
            (citySuggestions.length > 0 ||
              hotelSuggestions.length > 0 ||
              hotelSuggestionsLoading) && (
              <div className="absolute left-0 top-full z-[200] mt-2 max-h-72 w-full overflow-y-auto overscroll-contain rounded-xl border border-white/15 bg-[#0C1520]/98 p-1.5 text-white shadow-[0_22px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:min-w-[340px] md:min-w-[380px]">

                {/* CITY SUGGESTIONS */}
                {citySuggestions.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">
                      Cities
                    </div>

                    {citySuggestions.map((city, index) => {
                      const selectedCityName = getCityName(city);
                      const selectedCityCode = getCityCode(city);
                      const selectedCityCountry = getCityCountry(city);

                      const selectedIsInternational =
                        isInternationalDestination(
                          selectedCityName,
                          selectedCityCountry
                        );

                      return (
                        <button
                          type="button"
                          key={`city-${selectedCityCode}-${index}`}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,

                              city: selectedCityCode,
                              cityName: selectedCityName,
                              cityCountry: selectedCityCountry,

                              // City selected, so no hotel
                              hotelCode: "",
                              hotelName: "",

                              nationality: selectedIsInternational
                                ? INDIA_NATIONALITY.Code
                                : prev.nationality ||
                                INDIA_NATIONALITY.Code,

                              nationalityName: selectedIsInternational
                                ? INDIA_NATIONALITY.Name
                                : prev.nationalityName ||
                                INDIA_NATIONALITY.Name,
                            }));

                            setCityInput(selectedCityName);

                            setCitySuggestions([]);
                            setHotelSuggestions([]);

                            setDestinationOpen(false);

                            if (selectedIsInternational) {
                              setNationalityInput(
                                INDIA_NATIONALITY.Name
                              );

                              setNationalitySuggestions([]);
                            }
                          }}
                          className="w-full p-3 rounded-xl hover:bg-(--bg-secondary) cursor-pointer text-sm flex items-center justify-between gap-3 text-left transition"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span>📍</span>

                              <span className="truncate">
                                {selectedCityName}
                              </span>
                            </div>

                            <p className="text-[11px] text-(--text-muted) mt-1 ml-6">
                              City
                            </p>
                          </div>

                          <span className="text-xs text-(--text-muted) shrink-0">
                            {selectedCityCode}
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* DIVIDER */}
                {citySuggestions.length > 0 &&
                  (hotelSuggestions.length > 0 ||
                    hotelSuggestionsLoading) && (
                    <div className="border-t border-(--border-soft) my-1" />
                  )}

                {/* HOTEL SUGGESTIONS */}
                {(hotelSuggestions.length > 0 ||
                  hotelSuggestionsLoading) && (
                    <>
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">
                        Hotels
                      </div>

                      {hotelSuggestionsLoading && (
                        <div className="px-3 py-3 text-xs text-(--text-muted)">
                          Searching hotels...
                        </div>
                      )}

                      {!hotelSuggestionsLoading &&
                        hotelSuggestions.map((hotel) => (
                          <button
                            type="button"
                            key={`hotel-${hotel.hotel_code}`}
                            onClick={() => {
                              const selectedIsInternational =
                                hotel.country_code !== "IN";

                              setFormData((prev) => ({
                                ...prev,

                                // Hotel ka city automatically select
                                city: hotel.city_code,
                                cityName: hotel.city_name,
                                cityCountry:
                                  hotel.country_name || "",

                                hotelCode: hotel.hotel_code,
                                hotelName: hotel.hotel_name,

                                nationality: selectedIsInternational
                                  ? INDIA_NATIONALITY.Code
                                  : prev.nationality ||
                                  INDIA_NATIONALITY.Code,

                                nationalityName:
                                  selectedIsInternational
                                    ? INDIA_NATIONALITY.Name
                                    : prev.nationalityName ||
                                    INDIA_NATIONALITY.Name,
                              }));

                              // Input me hotel name show hoga
                              setCityInput(hotel.hotel_name);

                              setCitySuggestions([]);
                              setHotelSuggestions([]);
                              setDestinationOpen(false);

                              if (selectedIsInternational) {
                                setNationalityInput(
                                  INDIA_NATIONALITY.Name
                                );

                                setNationalitySuggestions([]);
                              }
                            }}
                            className="w-full p-3 rounded-xl hover:bg-(--bg-secondary) cursor-pointer text-sm text-left transition"
                          >
                            <div className="flex items-start gap-2">
                              <span>🏨</span>

                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">
                                  {hotel.hotel_name}
                                </p>

                                <p className="text-[11px] text-(--text-muted) mt-1 truncate">
                                  {hotel.city_name}

                                  {hotel.country_name
                                    ? `, ${hotel.country_name}`
                                    : ""}
                                </p>
                              </div>

                              <span className="text-[10px] text-(--gold-main) shrink-0">
                                Hotel
                              </span>
                            </div>
                          </button>
                        ))}
                    </>
                  )}
              </div>
            )}
        </div>

        <div className="relative z-30 col-span-12 min-w-0 w-full sm:col-span-6 md:col-span-3" ref={nationalityRef}>
          <label className="mb-1 block text-xs font-medium text-white/75">
            Nationality
          </label>

          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search nationality"
            value={nationalityInput}
            readOnly={isInternationalHotelSearch}
            onFocus={() => {
              if (isInternationalHotelSearch) {
                setNationalityInput(INDIA_NATIONALITY.Name);
                setNationalitySuggestions([INDIA_NATIONALITY]);

                setFormData((prev) => ({
                  ...prev,
                  nationality: INDIA_NATIONALITY.Code,
                  nationalityName: INDIA_NATIONALITY.Name,
                }));

                return;
              }

              if (nationalityInput) {
                setNationalitySuggestions(
                  searchNationalities(nationalityInput),
                );
              }
            }}
            onChange={(e) => {
              if (isInternationalHotelSearch) {
                setNationalityInput(INDIA_NATIONALITY.Name);
                setNationalitySuggestions([INDIA_NATIONALITY]);

                setFormData((prev) => ({
                  ...prev,
                  nationality: INDIA_NATIONALITY.Code,
                  nationalityName: INDIA_NATIONALITY.Name,
                }));

                return;
              }

              const value = e.target.value;

              setNationalityInput(value);
              setFormData((prev) => ({
                ...prev,
                nationality: "",
                nationalityName: "",
              }));
              setNationalitySuggestions(searchNationalities(value));
            }}
            className={`w-full h-11 px-3 rounded-xl text-sm text-white bg-white/[0.07] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl outline-none placeholder:text-white/55 transition hover:border-white/30 focus:border-[#E6B35C]/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#E6B35C]/15 ${isInternationalHotelSearch ? "cursor-not-allowed opacity-70" : ""}`}
          />

          {isInternationalHotelSearch && (
            <p className="mt-1 text-[11px] text-(--gold-main) text-center">
              For international hotel search, only Indian nationality is
              allowed.
            </p>
          )}

          {nationalitySuggestions.length > 0 && (
            <div className="absolute left-0 top-full z-[200] mt-2 max-h-64 w-full overflow-y-auto overscroll-contain rounded-xl border border-white/15 bg-[#0C1520]/98 p-1.5 text-white shadow-[0_22px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl">
              {nationalitySuggestions.map((country) => (
                <button
                  type="button"
                  key={country.Code}
                  onClick={() => {
                    if (isInternationalHotelSearch) {
                      setFormData((prev) => ({
                        ...prev,
                        nationality: INDIA_NATIONALITY.Code,
                        nationalityName: INDIA_NATIONALITY.Name,
                      }));

                      setNationalityInput(INDIA_NATIONALITY.Name);
                      setNationalitySuggestions([]);
                      return;
                    }

                    setFormData((prev) => ({
                      ...prev,
                      nationality: country.Code,
                      nationalityName: country.Name,
                    }));

                    setNationalityInput(country.Name);
                    setNationalitySuggestions([]);
                  }}
                  className="w-full p-3 rounded-xl hover:bg-(--bg-secondary) cursor-pointer text-sm flex items-center justify-between text-left transition"
                >
                  <span>{country.Name}</span>
                  <span className="text-xs text-(--text-muted)">
                    {country.Code}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 grid grid-cols-2 gap-2 min-w-0 md:col-span-4 md:gap-3 w-full">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/75">
              Check-in
            </label>

            <input
              type="date"
              min={today}
              value={formData.checkIn}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  checkIn: e.target.value,
                }))
              }
              className="hotel-date-input w-full min-w-0 h-11 px-3 pr-10 rounded-xl text-sm text-white bg-white/[0.07] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl outline-none transition hover:border-white/30 focus:border-[#E6B35C]/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#E6B35C]/15"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/75">
              Check-out
            </label>

            <input
              type="date"
              min={formData.checkIn || today}
              value={formData.checkOut}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  checkOut: e.target.value,
                }))
              }
              className="hotel-date-input w-full min-w-0 h-11 px-3 pr-10 rounded-xl text-sm text-white bg-white/[0.07] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl outline-none transition hover:border-white/30 focus:border-[#E6B35C]/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#E6B35C]/15"
            />
          </div>
        </div>

        <div className="relative col-span-12 min-w-0 sm:col-span-6 md:col-span-2 w-full" ref={guestRef}>
          <label className="mb-1 block text-xs font-medium text-white/75">
            Guests
          </label>

          <button
            type="button"
            onClick={() => setGuestOpen(true)}
            className="w-full h-11 px-3 rounded-xl text-sm text-white bg-white/[0.07] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl text-left flex items-center justify-between gap-2 transition hover:border-[#E6B35C]/60 hover:bg-white/[0.09] focus:ring-2 focus:ring-[#E6B35C]/15"
          >
            <span className="truncate">
              {totalGuests} Guest{totalGuests > 1 && "s"} · {guests.rooms} Room
              {guests.rooms > 1 && "s"}
            </span>

            <span className="text-(--gold-main)">▾</span>
          </button>

          {guestOpen && (
            <>
              <div
                className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
                onClick={() => setGuestOpen(false)}
              />

              <div
                className="fixed z-[9999] left-1/2 top-1/2 flex w-[calc(100vw-24px)] max-w-2xl max-h-[calc(100svh-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101721]/95 shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:w-[calc(100vw-40px)] sm:rounded-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="shrink-0 border-b border-white/10 bg-[#101721]/95 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-(--text-main)">
                        Rooms & Guests
                      </h3>

                      <p className="mt-1 text-xs text-(--text-muted)">
                        Add rooms, adults, children and child age.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGuestOpen(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-sm font-bold text-white/80 transition hover:border-[#E6B35C]/60 hover:bg-white/[0.10] hover:text-[#E6B35C]"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-center">
                      <p className="text-[10px] uppercase tracking-wide text-(--text-muted)">
                        Adults
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-(--gold-main)">
                        {guests.adults}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-center">
                      <p className="text-[10px] uppercase tracking-wide text-(--text-muted)">
                        Children
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-(--gold-main)">
                        {guests.children}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-center">
                      <p className="text-[10px] uppercase tracking-wide text-(--text-muted)">
                        Rooms
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-(--gold-main)">
                        {guests.rooms}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                  {rooms.map((room, roomIndex) => (
                    <div
                      key={roomIndex}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 space-y-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-(--text-main)">
                            Room {roomIndex + 1}
                          </p>

                          <p className="text-xs text-(--text-muted)">
                            {room.adults} Adult{room.adults > 1 && "s"} ·{" "}
                            {room.children} Child
                            {room.children !== 1 && "ren"}
                          </p>
                        </div>

                        {rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoom(roomIndex)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-(--bg-card) border border-(--border-soft) p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-(--text-main)">
                                Adults
                              </p>
                              <p className="text-xs text-(--text-muted)">
                                Age 12+
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRoomValue(roomIndex, "adults", "dec")
                                }
                                disabled={room.adults <= 1}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-base font-bold text-white transition hover:border-[#E6B35C]/60 hover:bg-white/[0.10] hover:text-[#E6B35C] disabled:cursor-not-allowed disabled:text-white/35 disabled:opacity-60"
                              >
                                -
                              </button>

                              <span className="min-w-6 text-center font-bold text-white">
                                {room.adults}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateRoomValue(roomIndex, "adults", "inc")
                                }
                                disabled={room.adults >= MAX_ADULTS_PER_ROOM}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-base font-bold text-white transition hover:border-[#E6B35C]/60 hover:bg-white/[0.10] hover:text-[#E6B35C] disabled:cursor-not-allowed disabled:text-white/35 disabled:opacity-60"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-(--bg-card) border border-(--border-soft) p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-(--text-main)">
                                Children
                              </p>
                              <p className="text-xs text-(--text-muted)">
                                Age 1 - 12
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRoomValue(roomIndex, "children", "dec")
                                }
                                disabled={room.children <= 0}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-base font-bold text-white transition hover:border-[#E6B35C]/60 hover:bg-white/[0.10] hover:text-[#E6B35C] disabled:cursor-not-allowed disabled:text-white/35 disabled:opacity-60"
                              >
                                -
                              </button>

                              <span className="min-w-6 text-center font-bold text-white">
                                {room.children}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateRoomValue(roomIndex, "children", "inc")
                                }
                                disabled={
                                  room.children >= MAX_CHILDREN_PER_ROOM
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-base font-bold text-white transition hover:border-[#E6B35C]/60 hover:bg-white/[0.10] hover:text-[#E6B35C] disabled:cursor-not-allowed disabled:text-white/35 disabled:opacity-60"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {room.children > 0 && (
                        <div className="rounded-2xl bg-(--bg-card) border border-(--border-soft) p-3">
                          <p className="text-xs font-semibold text-(--text-muted) mb-3">
                            Child age is required
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Array.from({ length: room.children }).map(
                              (_, childIndex) => (
                                <div key={childIndex}>
                                  <label className="text-[11px] text-(--text-muted)">
                                    Child {childIndex + 1}
                                  </label>

                                  <input
                                    type="number"
                                    min={MIN_CHILD_AGE}
                                    max={MAX_CHILD_AGE}
                                    value={room.childAges?.[childIndex] || ""}
                                    onChange={(e) =>
                                      updateChildAge(
                                        roomIndex,
                                        childIndex,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="1-12"
                                    className="w-full mt-1 h-10 px-3 rounded-xl text-sm text-white bg-white/[0.06] border border-white/15 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition placeholder:text-white/40 focus:border-[#E6B35C]/70 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#E6B35C]/15"
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="shrink-0 border-t border-white/10 bg-[#101721]/95 p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={addRoom}
                      disabled={rooms.length >= MAX_ROOMS}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.06] py-3 text-sm font-semibold text-white/90 transition hover:border-[#E6B35C]/60 hover:bg-white/[0.10] hover:text-[#E6B35C] disabled:cursor-not-allowed disabled:text-white/35 disabled:opacity-50"
                    >
                      + Add Room
                    </button>

                    <button
                      type="button"
                      onClick={() => setGuestOpen(false)}
                      className="w-full py-3 rounded-2xl bg-linear-to-r from-start to-end text-black text-sm font-bold hover:scale-[1.01] active:scale-[0.98] transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="col-span-12 flex justify-center pt-1 md:col-span-12">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-52 md:w-60 xl:w-64 px-4 py-2.5 rounded-xl font-semibold text-sm text-black bg-linear-to-r from-start to-end transition hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />

                <span>Searching Hotels...</span>
              </>
            ) : (
              <span>Search Hotels</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelsForm;
