import React, { useEffect } from "react"
import Register from "./Pages/Register";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import LoginPage from "./Pages/LoginPage";
import FlightsPage from "./Pages/FlightsPage";
import HotelsPage from "./Pages/HotelsPage";
import ContactPage from "./Pages/ContactPage";
import Navbar from "./components/Home/Navbar";
import FareRule from "./modules/flights/pages/FareRule";
import FareQuote from "./modules/flights/pages/FareQuote";
import SSRPage from "./modules/flights/pages/SSRPage";
import PassengerDetails from "./modules/flights/pages/PassengerDetails";
import ReviewBooking from "./modules/flights/pages/ReviewBooking";
import BookingSuccess from "./modules/flights/pages/BookingSuccess";
// import BookingDetails from "./modules/flights/pages/FlightBookingDetails";
import FlightAmendment from "./modules/flights/pages/FlightAmendment";
import FlightPaymentSuccess from "./modules/flights/pages/FlightPaymentSuccess";
import TermsConditions from "./Pages/TermsConditions";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import RefundPolicy from "./Pages/RefundPolicy";
import PackageDetails from "./modules/packages/PackageDetail";
import PackageSection from "./modules/packages/PackageSection";
import PackageBookingSuccess from "./modules/packages/PackageBookingSuccess";
import AboutUs from "./components/Home/AboutUs";
import MyBookings from "./components/Home/Mybookings";
import WhatsAppFloating from "./components/WhatsAppFloating";
import Footer from "./components/Home/Footer/Footer";
import FlightsResults from "./modules/flights/pages/FlightsResults";
import HotelResults from "./modules/hotels/pages/HotelResults";
import HotelDetails from "./modules/hotels/pages/HotelDetails";
import PrebookLoader from "./modules/hotels/pages/PreBookLoader";
import HotelBooking from "./modules/hotels/pages/HotelBooking";
import Chatbot from "./components/chatbot/Chatbot";
import HotelBookingDetails from "./modules/hotels/pages/HotelBookingDetails";
import FlightBookingDetails from "./modules/flights/pages/FlightBookingDetails";
import Blogs from "./Pages/Blogs";
import BlogDetails from "./Pages/BlogDetails";
import CancellationPolicyPage from "./Pages/CancellationPolicyPage";
import HotelBookingSuccess from "./modules/hotels/pages/HotelBookingSuccess";
import HotelInvoice from "./modules/hotels/pages/HotelInvoice";
import HotelVoucher from "./modules/hotels/pages/HotelVoucher";
import HotelReviewBooking from "./modules/hotels/pages/HotelReviewBooking";
import PaymentSuccess from "./modules/hotels/pages/PaymentSuccess";

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



        <Route path="/flights" element={<FlightsPage />} />
        <Route path="/hotels" element={<HotelsPage />} />

        <Route path="/packages" element={<PackageSection limit={8} />} />
        <Route path="/packages/:slug" element={<PackageDetails />} />
        <Route
          path="/package_booking_success/:bookingId"
          element={<PackageBookingSuccess />}
        />

        {/* Hotel Routes */}
        {/* <Route path="/hotels" element={<HotelResults />} /> */}
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
          path="/booking-details/:bookingId"
          element={<HotelBookingDetails />}
        />

        {/* Flights */}
        {/* <Route path="/flights" element={<FlightsResults />} /> */}
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

        {/* <Route path="/hotels" element={<HotelPage />} /> */}
        {/* <Route path="/railways" element={<RailwayPage />} /> */}
        {/* Optional: 404 Page */}
        <Route
          path="*"
          element={<h1 className="text-center mt-20">404 - Page Not Found</h1>}
        />
      </Routes>

      <WhatsAppFloating />
      <Chatbot />
      <Footer />
    </main>
  );
};

export default App;
