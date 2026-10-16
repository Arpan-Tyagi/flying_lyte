
import React, { useEffect, useRef, useState } from "react";
import {
  Bot, X, Send, Phone, ArrowLeft, ChevronRight,
  Loader2, RotateCcw, Sparkles, CheckCircle2,
  AlertCircle, MapPin, CalendarDays, Users,
  Wallet, UserRound, MessageCircle,
} from "lucide-react";

import PackageCard from "./PackageCard";

import {
  FLYINGLYTE_PHONE,
  getPopularDestinations,
  searchChatbotPackages,
  submitChatbotLead,
  submitChatbotMessage,
} from "./chatbotService";

const MENU_OPTIONS = [
  { id: "custom", title: "Customized Package", description: "Plan your perfect holiday" },
  { id: "destination", title: "Package for Any Particular Destination", description: "Search available packages" },
  { id: "message", title: "Any Query or Message", description: "Send your enquiry" },
  { id: "popular", title: "Popular Destinations", description: "Explore popular tours" },
];

const CUSTOM_STEPS = [
  { key: "destination", question: "Where would you like to travel?", type: "text", placeholder: "Kashmir, Goa, Bali...", Icon: MapPin },
  { key: "travelDate", question: "When are you planning to travel?", type: "date", Icon: CalendarDays },
  { key: "travellers", question: "How many people are travelling?", type: "text", placeholder: "2 Adults, 1 Child", Icon: Users },
  { key: "budget", question: "What is your approximate budget?", type: "text", placeholder: "₹30,000 per person", Icon: Wallet },
  { key: "name", question: "May I have your name?", type: "text", placeholder: "Full name", Icon: UserRound },
  { key: "phone", question: "What is your contact number?", type: "tel", placeholder: "Phone number", Icon: Phone },
  { key: "requirements", question: "Any additional requirements? (Optional)", type: "textarea", placeholder: "Hotel, activities, preferences...", Icon: MessageCircle },
];

const EMPTY_DATA = {
  destination: "",
  travelDate: "",
  travellers: "",
  budget: "",
  name: "",
  phone: "",
  requirements: "",
};

const inputClass =
  "min-w-0 w-full rounded-xl border border-white/15 bg-[#102333] px-3 py-2.5 text-xs text-white outline-none placeholder:text-gray-500 focus:border-[#E6B35C]/60";

const BotMessage = ({ children }) => (
  <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-5 text-gray-200">
    {children}
  </div>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [initialInput, setInitialInput] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const [activeOption, setActiveOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [customStep, setCustomStep] = useState(0);
  const [customData, setCustomData] = useState({ ...EMPTY_DATA });

  const [destinationInput, setDestinationInput] = useState("");
  const [packages, setPackages] = useState([]);
  const [searchReply, setSearchReply] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [popularPackages, setPopularPackages] = useState([]);

  const chatbotRef = useRef(null);
  const launcherRef = useRef(null);
  const scrollRef = useRef(null);
  const busyRef = useRef(false);
  const requestIdRef = useRef(0);

  // Reset chatbot without refreshing website
  const resetConversation = () => {
    requestIdRef.current += 1;
    busyRef.current = false;

    setHasStarted(false);
    setInitialInput("");
    setInitialMessage("");
    setActiveOption(null);
    setLoading(false);
    setError("");
    setSuccess("");

    setCustomStep(0);
    setCustomData({ ...EMPTY_DATA });

    setDestinationInput("");
    setPackages([]);
    setSearchReply("");
    setHasSearched(false);

    setMessageInput("");
    setPopularPackages([]);
  };

  // Fresh conversation on every opening
  const toggleChatbot = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      resetConversation();
      setIsOpen(true);
    }
  };

  // Close chatbot when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (chatbotRef.current?.contains(event.target)) return;
      if (launcherRef.current?.contains(event.target)) return;

      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isOpen]);

  // Scroll messages without moving bottom input
  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;

    scrollRef.current.scrollTop =
      scrollRef.current.scrollHeight;
  }, [
    isOpen, hasStarted, activeOption, customStep,
    packages, popularPackages, loading, error, success,
  ]);

  // Common API request handler
  const runRequest = async (requestFn, onSuccess, fallback) => {
    if (busyRef.current) return;

    const requestId = ++requestIdRef.current;
    busyRef.current = true;

    setLoading(true);
    setError("");

    try {
      const response = await requestFn();

      if (requestId !== requestIdRef.current) return;

      if (response?.success !== true) {
        throw new Error(response?.message || fallback);
      }

      onSuccess(response);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      const data = err?.response?.data;

      const fieldErrors = [
        "name", "destination", "phone", "message",
      ]
        .flatMap((key) => {
          const value = data?.[key];
          return Array.isArray(value)
            ? value
            : value
              ? [value]
              : [];
        })
        .join(" ");

      setError(
        fieldErrors ||
        data?.message ||
        data?.detail ||
        err.message ||
        fallback
      );
    } finally {
      if (requestId === requestIdRef.current) {
        busyRef.current = false;
        setLoading(false);
      }
    }
  };

  // Initial message reveals menu
  const handleInitialSubmit = (e) => {
    e.preventDefault();

    const message = initialInput.trim();
    if (!message) return;

    setInitialMessage(message);
    setInitialInput("");
    setHasStarted(true);
  };

  // Select one of four options
  const selectOption = (optionId) => {
    resetConversation();
    setActiveOption(optionId);

    if (optionId === "popular") {
      loadPopularDestinations();
    }
  };

  // Option 4: Popular destinations
  const loadPopularDestinations = () => {
    runRequest(
      getPopularDestinations,
      (response) => {
        setPopularPackages(
          Array.isArray(response.data) ? response.data : []
        );
      },
      "Unable to load popular destinations."
    );
  };

  // Option 2: Destination search
  const handleSearch = (e) => {
    e.preventDefault();

    const destination = destinationInput.trim();
    if (!destination || busyRef.current) return;

    setPackages([]);
    setSearchReply("");
    setHasSearched(true);

    runRequest(
      () => searchChatbotPackages(destination),
      (response) => {
        setPackages(
          Array.isArray(response.packages)
            ? response.packages
            : []
        );
        setSearchReply(response.reply || "");
      },
      "Unable to search packages."
    );
  };

  // Option 3: Message API
  const handleMessageSubmit = (e) => {
    e.preventDefault();

    const message = messageInput.trim();
    if (!message || busyRef.current) return;

    runRequest(
      () => submitChatbotMessage(message),
      (response) => {
        setSuccess(
          response.message ||
          "Your message has been submitted successfully."
        );
        setMessageInput("");
      },
      "Unable to submit message."
    );
  };

  // Option 1: Customized package
  const handleCustomNext = (e) => {
    e.preventDefault();
    if (busyRef.current) return;

    const step = CUSTOM_STEPS[customStep];
    const value = String(customData[step.key] || "").trim();

    setError("");

    if (!value && step.key !== "requirements") {
      setError("Please complete this field.");
      return;
    }

    if (
      step.key === "phone" &&
      !/^\+?[0-9]{10,15}$/.test(value)
    ) {
      setError("Enter a valid phone number (10–15 digits).");
      return;
    }

    if (step.key === "travelDate") {
      const today = new Date();
      const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      if (value < localToday) {
        setError("Please select a future travel date.");
        return;
      }
    }

    if (customStep < CUSTOM_STEPS.length - 1) {
      setCustomStep((prev) => prev + 1);
      return;
    }

    const payload = {
      name: customData.name.trim(),
      destination: customData.destination.trim(),
      phone: customData.phone.trim(),
      message: [
        `Travel Date: ${customData.travelDate}`,
        `Travellers: ${customData.travellers}`,
        `Budget: ${customData.budget}`,
        `Additional Requirements: ${
          customData.requirements.trim() || "None"
        }`,
      ].join("\n"),
    };

    runRequest(
      () => submitChatbotLead(payload),
      (response) => {
        setSuccess(
          response.message ||
          "Your enquiry has been submitted successfully."
        );
      },
      "Unable to submit enquiry."
    );
  };

  const handleBack = () => {
    setError("");

    if (customStep > 0) {
      setCustomStep((prev) => prev - 1);
    } else {
      resetConversation();
    }
  };

  const step = CUSTOM_STEPS[customStep];
  const StepIcon = step.Icon;

  return (
    <>
      {/* Floating chatbot icon above WhatsApp */}
      <button
        ref={launcherRef}
        type="button"
        onClick={toggleChatbot}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        aria-expanded={isOpen}
        className="
          fixed bottom-[76px] right-3 z-[60]
          flex h-10 w-10 items-center justify-center
          rounded-full border border-[#E6B35C]/45
          bg-[#06111d] text-[#E6B35C]
          shadow-[0_6px_22px_rgba(0,0,0,0.35)]
          transition hover:bg-[#10263b]
          sm:bottom-[88px] sm:right-5 sm:h-11 sm:w-11
          md:bottom-[104px] md:right-6 md:h-12 md:w-12
        "
      >
        {isOpen ? <X size={20} /> : <Bot size={22} />}
      </button>

      {isOpen && (
        <section
          ref={chatbotRef}
          role="dialog"
          aria-label="FlyingLyte Travel Assistant"
          className="
            fixed bottom-[126px] right-3 z-[60]
            flex min-h-0 w-[calc(100vw-24px)]
            max-w-[320px] flex-col overflow-hidden
            rounded-2xl border border-[#E6B35C]/25
            bg-[#071522] text-white
            shadow-[0_18px_55px_rgba(0,0,0,0.48)]
            sm:bottom-[144px] sm:right-5
            sm:max-w-[340px]
            md:bottom-[160px] md:right-6
          "
          style={{
            height: "min(480px, calc(100dvh - 145px))",
            maxHeight: "calc(100dvh - 145px)",
          }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#06111d] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6B35C]/30 bg-[#E6B35C]/10">
              <Bot size={19} className="text-[#E6B35C]" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-[#E6B35C]">
                FlyingLyte Travel
              </h2>
              <p className="text-[10px] text-gray-400">
                Your Travel Assistant
              </p>
            </div>

            <button
              type="button"
              title="New Conversation"
              onClick={resetConversation}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              title="Close"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"
            >
              <X size={17} />
            </button>
          </div>

          {/* Scrollable chat messages */}
          <div
            ref={scrollRef}
            className="
              min-h-0 flex-1 space-y-3
              overflow-y-auto overscroll-contain
              px-2.5 py-3
              [scrollbar-width:thin]
            "
          >
            {/* Initial greeting */}
            {!activeOption && (
              <>
                <BotMessage>
                  <span className="font-semibold text-white">
                    Hello! Namaste 🙏
                  </span>
                  <span className="mt-1 block">
                    Welcome to FlyingLyte Travel! ✈️
                    How can we help you?
                  </span>
                </BotMessage>

                {hasStarted && (
                  <>
                    <div className="ml-auto max-w-[88%] break-words rounded-xl rounded-tr-sm bg-[#E6B35C] px-3 py-2 text-xs text-[#06111d]">
                      {initialMessage}
                    </div>

                    <BotMessage>
                      Please select an option so I can
                      assist you better.
                    </BotMessage>

                    <div className="rounded-xl border border-[#E6B35C]/20 bg-[#E6B35C]/5 p-2.5">
                      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#E6B35C]">
                        <Sparkles size={14} />
                        Please select an option
                      </p>

                      <div className="space-y-1.5">
                        {MENU_OPTIONS.map((option, index) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => selectOption(option.id)}
                            className="
                              flex w-full min-w-0 items-center
                              gap-2 rounded-lg border border-white/10
                              bg-[#102333] px-2.5 py-2 text-left
                              transition hover:border-[#E6B35C]/40
                              hover:bg-[#173044]
                            "
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E6B35C]/15 text-[11px] font-bold text-[#E6B35C]">
                              {index + 1}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-[11px] font-semibold leading-4">
                                {option.title}
                              </span>
                              <span className="block text-[10px] text-gray-400">
                                {option.description}
                              </span>
                            </span>

                            <ChevronRight
                              size={14}
                              className="shrink-0 text-[#E6B35C]"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Option 1 - Customized Package */}
            {activeOption === "custom" && (
              <>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading || Boolean(success)}
                    className="flex items-center gap-1 text-[11px] text-[#E6B35C] disabled:opacity-40"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>

                  {!success && (
                    <span className="text-[10px] text-gray-400">
                      Step {customStep + 1}/{CUSTOM_STEPS.length}
                    </span>
                  )}
                </div>

                {!success && (
                  <>
                    <div className="h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#E6B35C]"
                        style={{
                          width: `${
                            ((customStep + 1) /
                              CUSTOM_STEPS.length) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <BotMessage>
                      <span className="mb-1 flex items-center gap-1.5 text-[10px] text-[#E6B35C]">
                        <StepIcon size={14} />
                        Customized Package
                      </span>

                      <span className="text-white">
                        {step.question}
                      </span>
                    </BotMessage>

                    <form
                      key={step.key}
                      onSubmit={handleCustomNext}
                      className="space-y-2.5"
                    >
                      {step.type === "textarea" ? (
                        <textarea
                          value={customData[step.key]}
                          onChange={(e) =>
                            setCustomData((prev) => ({
                              ...prev,
                              [step.key]: e.target.value,
                            }))
                          }
                          placeholder={step.placeholder}
                          rows={3}
                          maxLength={1000}
                          className={`${inputClass} resize-none`}
                        />
                      ) : (
                        <input
                          type={step.type}
                          value={customData[step.key]}
                          onChange={(e) =>
                            setCustomData((prev) => ({
                              ...prev,
                              [step.key]: e.target.value,
                            }))
                          }
                          placeholder={step.placeholder}
                          maxLength={
                            step.key === "phone" ? 16 : undefined
                          }
                          required
                          className={`${inputClass} [color-scheme:dark]`}
                        />
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#E6B35C] text-xs font-bold text-[#06111d] disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : customStep === CUSTOM_STEPS.length - 1 ? (
                          <Send size={15} />
                        ) : (
                          <ChevronRight size={16} />
                        )}

                        {loading
                          ? "Submitting..."
                          : customStep === CUSTOM_STEPS.length - 1
                            ? "Submit Enquiry"
                            : "Continue"}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}

            {/* Option 2 - Search Destination */}
            {activeOption === "destination" && (
              <>
                <BackButton
                  onClick={resetConversation}
                  disabled={loading}
                />

                <BotMessage>
                  Which destination would you like to explore?
                  <span className="mt-1 block text-[10px] text-gray-400">
                    Kashmir, Goa, Manali, Dubai...
                  </span>
                </BotMessage>

                {hasSearched && !loading && (
                  <>
                    {searchReply && (
                      <BotMessage>{searchReply}</BotMessage>
                    )}

                    {packages.length > 0 && (
                      <div className="space-y-2.5">
                        {packages.map((pkg, index) => (
                          <PackageCard
                            key={pkg.id || index}
                            item={pkg}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Option 3 - Message */}
            {activeOption === "message" && (
              <>
                <BackButton
                  onClick={resetConversation}
                  disabled={loading}
                />

                <BotMessage>
                  Please type your query or message.
                  Our travel team will assist you.
                </BotMessage>
              </>
            )}

            {/* Option 4 - Popular Destinations */}
            {activeOption === "popular" && (
              <>
                <BackButton
                  onClick={resetConversation}
                  disabled={loading}
                />

                <BotMessage>
                  Explore our popular destinations! 🌍
                  Select a tour to view details or call us.
                </BotMessage>

                {popularPackages.length > 0 && (
                  <div className="space-y-2.5">
                    {popularPackages.map((item, index) => (
                      <PackageCard
                        key={item.package_id || index}
                        item={item}
                      />
                    ))}
                  </div>
                )}

                {!loading &&
                  !error &&
                  popularPackages.length === 0 && (
                    <BotMessage>
                      No popular destinations available right now.
                    </BotMessage>
                  )}

                {!loading && error && (
                  <button
                    type="button"
                    onClick={loadPopularDestinations}
                    className="w-full rounded-lg border border-[#E6B35C]/30 p-2 text-xs text-[#E6B35C]"
                  >
                    Retry Destinations
                  </button>
                )}
              </>
            )}

            {/* Loader */}
            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Loader2
                  size={15}
                  className="animate-spin text-[#E6B35C]"
                />
                Please wait...
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex gap-2 rounded-lg border border-red-400/25 bg-red-500/10 p-2.5 text-[11px] text-red-300"
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-3 text-center">
                <CheckCircle2
                  size={25}
                  className="mx-auto mb-2 text-green-400"
                />

                <p className="text-xs font-semibold leading-5">
                  {success}
                </p>

                <button
                  type="button"
                  onClick={resetConversation}
                  className="mt-3 rounded-lg bg-[#E6B35C] px-3 py-2 text-[11px] font-bold text-[#06111d]"
                >
                  Start New Conversation
                </button>
              </div>
            )}
          </div>

          {/* Bottom fixed initial input */}
          {!activeOption && !hasStarted && (
            <form
              onSubmit={handleInitialSubmit}
              className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-[#06111d] px-3 py-2.5"
            >
              <input
                type="text"
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
                placeholder="Ask something..."
                maxLength={500}
                className={`${inputClass} flex-1`}
              />

              <button
                type="submit"
                disabled={!initialInput.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6B35C] text-[#06111d] disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          )}

          {/* Bottom fixed destination input */}
          {activeOption === "destination" && (
            <form
              onSubmit={handleSearch}
              className="flex shrink-0 gap-2 border-t border-white/10 bg-[#06111d] px-3 py-2.5"
            >
              <input
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                placeholder="Enter destination..."
                maxLength={100}
                required
                className={`${inputClass} flex-1`}
              />

              <button
                type="submit"
                disabled={loading || !destinationInput.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6B35C] text-[#06111d] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          )}

          {/* Bottom fixed message textarea */}
          {activeOption === "message" && !success && (
            <form
              onSubmit={handleMessageSubmit}
              className="shrink-0 space-y-2 border-t border-white/10 bg-[#06111d] px-3 py-2.5"
            >
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message here..."
                rows={2}
                maxLength={1000}
                required
                className={`${inputClass} max-h-28 resize-none`}
              />

              <button
                type="submit"
                disabled={loading || !messageInput.trim()}
                className="flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-[#E6B35C] text-xs font-bold text-[#06111d] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="shrink-0 border-t border-white/10 bg-[#06111d] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-400">
                FlyingLyte Travel
              </span>

              <a
                href={`tel:${FLYINGLYTE_PHONE}`}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#E6B35C]"
              >
                <Phone size={12} />
                Call Support
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

const BackButton = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex w-fit items-center gap-1 text-[11px] font-semibold text-[#E6B35C] disabled:opacity-40"
  >
    <ArrowLeft size={14} />
    Back to Menu
  </button>
);

export default Chatbot;
