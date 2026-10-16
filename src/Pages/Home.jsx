import React from "react";
import HeroSection from "../components/Home/HeroSection";
import WhyChooseUs from "./WhyChooseUs";
import TestimonialsSection from "./TestimonialsSection";
import CTASection from "../components/Home/CTASection";
import AboutUs from "../components/Home/AboutUs";
import PackageSection from "../modules/packages/PackageSection";
import BlogSection from "../components/Home/BlogSection";
import SEO from "../components/SEO";

const Home = () => {
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
    </div>
  );
};

export default Home;
