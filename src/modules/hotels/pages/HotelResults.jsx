import { useNavigate } from "react-router-dom";
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useHotelStore } from "../../../store/hotelStore";
import { publicApi } from "../../../services/api";
import SEO from "../../../components/SEO";

const FALLBACK_IMAGE = "https://api.flyinglyte.com/media/hotels/default.jpg";

const getFirstArray = (...values) => {
  return values.find((value) => Array.isArray(value)) || [];
};

const getRoomName = (room = {}) => {
  if (room.room_name) return room.room_name;
  if (room.RoomTypeName) return room.RoomTypeName;

  const name = room.Name || room.name;

  if (Array.isArray(name)) return name[0] || "Standard Room";
  if (typeof name === "string") return name;

  return "Standard Room";
};

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const isValidImage = (url) => {
  if (!url || typeof url !== "string") return false;

  const cleanUrl = url.trim();

  return (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://") ||
    cleanUrl.startsWith("/")
  );
};

const getImageUrl = (img) => {
  if (!img) return "";

  if (typeof img === "string") {
    return isValidImage(img) ? img.trim() : "";
  }

  if (typeof img === "object") {
    const url =
      img.url ||
      img.Url ||
      img.image ||
      img.Image ||
      img.ImageUrl ||
      img.ImageURL ||
      img.HotelPicture ||
      img.HotelPictureUrl ||
      img.HotelPictureURL ||
      img.ThumbImage ||
      img.MainImage ||
      img.path ||
      img.Path ||
      "";

    return isValidImage(url) ? url.trim() : "";
  }

  return "";
};

const getHotelImages = (hotel = {}, rawHotel = {}) => {
  const directImages = [
    hotel.image,
    hotel.Image,
    hotel.hotel_image,
    hotel.HotelImage,
    hotel.HotelPicture,
    hotel.HotelPictureUrl,
    hotel.HotelPictureURL,
    hotel.ThumbImage,
    hotel.thumbnail,
    hotel.Thumbnail,
    hotel.MainImage,
    hotel.main_image,

    rawHotel.image,
    rawHotel.Image,
    rawHotel.hotel_image,
    rawHotel.HotelImage,
    rawHotel.HotelPicture,
    rawHotel.HotelPictureUrl,
    rawHotel.HotelPictureURL,
    rawHotel.ThumbImage,
    rawHotel.thumbnail,
    rawHotel.Thumbnail,
    rawHotel.MainImage,
    rawHotel.main_image,
  ]
    .map(getImageUrl)
    .filter(Boolean);

  const imageArrays = [
    hotel.images,
    hotel.Images,
    hotel.HotelImages,
    hotel.HotelPictures,
    hotel.hotel_images,
    hotel.Pictures,
    hotel.Gallery,

    rawHotel.images,
    rawHotel.Images,
    rawHotel.HotelImages,
    rawHotel.HotelPictures,
    rawHotel.hotel_images,
    rawHotel.Pictures,
    rawHotel.Gallery,
  ];

  const arrayImages = imageArrays
    .flatMap((arr) => (Array.isArray(arr) ? arr : []))
    .map(getImageUrl)
    .filter(Boolean);

  const finalImages = Array.from(
    new Set([...directImages, ...arrayImages]),
  ).filter(Boolean);

  return {
    image: finalImages[0] || FALLBACK_IMAGE,
    images: finalImages.length > 0 ? finalImages : [FALLBACK_IMAGE],
    has_image: finalImages.length > 0,
  };
};

const normalizeRoom = (room = {}, index = 0) => {
  const rawRoom = room.room_raw || room;

  const bookingCode =
    room.booking_code || room.BookingCode || rawRoom?.BookingCode || null;

  const price = Number(
    room.price ?? room.TotalFare ?? room.MinPrice ?? rawRoom?.TotalFare ?? 0,
  );

  const tax = Number(
    room.tax ?? room.TotalTax ?? room.Price?.Tax ?? rawRoom?.TotalTax ?? 0,
  );

  return {
    id: `${bookingCode || index}`,
    room_name: getRoomName(room),

    price: Number.isFinite(price) ? price : 0,
    tax: Number.isFinite(tax) ? tax : 0,

    published_price:
      room.published_price ??
      room.PublishedPrice ??
      room.Price?.PublishedPrice ??
      rawRoom?.PublishedPrice ??
      null,

    offered_price:
      room.offered_price ??
      room.OfferedPrice ??
      room.Price?.OfferedPrice ??
      rawRoom?.OfferedPrice ??
      null,

    currency: room.currency || room.Currency || rawRoom?.Currency || "INR",

    meal:
      room.meal ||
      room.MealType ||
      room.MealPlan ||
      rawRoom?.MealType ||
      rawRoom?.MealPlan ||
      "",

    refundable:
      room.refundable ?? room.IsRefundable ?? rawRoom?.IsRefundable ?? false,

    inclusion: room.inclusion || room.Inclusion || rawRoom?.Inclusion || "",

    room_promotion:
      room.room_promotion || room.RoomPromotion || rawRoom?.RoomPromotion || [],

    cancel_policies:
      room.cancel_policies ||
      room.CancelPolicies ||
      rawRoom?.CancelPolicies ||
      [],

    rate_conditions:
      room.rate_conditions ||
      room.RateConditions ||
      rawRoom?.RateConditions ||
      [],

    supplements:
      room.supplements || room.Supplements || rawRoom?.Supplements || [],

    amenities: room.amenities || room.Amenities || rawRoom?.Amenities || [],

    booking_code: bookingCode,
    BookingCode: bookingCode,

    room_raw: rawRoom,
  };
};

const normalizeHotel = (hotel = {}) => {
  const rawHotel = hotel.rawHotel || hotel.hotel_raw || hotel;

  const rooms = getFirstArray(
    hotel.rooms,
    hotel.Rooms,
    hotel.hotel_raw?.Rooms,
    hotel.rawHotel?.Rooms,
    rawHotel?.Rooms,
    hotel.HotelRooms,
  ).map(normalizeRoom);

  const fallbackRoom = normalizeRoom(
    {
      BookingCode:
        hotel.booking_code || hotel.BookingCode || rawHotel?.BookingCode || "",
      Name:
        hotel.room ||
        hotel.RoomTypeName ||
        rawHotel?.RoomTypeName ||
        "Standard Room",
      TotalFare:
        hotel.price || hotel.Price?.PublishedPrice || hotel.MinPrice || 0,
      TotalTax: hotel.tax || hotel.Price?.Tax || 0,
      MealType: hotel.meal || hotel.MealType || "",
      IsRefundable: hotel.refundable ?? hotel.IsRefundable ?? false,
      Inclusion: hotel.inclusion || hotel.Inclusion || "",
    },
    0,
  );

  const cheapestRoom =
    rooms.length > 0
      ? [...rooms].sort((a, b) => Number(a.price) - Number(b.price))[0]
      : fallbackRoom;

  const hotelImages = getHotelImages(hotel, rawHotel);

  return {
    hotel_code:
      hotel.hotel_code ||
      hotel.HotelCode ||
      rawHotel?.HotelCode ||
      hotel.code ||
      "",

    HotelCode:
      hotel.hotel_code ||
      hotel.HotelCode ||
      rawHotel?.HotelCode ||
      hotel.code ||
      "",

    hotel_name:
      hotel.hotel_name ||
      hotel.HotelName ||
      rawHotel?.HotelName ||
      hotel.name ||
      "Hotel",

    HotelName:
      hotel.hotel_name ||
      hotel.HotelName ||
      rawHotel?.HotelName ||
      hotel.name ||
      "Hotel",

    ...hotelImages,

    rating: Number(
      hotel.rating ||
      hotel.StarRating ||
      rawHotel?.StarRating ||
      hotel.star_rating ||
      4,
    ),

    rooms,
    room_count: Number(hotel.room_count || rooms.length || 0),
    raw_room_count: Number(hotel.raw_room_count || rooms.length || 0),

    api_child_ages: Array.isArray(hotel.child_ages)
      ? hotel.child_ages
      : Array.isArray(rawHotel?.child_ages)
        ? rawHotel.child_ages
        : [],

    pax_rooms: Array.isArray(hotel.pax_rooms)
      ? hotel.pax_rooms
      : Array.isArray(rawHotel?.pax_rooms)
        ? rawHotel.pax_rooms
        : [],

    selected_room: cheapestRoom,

    price: cheapestRoom?.price || 0,
    tax: cheapestRoom?.tax || 0,
    meal: cheapestRoom?.meal || "",
    refundable: cheapestRoom?.refundable || false,
    inclusion: cheapestRoom?.inclusion || "",
    booking_code: cheapestRoom?.booking_code || null,
    BookingCode: cheapestRoom?.booking_code || null,

    currency:
      hotel.currency ||
      hotel.Currency ||
      rawHotel?.Currency ||
      cheapestRoom?.currency ||
      "INR",

    rawHotel,
    hotel_raw: rawHotel,
  };
};

const getRoomBadges = (room) => {
  if (!room) return [];

  const badges = [];

  if (room.meal) {
    badges.push({
      label: String(room.meal).replaceAll("_", " "),
      className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    });
  }

  badges.push({
    label: room.refundable ? "Refundable" : "Non-refundable",
    className: room.refundable
      ? "bg-green-500/10 text-green-300 border-green-500/20"
      : "bg-red-500/10 text-red-300 border-red-500/20",
  });

  const getRoomBadges = (room) => {
    if (!room) return [];

    const badges = [];

    if (room.meal) {
      badges.push({
        label: String(room.meal).replaceAll("_", " "),
        className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      });
    }

    badges.push({
      label: room.refundable ? "Refundable" : "Non-refundable",
      className: room.refundable
        ? "bg-green-500/10 text-green-300 border-green-500/20"
        : "bg-red-500/10 text-red-300 border-red-500/20",
    });

    if (
      Array.isArray(room.cancel_policies) &&
      room.cancel_policies.length > 0
    ) {
      badges.push({
        label: "Cancellation policy",
        className:
          "bg-purple-500/10 text-purple-300 border-purple-500/20",
      });
    }

    if (
      Array.isArray(room.rate_conditions) &&
      room.rate_conditions.length > 0
    ) {
      badges.push({
        label: "Rate conditions",
        className:
          "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      });
    }

    if (
      Array.isArray(room.room_promotion) &&
      room.room_promotion.length > 0
    ) {
      badges.push({
        label: "Promotion",
        className:
          "bg-orange-500/10 text-orange-300 border-orange-500/20",
      });
    }

    return badges;
  };

  if (Array.isArray(room.cancel_policies) && room.cancel_policies.length > 0) {
    badges.push({
      label: "Cancellation policy",
      className: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    });
  }

  if (Array.isArray(room.rate_conditions) && room.rate_conditions.length > 0) {
    badges.push({
      label: "Rate conditions",
      className: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    });
  }

  if (Array.isArray(room.room_promotion) && room.room_promotion.length > 0) {
    badges.push({
      label: "Promotion",
      className: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    });
  }

  return badges;
};

const getVisiblePageNumbers = (currentPage, totalPages) => {
  const maxVisible = 5;

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + maxVisible - 1);

  start = Math.max(1, end - maxVisible + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const HotelImageSlider = ({
  images = [],
  alt = "Hotel",
  autoPlay = false,
}) => {
  const slides = useMemo(() => {
    const cleanImages = (Array.isArray(images) ? images : [])
      .filter((image) => isValidImage(image))
      .filter((image, index, array) => array.indexOf(image) === index)
      .slice(0, 3);

    return cleanImages.length > 0 ? cleanImages : [FALLBACK_IMAGE];
  }, [images]);

  const [currentSlide, setCurrentSlide] = useState(0);


  useEffect(() => {
    setCurrentSlide((current) =>
      current >= slides.length ? 0 : current
    );
  }, [slides.length]);

  const touchStartX = useRef(null);
  const wasSwiped = useRef(false);

  /* ===============================
     AUTO SLIDE
  =============================== */

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const slider = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % slides.length);
    }, 1500);

    return () => clearInterval(slider);
  }, [autoPlay, slides.length]);
  /* ===============================
     PREVIOUS
  =============================== */

  const previousSlide = (e) => {
    e.stopPropagation();

    setCurrentSlide((previous) =>
      previous === 0 ? slides.length - 1 : previous - 1,
    );
  };

  /* ===============================
     NEXT
  =============================== */

  const nextSlide = (e) => {
    e.stopPropagation();

    setCurrentSlide((previous) => (previous + 1) % slides.length);
  };

  /* ===============================
     MOBILE SWIPE
  =============================== */

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
    wasSwiped.current = false;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || slides.length <= 1) return;

    const touchEndX =
      e.changedTouches?.[0]?.clientX ?? touchStartX.current;

    const difference = touchStartX.current - touchEndX;

    touchStartX.current = null;

    if (Math.abs(difference) < 40) return;

    wasSwiped.current = true;

    if (difference > 0) {
      setCurrentSlide((previous) => (previous + 1) % slides.length);
    } else {
      setCurrentSlide((previous) =>
        previous === 0 ? slides.length - 1 : previous - 1,
      );
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        /*
         * Normal image click = hotel details open.
         * Swipe ke baad accidental card click prevent hoga.
         */
        if (wasSwiped.current) {
          e.stopPropagation();
          wasSwiped.current = false;
        }
      }}
    >
      {/* IMAGES */}

      <div
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {slides.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`${alt} ${index + 1}`}
            className="w-full h-full object-cover shrink-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        ))}
      </div>

      {/* LEFT / RIGHT BUTTONS */}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous hotel image"
            onClick={previousSlide}
            className="
              absolute
              left-2
              top-1/2
              -translate-y-1/2
              z-20
              w-8 h-8
              rounded-full
              bg-black/60
              backdrop-blur-sm
              border border-white/20
              text-white
              flex items-center justify-center
              opacity-100
md:opacity-0
md:group-hover:opacity-100
              hover:bg-yellow-400
              hover:text-black
              transition
            "
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next hotel image"
            onClick={nextSlide}
            className="
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              z-20
              w-8 h-8
              rounded-full
              bg-black/60
              backdrop-blur-sm
              border border-white/20
              text-white
              flex items-center justify-center
              opacity-100
md:opacity-0
md:group-hover:opacity-100
              hover:bg-yellow-400
              hover:text-black
              transition
            "
          >
            ›
          </button>
        </>
      )}

      {/* DOTS */}

      {slides.length > 1 && (
        <div
          className="
            absolute
            bottom-3
            right-3
            z-20
            flex
            items-center
            gap-1.5
            bg-black/50
            backdrop-blur-sm
            px-2 py-1.5
            rounded-full
          "
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show hotel image ${index + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(index);
              }}
              className={`rounded-full transition-all ${currentSlide === index
                ? "w-5 h-1.5 bg-yellow-400"
                : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HotelResults = () => {
  const navigate = useNavigate();


  const { hotels, search, setSelectedHotel, setSelectedRoom, selectHotelRoom } =
    useHotelStore();

  const { city, cityName, checkIn, checkOut, guests } = search || {};

  const displayCity = cityName || city || "Destination";

  const totalGuests =
    Number(guests?.adults || 0) + Number(guests?.children || 0);

  const childAges = Array.isArray(guests?.childAges) ? guests.childAges : [];

  const hotelResponse = useMemo(() => {
    if (!hotels) return {};

    if (
      hotels?.data &&
      typeof hotels.data === "object" &&
      !Array.isArray(hotels.data)
    ) {
      return {
        ...hotels,
        ...hotels.data,
      };
    }

    return hotels;
  }, [hotels]);

  const hotelList = useMemo(() => {
    let list = [];

    if (Array.isArray(hotelResponse)) {
      list = hotelResponse;
    } else if (Array.isArray(hotelResponse?.results)) {
      list = hotelResponse.results;
    } else if (Array.isArray(hotelResponse?.HotelResult)) {
      list = hotelResponse.HotelResult;
    } else if (Array.isArray(hotelResponse?.hotels)) {
      list = hotelResponse.hotels;
    }

    return list.map(normalizeHotel);
  }, [hotelResponse]);

  const currentPage = Math.max(1, Number(hotelResponse?.page || 1));

  const pageSize = Math.max(1, Number(hotelResponse?.page_size || 20));

  const totalHotels = Math.max(
    0,
    Number(
      hotelResponse?.count ||
      hotelResponse?.total_tbo_hotels_found ||
      hotelList.length,
    ),
  );

  const totalPages = Math.max(
    1,
    Number(
      hotelResponse?.total_pages || Math.ceil(totalHotels / pageSize) || 1,
    ),
  );

  const hasNext = hotelResponse?.has_next ?? currentPage < totalPages;

  const hasPrevious = hotelResponse?.has_previous ?? currentPage > 1;

  const startHotelNumber =
    totalHotels === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endHotelNumber = Math.min(currentPage * pageSize, totalHotels);

  const visiblePageNumbers = useMemo(
    () => getVisiblePageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const [sort, setSort] = useState("price");
  const [hoveredHotelKey, setHoveredHotelKey] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [minRating, setMinRating] = useState(0);
  const [onlyRefundable, setOnlyRefundable] = useState(false);
  const [mealType, setMealType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(() => {
    if (typeof window === "undefined") return false;

    const savedSearch = localStorage.getItem("hotelSearchPayload");

    const currentHotels = useHotelStore.getState().hotels;

    const existingHotels = Array.isArray(currentHotels)
      ? currentHotels
      : currentHotels?.results ||
      currentHotels?.HotelResult ||
      currentHotels?.hotels ||
      currentHotels?.data?.results ||
      [];

    return (
      Boolean(savedSearch) &&
      (!Array.isArray(existingHotels) || existingHotels.length === 0)
    );
  });
  const [paginationError, setPaginationError] = useState("");
  const [hotelSearch, setHotelSearch] = useState("");
  const [selectedHotelCode, setSelectedHotelCode] = useState("");
  const [hotelDropdownOpen, setHotelDropdownOpen] = useState(false);
  const [hotelFilterLoading, setHotelFilterLoading] = useState(false);

  /*
   * Keep initial full hotel-name list separately.
   *
   * When selected hotel API returns only one hotel,
   * we don't want to lose the original 150 dropdown options.
   */
  const [allHotelOptions, setAllHotelOptions] = useState([]);
  useEffect(() => {
    const restoreHotelsAfterRefresh = async () => {
      const currentHotels = useHotelStore.getState().hotels;

      const existingHotels = Array.isArray(currentHotels)
        ? currentHotels
        : currentHotels?.results ||
        currentHotels?.HotelResult ||
        currentHotels?.hotels ||
        currentHotels?.data?.results ||
        [];

      // Normal search se hotels already hain to API dobara call nahi hogi
      if (Array.isArray(existingHotels) && existingHotels.length > 0) {
        return;
      }

      const savedSearchString = localStorage.getItem("hotelSearchPayload");

      if (!savedSearchString) {
        console.log("NO SAVED HOTEL SEARCH FOUND");
        return;
      }

      let savedSearch;

      try {
        savedSearch = JSON.parse(savedSearchString);
      } catch (error) {
        console.error("INVALID SAVED HOTEL SEARCH:", error);
        return;
      }

      const savedParams = savedSearch?.requestParams;

      if (!savedParams || !savedParams.city) {
        console.log("SAVED HOTEL PARAMS NOT AVAILABLE:", savedSearch);
        return;
      }

      try {
        setRestoreLoading(true);
        setPageLoading(true);
        setPaginationError("");

        // Search header restore
        useHotelStore.setState({
          search: savedSearch,
        });

        const params = {
          ...savedParams,
          page: Number(savedParams?.page || 1),
          page_size: Number(
            savedParams?.page_size || savedSearch?.pageSize || 20,
          ),
        };

        console.log("REFRESH HOTEL API PARAMS:", params);

        const response = await publicApi.get(
          savedSearch?.requestEndpoint || "/api/hotels/search-hotels/",
          {
            params,
          },
        );

        console.log("REFRESH HOTEL API RESPONSE:", response.data);

        let responseData = response.data;

        if (
          responseData?.data &&
          typeof responseData.data === "object" &&
          !Array.isArray(responseData.data)
        ) {
          responseData = {
            ...responseData,
            ...responseData.data,
          };
        }

        useHotelStore.setState({
          search: savedSearch,
          hotels: responseData,
        });
      } catch (error) {
        console.error(
          "HOTEL REFRESH RESTORE ERROR:",
          error?.response?.data || error,
        );

        setPaginationError(
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to restore hotel search.",
        );
      } finally {
        setPageLoading(false);
        setRestoreLoading(false);
      }
    };

    restoreHotelsAfterRefresh();
  }, []);
  useEffect(() => {
    if (
      Array.isArray(hotelResponse?.hotel_options) &&
      hotelResponse.hotel_options.length > 1
    ) {
      setAllHotelOptions(hotelResponse.hotel_options);
    }
  }, [hotelResponse?.hotel_options]);

  const filteredHotelOptions = useMemo(() => {
    const query = hotelSearch.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return allHotelOptions
      .filter((hotel) =>
        String(hotel.hotel_name || "")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 30);
  }, [allHotelOptions, hotelSearch]);

  const filteredHotels = useMemo(() => {
    const filtered = hotelList.filter((hotel) => {
      const room = hotel.selected_room;
      const meal = String(room?.meal || hotel.meal || "").toLowerCase();

      return (
        Number(hotel.price || 0) <= Number(priceRange[1]) &&
        Number(hotel.rating || 0) >= Number(minRating || 0) &&
        (!onlyRefundable || Boolean(room?.refundable || hotel.refundable)) &&
        (mealType === "all" || meal.includes(mealType.toLowerCase()))
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "price") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sort === "rating") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }

      return 0;
    });
  }, [hotelList, sort, priceRange, minRating, onlyRefundable, mealType]);

  const handleHotelSelect = useCallback(
    async (hotel) => {
      const hotelCode = String(hotel?.hotel_code || "");

      if (!hotelCode) return;

      try {
        setHotelFilterLoading(true);
        setPaginationError("");

        setHotelSearch(hotel?.hotel_name || "");

        setSelectedHotelCode(hotelCode);

        setHotelDropdownOpen(false);

        const params = {
          ...(search?.requestParams || {}),

          hotel_code: hotelCode,

          // selected hotel result always starts from page 1
          page: 1,

          page_size: 20,
        };

        console.log("HOTEL NAME FILTER REQUEST:", params);

        const response = await publicApi.get(
          search?.requestEndpoint || "/api/hotels/search-hotels/",
          {
            params,
          },
        );

        let responseData = response.data;

        if (
          responseData?.data &&
          typeof responseData.data === "object" &&
          !Array.isArray(responseData.data)
        ) {
          responseData = {
            ...responseData,
            ...responseData.data,
          };
        }

        /*
         * Do NOT replace allHotelOptions here.
         *
         * We want original 150 hotel names
         * to remain available.
         */
        useHotelStore.setState({
          hotels: responseData,
        });

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        console.error(
          "HOTEL NAME FILTER ERROR:",
          error?.response?.data || error,
        );

        setPaginationError(
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load selected hotel.",
        );
      } finally {
        setHotelFilterLoading(false);
      }
    },
    [search],
  );

  const handleClearHotelFilter = useCallback(async () => {
    try {
      setHotelFilterLoading(true);
      setPaginationError("");

      setHotelSearch("");
      setSelectedHotelCode("");
      setHotelDropdownOpen(false);

      const params = {
        ...(search?.requestParams || {}),

        page: 1,
        page_size: 20,
      };

      /*
       * Important:
       * Make sure selected hotel isn't sent again.
       */
      delete params.hotel_code;

      console.log("CLEAR HOTEL FILTER REQUEST:", params);

      const response = await publicApi.get(
        search?.requestEndpoint || "/api/hotels/search-hotels/",
        {
          params,
        },
      );

      let responseData = response.data;

      if (
        responseData?.data &&
        typeof responseData.data === "object" &&
        !Array.isArray(responseData.data)
      ) {
        responseData = {
          ...responseData,
          ...responseData.data,
        };
      }

      useHotelStore.setState({
        hotels: responseData,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "CLEAR HOTEL FILTER ERROR:",
        error?.response?.data || error,
      );

      setPaginationError(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to clear hotel filter.",
      );
    } finally {
      setHotelFilterLoading(false);
    }
  }, [search]);

  const handlePageChange = useCallback(
    async (requestedPage) => {
      const nextPage = Number(requestedPage);

      if (
        pageLoading ||
        nextPage < 1 ||
        nextPage > totalPages ||
        nextPage === currentPage
      ) {
        return;
      }

      try {
        setPageLoading(true);
        setPaginationError("");

        /*
         * Best case:
         * HotelsForm saved the original requestParams.
         * We reuse everything and change only the page.
         */
        let params = {
          ...(search?.requestParams || {}),
          page: nextPage,
          page_size: 20,
        };

        /*
         * Fallback if requestParams is not available.
         */
        if (!params.city) {
          const roomGuests = Array.isArray(guests?.roomGuests)
            ? guests.roomGuests
            : [];

          const paxRooms =
            roomGuests.length > 0
              ? roomGuests.map((room) => {
                const children = Number(room.Children ?? room.children ?? 0);

                const ages =
                  room.ChildrenAges || room.ChildAges || room.childAges || [];

                return {
                  Adults: Number(room.Adults ?? room.adults ?? 1),
                  Children: children,
                  ChildrenAges: ages.slice(0, children).map(Number),
                };
              })
              : [
                {
                  Adults: Number(guests?.adults || 1),
                  Children: Number(guests?.children || 0),
                  ChildrenAges: Array.isArray(guests?.childAges)
                    ? guests.childAges.map(Number)
                    : [],
                },
              ];

          params = {
            city:
              typeof city === "object"
                ? city?.code || city?.Code || city?.CityId || city?.cityId
                : city,

            checkin: checkIn,
            checkout: checkOut,

            adults: Number(guests?.adults || 1),
            children: Number(guests?.children || 0),
            rooms: Number(guests?.rooms || paxRooms.length || 1),

            nationality: search?.nationality || "IN",
            currency: search?.currency || "INR",

            pax_rooms: JSON.stringify(paxRooms),

            page: nextPage,
            page_size: 20,
          };
        }

        console.log("HOTEL PAGE REQUEST:", params);

        const response = await publicApi.get(
          search?.requestEndpoint || "/api/hotels/search-hotels/",
          {
            params,
          },
        );

        if (selectedHotelCode) {
          params.hotel_code = selectedHotelCode;
        }

        console.log(`HOTEL PAGE ${nextPage} RESPONSE:`, response.data);

        let responseData = response.data;

        if (
          responseData?.data &&
          typeof responseData.data === "object" &&
          !Array.isArray(responseData.data)
        ) {
          responseData = {
            ...responseData,
            ...responseData.data,
          };
        }

        /*
         * IMPORTANT:
         * Store COMPLETE backend response.
         *
         * Don't store only responseData.results.
         * Otherwise count / page / total_pages will disappear.
         */
        useHotelStore.setState({
          hotels: responseData,
        });

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        console.error(
          "HOTEL PAGINATION ERROR:",
          error?.response?.data || error,
        );

        setPaginationError(
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load hotels.",
        );
      } finally {
        setPageLoading(false);
      }
    },
    [
      pageLoading,
      totalPages,
      currentPage,
      search,
      guests,
      city,
      checkIn,
      checkOut,
      selectedHotelCode,
    ],
  );

  const handleView = useCallback(
    (hotel, room) => {
      const selectedRoom = room || hotel.selected_room || hotel.rooms?.[0];

      if (!selectedRoom) {
        alert("Room data not available for this hotel");
        return;
      }

      const bookingCode =
        selectedRoom.booking_code ||
        selectedRoom.BookingCode ||
        selectedRoom.room_raw?.BookingCode ||
        hotel.booking_code ||
        hotel.BookingCode;

      if (!bookingCode) {
        alert("Booking code not available for this room");
        return;
      }

      const finalRoom = {
        ...selectedRoom,
        booking_code: bookingCode,
        BookingCode: bookingCode,
        Name:
          selectedRoom.room_name ||
          selectedRoom.Name ||
          selectedRoom.RoomTypeName ||
          selectedRoom.room_raw?.Name?.[0] ||
          "Standard Room",
        room_raw: selectedRoom.room_raw || selectedRoom,
      };

      const finalHotel = {
        ...hotel,
        image: hotel.image || hotel.images?.[0] || FALLBACK_IMAGE,
        images:
          Array.isArray(hotel.images) && hotel.images.length > 0
            ? hotel.images
            : [hotel.image || FALLBACK_IMAGE],
        selected_room: finalRoom,
        booking_code: bookingCode,
        BookingCode: bookingCode,
        hotel_raw: hotel.hotel_raw || hotel.rawHotel || hotel,
        rawHotel: hotel.rawHotel || hotel.hotel_raw || hotel,
      };

      if (typeof selectHotelRoom === "function") {
        selectHotelRoom(finalHotel, finalRoom);
      } else {
        setSelectedHotel(finalHotel);
        setSelectedRoom(finalRoom);
      }

      const safeRoomGuests = Array.isArray(search?.guests?.roomGuests)
        ? search.guests.roomGuests.map((room, index) => {
          const children = Number(room.Children ?? room.children ?? 0);

          const ages =
            room.ChildrenAges || room.ChildAges || room.childAges || [];

          const cleanAges = ages
            .slice(0, children)
            .map((age) => Number(age))
            .filter((age) => age >= 1 && age <= 12);

          return {
            roomIndex: room.roomIndex ?? room.RoomIndex ?? index + 1,
            RoomIndex: room.RoomIndex ?? room.roomIndex ?? index + 1,
            adults: Number(room.adults ?? room.Adults ?? 1),
            Adults: Number(room.Adults ?? room.adults ?? 1),
            children,
            Children: children,
            childAges: cleanAges,
            ChildAges: cleanAges,
            ChildrenAges: cleanAges,
          };
        })
        : [];

      const safeChildAges = safeRoomGuests.flatMap((room) => room.ChildrenAges);

      navigate(`/hotels/${hotel.hotel_code || hotel.HotelCode}`, {
        state: {
          hotel: finalHotel,
          room: finalRoom,
          checkIn,
          checkOut,
          guests: {
            ...guests,
            childAges: safeChildAges,
            roomGuests: safeRoomGuests,
          },

          childAges: safeChildAges,
          roomGuests: safeRoomGuests,

          bookingCode,
          cancellationPolicies: finalRoom.cancel_policies || [],
          rateConditions: finalRoom.rate_conditions || [],
          supplements: finalRoom.supplements || [],
          amenities: finalRoom.amenities || [],
          inclusions: finalRoom.inclusion || "",
          roomPromotions: finalRoom.room_promotion || [],
          mealType: finalRoom.meal || "",
          refundable: finalRoom.refundable,
          exactPrice: {
            price: finalRoom.price || 0,
            tax: finalRoom.tax || 0,
            total: Number(finalRoom.price || 0) + Number(finalRoom.tax || 0),
            currency: finalRoom.currency || hotel.currency || "INR",
          },
        },
      });
    },
    [
      navigate,
      selectHotelRoom,
      setSelectedHotel,
      setSelectedRoom,
      checkIn,
      checkOut,
      guests,
      search,
    ],
  );

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white pb-20 md:pb-0 pt-20">
      <SEO
        title={`Hotels in ${displayCity || "Top Destinations"}`}
        description={`Find and book luxury and budget hotels in ${displayCity || "top destinations"}. Exclusive hotel deals, best rates, and instant booking confirmation with FlyingLyte.`}
        canonical="https://www.flyinglyte.com/hotels"
      />
      <div className="bg-[#0B0B0F]/95 backdrop-blur border-b border-gray-800 px-4 md:px-10 py-10 md:py-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Hotel Search Results
            </p>

            <h1 className="mt-1 text-xl md:text-3xl font-bold text-yellow-400">
              Hotels in {displayCity}
            </h1>

            <p className="text-xs md:text-sm text-gray-400 mt-1">
              {checkIn || "Check-in"} → {checkOut || "Check-out"} •{" "}
              {totalGuests || 1} Guest{totalGuests > 1 ? "s" : ""} •{" "}
              {guests?.rooms || 1} Room
              {Number(guests?.rooms || 1) > 1 ? "s" : ""}
            </p>

            {childAges.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Child age{childAges.length > 1 ? "s" : ""}:{" "}
                {childAges.join(", ")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/20">
              {totalHotels} Hotels Found
            </span>

            <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="hidden md:block bg-[#15151C] p-5 rounded-2xl sticky top-28 border border-gray-800 h-fit">
          <FiltersUI
            hotelSearch={hotelSearch}
            setHotelSearch={setHotelSearch}
            selectedHotelCode={selectedHotelCode}
            setSelectedHotelCode={setSelectedHotelCode}
            hotelDropdownOpen={hotelDropdownOpen}
            setHotelDropdownOpen={setHotelDropdownOpen}
            filteredHotelOptions={filteredHotelOptions}
            hotelFilterLoading={hotelFilterLoading}
            handleHotelSelect={handleHotelSelect}
            handleClearHotelFilter={handleClearHotelFilter}
            sort={sort}
            setSort={setSort}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            onlyRefundable={onlyRefundable}
            setOnlyRefundable={setOnlyRefundable}
            mealType={mealType}
            setMealType={setMealType}
          />
        </div>

        <div className="md:col-span-3 space-y-5">
          {totalHotels > 0 && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalHotels={totalHotels}
              startHotelNumber={startHotelNumber}
              endHotelNumber={endHotelNumber}
              visiblePageNumbers={visiblePageNumbers}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              pageLoading={pageLoading}
              onPageChange={handlePageChange}
            />
          )}

          {paginationError && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {paginationError}
            </div>
          )}

          {restoreLoading ? (
            <div className="bg-[#15151C] min-h-64 p-10 rounded-2xl border border-gray-800 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-gray-700 border-t-yellow-400 animate-spin" />

              <p className="mt-4 text-base font-semibold text-yellow-300">
                Loading hotels...
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Please wait while we restore your hotel search.
              </p>
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="bg-[#15151C] p-10 rounded-2xl text-center border border-gray-800">
              <p className="text-lg text-gray-300">No hotels found</p>

              <p className="text-sm text-gray-500 mt-2">
                Try changing price, rating or refundable filters.
              </p>
            </div>
          ) : (
            filteredHotels.map((hotel, index) => {
              const hotelKey = String(
                hotel.hotel_code ||
                hotel.HotelCode ||
                index
              );
              const defaultRoom = hotel.selected_room || hotel.rooms?.[0];

              const hotelImage =
                hotel.image ||
                hotel.images?.[0] ||
                hotel.rawHotel?.image ||
                hotel.rawHotel?.images?.[0] ||
                FALLBACK_IMAGE;


              const hotelImages =
                Array.isArray(hotel.images) && hotel.images.length > 0
                  ? hotel.images.slice(0, 3)
                  : [hotelImage];

              const hasBookingCode = Boolean(
                defaultRoom?.booking_code ||
                defaultRoom?.BookingCode ||
                defaultRoom?.room_raw?.BookingCode ||
                hotel.booking_code ||
                hotel.BookingCode,
              );

              return (
                <div
                  key={`${hotelKey}-${index}`}
                  onMouseEnter={() => setHoveredHotelKey(hotelKey)}
                  onMouseLeave={() => setHoveredHotelKey(null)}
                  onClick={() => {
                    if (hasBookingCode) {
                      handleView(hotel, defaultRoom);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;

                    if (
                      hasBookingCode &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      handleView(hotel, defaultRoom);
                    }
                  }}
                  tabIndex={hasBookingCode ? 0 : -1}
                  aria-label={`View details for ${hotel.hotel_name || "hotel"}`}
                  className={`
    group
    bg-[#15151C]
    rounded-2xl
    border border-gray-800
    hover:border-yellow-400/50
    transition-all
    duration-300
    overflow-hidden
    shadow-lg
    shadow-black/20
    focus:outline-none
    focus:border-yellow-400
    ${hasBookingCode
                      ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30"
                      : "cursor-default"
                    }
  `}
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="relative w-full lg:w-60 h-44 sm:h-48 lg:h-52 shrink-0 bg-[#0B0B0F]">
                      <HotelImageSlider
                        images={hotelImages}
                        alt={hotel.hotel_name || "Hotel"}
                        autoPlay={hoveredHotelKey === hotelKey}
                      />

                      {hotel.has_image && (
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full border border-white/10">
                          Real Image
                        </div>
                      )}

                      <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                        ⭐ {hotel.rating || 4}
                      </div>
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-base md:text-lg font-semibold text-yellow-300 line-clamp-2">
                            {hotel.hotel_name || "Hotel"}
                          </h2>

                          <p className="text-xs text-gray-400 mt-1 wrap-break-word line-clamp-2">
                            🛏{" "}
                            {defaultRoom?.room_name ||
                              hotel.room ||
                              "Standard Room"}
                          </p>

                          {defaultRoom?.inclusion && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {defaultRoom.inclusion
                                .split(",")
                                .filter(Boolean)
                                .map((item, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded-full text-[11px]
          bg-emerald-500/10 border border-emerald-500/20
          text-emerald-300"
                                  >
                                    ✓ {item.trim()}
                                  </span>
                                ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            {getRoomBadges(defaultRoom)
                              .slice(0, 3)
                              .map((badge, i) => (
                                <span
                                  key={i}
                                  className={`text-[10px] px-2 py-1 rounded-full border ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div className="xl:text-right shrink-0">
                          <p className="text-xs text-gray-500">Starting from</p>

                          <p className="text-xl md:text-2xl font-bold text-yellow-400">
                            ₹ {formatPrice(hotel.price)}
                          </p>

                          <p className="text-xs text-gray-400">
                            inclusive of all taxes
                          </p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(hotel, defaultRoom);
                            }}
                            disabled={!hasBookingCode}
                            className="mt-3 px-4 py-2 rounded-lg bg-linear-to-r from-yellow-400 to-orange-400 text-black text-xs md:text-sm font-bold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {totalHotels > 0 && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalHotels={totalHotels}
              startHotelNumber={startHotelNumber}
              endHotelNumber={endHotelNumber}
              visiblePageNumbers={visiblePageNumbers}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              pageLoading={pageLoading}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[#15151C] border-t border-gray-800 flex z-40">
        <button
          onClick={() => setShowFilters(true)}
          className="flex-1 py-3 text-sm border-r border-gray-800"
        >
          Filters
        </button>

        <button
          onClick={() => setSort(sort === "price" ? "rating" : "price")}
          className="flex-1 py-3 text-sm"
        >
          Sort: {sort === "price" ? "Price" : "Rating"}
        </button>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-[#15151C] border-t border-gray-800 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-yellow-300">Filters</h3>

              <button
                onClick={() => setShowFilters(false)}
                className="w-9 h-9 rounded-full bg-[#0B0B0F] border border-gray-800"
              >
                ✕
              </button>
            </div>

            <FiltersUI
              hotelSearch={hotelSearch}
              setHotelSearch={setHotelSearch}
              selectedHotelCode={selectedHotelCode}
              setSelectedHotelCode={setSelectedHotelCode}
              hotelDropdownOpen={hotelDropdownOpen}
              setHotelDropdownOpen={setHotelDropdownOpen}
              filteredHotelOptions={filteredHotelOptions}
              hotelFilterLoading={hotelFilterLoading}
              handleHotelSelect={handleHotelSelect}
              handleClearHotelFilter={handleClearHotelFilter}
              sort={sort}
              setSort={setSort}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              onlyRefundable={onlyRefundable}
              setOnlyRefundable={setOnlyRefundable}
              mealType={mealType}
              setMealType={setMealType}
            />

            <button
              onClick={() => setShowFilters(false)}
              className="w-full mt-5 py-3 rounded-xl bg-yellow-400 text-black font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PaginationBar = ({
  currentPage,
  totalPages,
  totalHotels,
  startHotelNumber,
  endHotelNumber,
  visiblePageNumbers,
  hasNext,
  hasPrevious,
  pageLoading,
  onPageChange,
}) => {
  // Mobile par maximum 3 page numbers
  const mobilePageCount = Math.min(3, totalPages);

  const mobileStartPage = Math.max(
    1,
    Math.min(currentPage - 1, totalPages - mobilePageCount + 1)
  );

  const mobilePageNumbers = Array.from(
    { length: mobilePageCount },
    (_, index) => mobileStartPage + index
  );

  return (
    <div className="bg-[#15151C] border border-gray-800 rounded-2xl px-4 py-4 md:px-5">

      {/* =========================
          MOBILE PAGINATION
      ========================== */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm text-gray-300">
              Showing{" "}
              <span className="text-yellow-400 font-semibold">
                {startHotelNumber}-{endHotelNumber}
              </span>{" "}
              of{" "}
              <span className="text-yellow-400 font-semibold">
                {totalHotels}
              </span>
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          {pageLoading && (
            <div className="w-5 h-5 rounded-full border-2 border-gray-700 border-t-yellow-400 animate-spin shrink-0" />
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          {/* Previous */}
          <button
            type="button"
            aria-label="Previous page"
            disabled={!hasPrevious || pageLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="
              w-10 h-10
              rounded-xl
              border border-gray-700
              flex items-center justify-center
              text-lg text-gray-300
              disabled:opacity-30
              disabled:cursor-not-allowed
              active:scale-95
              transition
            "
          >
            ‹
          </button>

          {/* Page Numbers */}
          {mobilePageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              disabled={pageLoading}
              onClick={() => onPageChange(pageNumber)}
              className={`
                w-10 h-10
                rounded-xl
                border
                text-sm
                font-semibold
                transition
                active:scale-95

                ${currentPage === pageNumber
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-[#0B0B0F] text-gray-300 border-gray-700"
                }
              `}
            >
              {pageNumber}
            </button>
          ))}

          {/* Next */}
          <button
            type="button"
            aria-label="Next page"
            disabled={!hasNext || pageLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="
              w-10 h-10
              rounded-xl
              border border-gray-700
              flex items-center justify-center
              text-lg text-gray-300
              disabled:opacity-30
              disabled:cursor-not-allowed
              active:scale-95
              transition
            "
          >
            ›
          </button>
        </div>
      </div>

      {/* =========================
          DESKTOP PAGINATION
      ========================== */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-base text-gray-300">
              Showing{" "}
              <span className="text-yellow-400 font-semibold">
                {startHotelNumber} - {endHotelNumber}
              </span>{" "}
              of{" "}
              <span className="text-yellow-400 font-semibold">
                {totalHotels}
              </span>{" "}
              hotels
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevious || pageLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="
                min-h-10 px-4 rounded-xl
                border border-gray-700
                text-sm text-gray-300
                hover:border-yellow-400
                hover:text-yellow-300
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition
              "
            >
              ← Previous
            </button>

            {visiblePageNumbers.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                disabled={pageLoading}
                onClick={() => onPageChange(pageNumber)}
                className={`
                  min-w-10 h-10 px-3 rounded-xl
                  border text-sm font-medium transition

                  ${currentPage === pageNumber
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-[#0B0B0F] text-gray-300 border-gray-700 hover:border-yellow-400 hover:text-yellow-300"
                  }
                `}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={!hasNext || pageLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="
                min-h-10 px-4 rounded-xl
                border border-gray-700
                text-sm text-gray-300
                hover:border-yellow-400
                hover:text-yellow-300
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition
              "
            >
              Next →
            </button>
          </div>
        </div>

        {pageLoading && (
          <p className="text-xs text-yellow-300 mt-3">
            Loading hotels...
          </p>
        )}
      </div>

    </div>
  );
};

const FiltersUI = ({
  hotelSearch,
  setHotelSearch,
  selectedHotelCode,
  setSelectedHotelCode,
  hotelDropdownOpen,
  setHotelDropdownOpen,
  filteredHotelOptions,
  hotelFilterLoading,
  handleHotelSelect,
  handleClearHotelFilter,

  sort,
  setSort,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  onlyRefundable,
  setOnlyRefundable,
  mealType,
  setMealType,
}) => (
  <div className="space-y-5">
    <div className="relative">
      <label className="text-sm text-gray-400">Hotel Name</label>

      <div className="relative mt-1">
        <input
          type="text"
          value={hotelSearch}
          disabled={hotelFilterLoading}
          placeholder="Search hotel name..."
          onFocus={() => {
            if (hotelSearch.trim()) {
              setHotelDropdownOpen(true);
            }
          }}
          onChange={(e) => {
            const value = e.target.value;

            setHotelSearch(value);

            // User is typing again,
            // so remove old selected hotel code locally.
            setSelectedHotelCode("");

            setHotelDropdownOpen(Boolean(value.trim()));
          }}
          className="
        w-full
        p-2.5 pr-10
        rounded-xl
        bg-[#0B0B0F]
        border border-gray-800
        outline-none
        focus:border-yellow-400
        disabled:opacity-60
      "
        />

        {hotelFilterLoading ? (
          <span
            className="
          absolute
          right-3 top-1/2
          -translate-y-1/2
          w-4 h-4
          rounded-full
          border-2
          border-gray-600
          border-t-yellow-400
          animate-spin
        "
          />
        ) : hotelSearch ? (
          <button
            type="button"
            onClick={handleClearHotelFilter}
            className="
          absolute
          right-3 top-1/2
          -translate-y-1/2
          text-gray-500
          hover:text-white
        "
          >
            ✕
          </button>
        ) : null}
      </div>

      {hotelDropdownOpen && hotelSearch.trim() && !hotelFilterLoading && (
        <div
          className="
          absolute
          left-0 right-0
          top-full
          mt-2
          z-50
          max-h-64
          overflow-y-auto
          rounded-xl
          border border-gray-700
          bg-[#0B0B0F]
          shadow-2xl
        "
        >
          {filteredHotelOptions.length > 0 ? (
            filteredHotelOptions.map((hotel) => (
              <button
                key={hotel.hotel_code}
                type="button"
                onClick={() => handleHotelSelect(hotel)}
                className="
                block
                w-full
                px-3 py-3
                text-left
                text-sm
                text-gray-200
                border-b border-gray-800
                last:border-b-0
                hover:bg-yellow-400/10
                hover:text-yellow-300
                transition
              "
              >
                {hotel.hotel_name}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-gray-500">
              No matching hotel found
            </div>
          )}
        </div>
      )}
    </div>
    <div>
      <label className="text-sm text-gray-400">Sort</label>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="w-full mt-1 p-2 rounded-xl bg-[#0B0B0F] border border-gray-800 outline-none"
      >
        <option value="price">Price: Low to High</option>
        <option value="rating">Rating: High to Low</option>
      </select>
    </div>

    <div>
      <label className="text-sm text-gray-400">
        Max ₹{formatPrice(priceRange[1])}
      </label>

      <input
        type="range"
        min="0"
        max="200000"
        step="500"
        value={priceRange[1]}
        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
        className="w-full mt-2"
      />
    </div>

    <div>
      <label className="text-sm text-gray-400">Rating</label>

      <select
        value={minRating}
        onChange={(e) => setMinRating(Number(e.target.value))}
        className="w-full mt-1 p-2 rounded-xl bg-[#0B0B0F] border border-gray-800 outline-none"
      >
        <option value="0">All</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
        <option value="5">5 only</option>
      </select>
    </div>

    <div>
      <label className="text-sm text-gray-400">Meal Type</label>

      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        className="w-full mt-1 p-2 rounded-xl bg-[#0B0B0F] border border-gray-800 outline-none"
      >
        <option value="all">All</option>
        <option value="room_only">Room Only</option>
        <option value="breakfast">Breakfast</option>
        <option value="half_board">Half Board</option>
        <option value="full_board">Full Board</option>
      </select>
    </div>

    <label className="flex gap-3 items-center text-sm text-gray-300 cursor-pointer">
      <input
        type="checkbox"
        checked={onlyRefundable}
        onChange={() => setOnlyRefundable(!onlyRefundable)}
      />
      Refundable only
    </label>
  </div>
);

export default HotelResults;
