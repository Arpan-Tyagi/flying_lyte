import React, { useEffect, Suspense, lazy } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Home/Navbar";
import Footer from "./components/Home/Footer/Footer";
import WhatsAppFloating from "./components/WhatsAppFloating";
import Chatbot from "./components/chatbot/Chatbot";

// Critical / Above-fold Route
import Home from "./Pages/Home";

// Lazy-loaded routes for code-splitting & optimal performance
const FlightsPage = lazy(() => import("./Pages/FlightsPage"));
const HotelsPage = lazy(() => import("./Pages/HotelsPage"));
const Register = lazy(() => import("./Pages/Register"));
const LoginPage = lazy(() => import("./Pages/LoginPage"));
const ContactPage = lazy(() => import("./Pages/ContactPage"));
const AboutUs = lazy(() => import("./components/Home/AboutUs"));
const MyBookings = lazy(() => import("./components/Home/Mybookings"));
const Blogs = lazy(() => import("./Pages/Blogs"));
const BlogDetails = lazy(() => import("./Pages/BlogDetails"));
const TermsConditions = lazy(() => import("./Pages/TermsConditions"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./Pages/RefundPolicy"));
const CancellationPolicyPage = lazy(() => import("./Pages/CancellationPolicyPage"));

// Packages
const PackageSection = lazy(() => import("./modules/packages/PackageSection"));
const PackageDetails = lazy(() => import("./modules/packages/PackageDetail"));
const PackageBookingSuccess = lazy(() => import("./modules/packages/PackageBookingSuccess"));

// Hotels
const HotelResults = lazy(() => import("./modules/hotels/pages/HotelResults"));
const HotelDetails = lazy(() => import("./modules/hotels/pages/HotelDetails"));
const PrebookLoader = lazy(() => import("./modules/hotels/pages/PreBookLoader"));
const HotelBooking = lazy(() => import("./modules/hotels/pages/HotelBooking"));
const HotelReviewBooking = lazy(() => import("./modules/hotels/pages/HotelReviewBooking"));
const PaymentSuccess = lazy(() => import("./modules/hotels/pages/PaymentSuccess"));
const HotelVoucher = lazy(() => import("./modules/hotels/pages/HotelVoucher"));
const HotelInvoice = lazy(() => import("./modules/hotels/pages/HotelInvoice"));
const HotelBookingSuccess = lazy(() => import("./modules/hotels/pages/HotelBookingSuccess"));
const HotelBookingDetails = lazy(() => import("./modules/hotels/pages/HotelBookingDetails"));

// Flights
const FlightsResults = lazy(() => import("./modules/flights/pages/FlightsResults"));
const FareRule = lazy(() => import("./modules/flights/pages/FareRule"));
const FareQuote = lazy(() => import("./modules/flights/pages/FareQuote"));
const SSRPage = lazy(() => import("./modules/flights/pages/SSRPage"));
const FlightAmendment = lazy(() => import("./modules/flights/pages/FlightAmendment"));
const PassengerDetails = lazy(() => import("./modules/flights/pages/PassengerDetails"));
const ReviewBooking = lazy(() => import("./modules/flights/pages/ReviewBooking"));
const BookingSuccess = lazy(() => import("./modules/flights/pages/BookingSuccess"));
const FlightBookingDetails = lazy(() => import("./modules/flights/pages/FlightBookingDetails"));
const FlightPaymentSuccess = lazy(() => import("./modules/flights/pages/FlightPaymentSuccess"));

// Minimal themed fallback loader
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-(--bg-main)">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-3 border-white/10 border-t-(--gold-main) animate-spin" />
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-PWH1WRN04Q", {
        page_path: pathname + search,
      });
    }
  }, [pathname, search]);

  return null;
};

const App = () => {
  return (
    <main>
      <Navbar />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetails />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cancellation" element={<CancellationPolicyPage />} />

          {/* Flights */}
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/flights/results" element={<FlightsResults />} />
          <Route path="/fare-rule" element={<FareRule />} />
          <Route path="/fare-quote" element={<FareQuote />} />
          <Route path="/ssr" element={<SSRPage />} />
          <Route
            path="/flight-amendment/:bookingId"
            element={<FlightAmendment />}
          />
          <Route path="/passenger-details" element={<PassengerDetails />} />
          <Route path="/review-booking" element={<ReviewBooking />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route
            path="/flight-booking-details/:id"
            element={<FlightBookingDetails />}
          />
          <Route
            path="/flight-payment-success"
            element={<FlightPaymentSuccess />}
          />

          {/* Hotels */}
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/results" element={<HotelResults />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/prebook" element={<PrebookLoader />} />
          <Route path="/hotel-booking" element={<HotelBooking />} />
          <Route path="/hotel-review-booking" element={<HotelReviewBooking />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/booking-details/:bookingId" element={<HotelVoucher />} />
          <Route path="/hotel-invoice/:bookingId" element={<HotelInvoice />} />
          <Route
            path="/hotel-booking-success"
            element={<HotelBookingSuccess />}
          />
          <Route
            path="/hotel-booking-details/:bookingId"
            element={<HotelBookingDetails />}
          />

          {/* Packages */}
          <Route path="/packages" element={<PackageSection limit={8} />} />
          <Route path="/packages/:slug" element={<PackageDetails />} />
          <Route
            path="/package_booking_success/:bookingId"
            element={<PackageBookingSuccess />}
          />

          {/* 404 Page */}
          <Route
            path="*"
            element={<h1 className="text-center mt-20 text-white">404 - Page Not Found</h1>}
          />
        </Routes>
      </Suspense>

      <WhatsAppFloating />
      <Chatbot />
      <Footer />
    </main>
  );
};

export default App;
