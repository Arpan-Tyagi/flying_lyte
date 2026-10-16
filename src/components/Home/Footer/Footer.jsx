import React from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { footerLinks } from "./footerLinks";

import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const paymentMethods = [
    { name: "Google Pay", image: "/images/payments/gpay.jpeg" },
    { name: "Maestro", image: "/images/payments/maestro.jpeg" },
    { name: "Mastercard", image: "/images/payments/mastercard.jpeg" },
    { name: "Online Shopping", image: "/images/payments/onlineshoping.jpeg" },
    { name: "PayPal", image: "/images/payments/paypal.jpeg" },
    { name: "Visa", image: "/images/payments/visa.jpeg" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <img
               src="/images/flying_logo.png"
               alt="FlyingLyte Logo"
               className="w-42 md:w-52 cursor-pointer"
               onClick={() => navigate("/")}
             loading="lazy" />

            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              FlyingLyte helps you book flights, hotels, and holiday packages at
              the best prices with a fast and secure experience.
            </p>

            {/* Contact */}
            <div className="mt-4 space-y-2 text-sm">
              {/* Address */}
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>
                  316, Basement, Gagan Vihar,Nearest Metro : Preet Vihar
                  Delhi-110051
                </span>
              </div>

              {/* Email */}
              <a
                href="mailto:info@flyinglyte.com"
                className="flex items-center gap-2 hover:text-(--gold-soft) active:text-(--gold-soft) transition"
              >
                <Mail size={16} /> info@flyinglyte.com
              </a>

              {/* Phone Call */}
              <a
                href="tel:+919667455591"
                className="flex items-center gap-2 hover:text-(--gold-main) active:text-(--gold-main) transition"
              >
                <Phone size={16} /> +91 9667455591
              </a>

              {/* WhatsApp Chat */}
              <a
                href="https://wa.me/919667455591"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-(--gold-main) active:text-(--gold-main) transition"
              >
                <Phone size={16} /> Chat on WhatsApp
              </a>


              {/* GST Number */}
              <div className="flex items-center gap-2 text-gray-400">
                <span className="font-medium text-gray-300">GSTIN:</span>
                <span>07AALFF0579Q1ZP</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold capitalize mb-4">
                {section}
              </h3>

              <ul className="space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="hover:text-white active:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


        {/* We Accept */}
        <div className="flex items-center justify-end gap-2 mb-5">
          <span className="text-sm font-semibold text-white mr-1">
            WE ACCEPT:
          </span>

          {paymentMethods.map((payment) => (
            <div
              key={payment.name}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden"
            >
              <img
                src={payment.image}
                alt={payment.name}
                className="w-full h-full object-contain p-1"
               loading="lazy" />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} FlyingLyte. All rights reserved.
            </p>

            {/* Payment + Social Icons */}
            <div className="flex flex-col items-center md:items-end gap-4">

              {/* Social Icons */}
              <div className="flex gap-5">
                <a
                  href="https://www.facebook.com/Flying-Lyte/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="hover:text-white active:text-white transition"
                >
                  <Facebook size={18} />
                </a>

                <a
                  href="https://www.instagram.com/flying_lyte/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-white active:text-white transition"
                >
                  <Instagram size={18} />
                </a>
              </div>

            </div>
          </div>

          <div className="text-center text-xs mt-5">
            <p>
              Designed & Developed By
              <a
                href="https://www.infrivasolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="pl-1 hover:text-white transition"
              >
                Infriva Solutions
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
