import React, { useEffect, useState } from "react";
import HeroSection from "../components/Home/HeroSection";
import WhyChooseUs from "./WhyChooseUs";
import TestimonialsSection from "./TestimonialsSection";
import CTASection from "../components/Home/CTASection";
import AboutUs from "../components/Home/AboutUs";
import PackageSection from "../modules/packages/PackageSection";
import BlogSection from "../components/Home/BlogSection";
import TripEnquiryPopup from "../components/common/TripEnquiryPopup";
import SEO from "../components/SEO";

let popupCheckedForThisPageLoad = false;

const Home = () => {
  const [showTripPopup, setShowTripPopup] = useState(false);

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const isPageRefresh = navigationEntry?.type === "reload";

    if (!isPageRefresh || popupCheckedForThisPageLoad) return;

    popupCheckedForThisPageLoad = true;

    const timer = setTimeout(() => {
      setShowTripPopup(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-(--bg-main)">
      <SEO
        title="Premium Flights, Hotels & Holiday Packages"
        description="Smart Trips. Zero hassle. Plan your journey with exclusive deals on domestic and international flights, luxury hotels, and curated holiday packages with FlyingLyte."
        canonical="https://www.flyinglyte.com/"
      />
      <HeroSection />
      <PackageSection limit={4} />
      <CTASection />
      <AboutUs />
      <BlogSection />
      <WhyChooseUs />
      <TestimonialsSection />
      {showTripPopup && (
        <TripEnquiryPopup onClose={() => setShowTripPopup(false)} />
      )}
    </div>
  );
};

export default Home;
