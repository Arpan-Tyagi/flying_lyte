import { useState } from "react";
import {
  X,
  CalendarDays,
  Users,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

const TripEnquiryPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    destination: "",
    travelDate: "",
    travellers: "1 Traveller",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleWhatsApp = () => {
    const message = `Hello FlyingLyte, I want to plan my trip.

Name: ${formData.name}
Phone/WhatsApp: ${formData.phone}
Destination: ${formData.destination}
Travel Date: ${formData.travelDate}
Travellers: ${formData.travellers}`;

    const url = `https://wa.me/919667455591?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-3 backdrop-blur-sm sm:px-4">
      <div className="relative max-h-[calc(100svh-16px)] w-full max-w-[340px] overflow-x-hidden overflow-y-auto rounded-[22px] border border-[#E6B35C]/30 bg-[rgba(7,17,28,0.72)] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:max-h-none sm:max-w-md sm:overflow-hidden sm:rounded-[28px] sm:p-6">
        {/* TOP GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-32 -translate-x-1/2 bg-linear-to-r from-transparent via-[#FFE08A] to-transparent shadow-[0_0_18px_rgba(255,224,138,0.95)] sm:w-40" />

        <div className="pointer-events-none absolute -left-8 -top-8 h-20 w-20 rounded-full bg-[#E6B35C]/10 blur-3xl sm:h-24 sm:w-24" />

        <div className="pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-[#E6B35C]/10 blur-3xl sm:h-24 sm:w-24" />

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-[#E6B35C]/40 hover:text-[#E6B35C] sm:right-4 sm:top-4 sm:h-10 sm:w-10"
        >
          <X size={16} className="sm:h-[18px] sm:w-[18px]" />
        </button>

        {/* HEADING */}
        <div className="pr-9 sm:pr-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E6B35C] sm:text-xs sm:tracking-[0.22em]">
            Quick Enquiry
          </p>

          <h2 className="mt-1.5 text-[23px] font-semibold leading-[1.15] text-white sm:mt-2 sm:text-3xl">
            Where will your next{" "}
            <span className="text-[#E6B35C]">journey</span> take you?
          </h2>

          <p className="mt-2 text-xs leading-5 text-white/65 sm:mt-3 sm:text-sm sm:leading-6">
            Tell us a few details and our travel experts will help you plan the
            perfect trip.
          </p>
        </div>

        {/* FORM */}
        <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
          {/* NAME */}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="h-12 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-[#E6B35C]/60 focus:bg-white/10 sm:h-14 sm:rounded-2xl sm:text-base"
          />

          {/* PHONE */}
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone / WhatsApp"
            className="h-12 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-[#E6B35C]/60 focus:bg-white/10 sm:h-14 sm:rounded-2xl sm:text-base"
          />

          {/* DESTINATION */}
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Destination e.g. Kashmir, Manali"
            className="h-12 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white placeholder:text-white/45 backdrop-blur-xl outline-none transition focus:border-[#E6B35C]/60 focus:bg-white/10 sm:h-14 sm:rounded-2xl sm:text-base"
          />

          {/* DATE + TRAVELLERS */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* DATE */}
            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55 sm:left-4 sm:h-[18px] sm:w-[18px]"
              />

              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-white/15 bg-white/8 pl-9 pr-2 text-xs text-white backdrop-blur-xl outline-none transition focus:border-[#E6B35C]/60 focus:bg-white/10 sm:h-14 sm:rounded-2xl sm:pl-12 sm:pr-4 sm:text-base"
              />
            </div>

            {/* TRAVELLERS */}
            <div className="relative">
              <Users
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-white/55 sm:left-4 sm:h-[18px] sm:w-[18px]"
              />

              <select
                name="travellers"
                value={formData.travellers}
                onChange={handleChange}
                className="h-12 w-full appearance-none rounded-xl border border-white/15 bg-white/8 pl-9 pr-7 text-xs text-white backdrop-blur-xl outline-none transition hover:border-white/25 focus:border-[#E6B35C]/60 focus:bg-white/10 sm:h-14 sm:rounded-2xl sm:pl-12 sm:pr-10 sm:text-base"
              >
                <option value="1 Traveller" className="bg-[#101721] text-white">
                  1 Traveller
                </option>

                <option value="2 Travellers" className="bg-[#101721] text-white">
                  2 Travellers
                </option>

                <option value="3 Travellers" className="bg-[#101721] text-white">
                  3 Travellers
                </option>

                <option value="4 Travellers" className="bg-[#101721] text-white">
                  4 Travellers
                </option>

                <option value="5 Travellers" className="bg-[#101721] text-white">
                  5 Travellers
                </option>

                <option value="6 Travellers" className="bg-[#101721] text-white">
                  6 Travellers
                </option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#E6B35C] sm:right-4 sm:h-[17px] sm:w-[17px]"
              />
            </div>
          </div>

          {/* WHATSAPP BUTTON */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#F8DE82] to-[#EAA82A] px-4 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(234,168,42,0.35)] transition hover:brightness-105 sm:h-15 sm:px-6 sm:text-lg"
          >
            <MessageCircle size={18} className="sm:h-5 sm:w-5" />
            Plan My Trip on WhatsApp
          </button>

          {/* MAYBE LATER */}
          <button
            type="button"
            onClick={onClose}
            className="w-full text-xs font-medium text-white/55 transition hover:text-white/80 sm:text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripEnquiryPopup;