import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "/images/flying_logo.png";
import { useAuthStore } from "../../store/authStore";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Packages", path: "/packages" },
  { name: "Flights", path: "/flights" },
  { name: "Hotels", path: "/hotels" },
  { name: "Contact", path: "/contact" },
  { name: "Blogs", path: "/blogs" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuthStore();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleReloadNavigate = (path, state = null) => {
    setMenuOpen(false);
    setProfileOpen(false);

    // React Router state wali navigation
    // Hotels ke liye reload nahi karenge
    if (state) {
      navigate(path, { state });
      return;
    }

    // Baaki normal pages ki existing reload functionality same
    window.location.assign(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNavClick = (e, item) => {
    e.preventDefault();

    // HOTELS
    // if (item.name === "Hotels") {
    //   setMenuOpen(false);
    //   setProfileOpen(false);

    //   navigate("/", {
    //     state: {
    //       searchTab: "hotels",
    //     },
    //   });

    //   return;
    // }

    // HOME
    if (item.name === "Home") {
      setMenuOpen(false);
      setProfileOpen(false);

      navigate("/", {
        replace: true,
        state: null,
      });

      return;
    }

    handleReloadNavigate(item.path);
  };

  // const isActive = (path) => {
  //   // Navbar Hotels se Home + Hotels tab open hua hai
  //   if (
  //     path === "/hotels" &&
  //     location.pathname === "/" &&
  //     location.state?.searchTab === "hotels"
  //   ) {
  //     return true;
  //   }

  //   // Home tab
  //   if (path === "/") {
  //     return (
  //       location.pathname === "/" && location.state?.searchTab !== "hotels"
  //     );
  //   }

  //   return (
  //     location.pathname === path || location.pathname.startsWith(`${path}/`)
  //   );
  // };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const navWrapperStyle = scrolled
    ? "bg-[#06111d]/90 border-white/15 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
    : "bg-[#06111d]/75 border-white/10 shadow-[0_16px_45px_rgba(0,0,0,0.25)]";

  return (
    <nav className="fixed inset-x-0 top-2 md:top-4 z-50 transition-all duration-300">
      <div className="mx-auto w-[calc(100%-16px)] max-w-7xl sm:w-[94%]">
        <div
          className={`relative overflow-visible rounded-3xl border px-3 py-1.5 backdrop-blur-2xl transition-all duration-300 sm:px-4 md:rounded-full md:px-6 md:py-2 ${navWrapperStyle}`}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[28px] md:rounded-full bg-[radial-gradient(circle_at_15%_20%,rgba(230,179,92,0.18),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.08),transparent_24%)]" />

          <div className="relative flex min-w-0 items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center"
              aria-label="Go to home"
            >
              <img
                src={logo}
                alt="FlyingLyte"
                className="h-9 w-auto max-w-[145px] select-none object-contain drop-shadow-[0_10px_20px_rgba(230,179,92,0.18)] transition duration-300 group-hover:scale-[1.03] sm:h-10 sm:max-w-[165px] md:h-12 md:max-w-[210px]"
                loading="lazy" />
            </button>

            {/* Desktop Menu */}
            <ul className="hidden lg:flex items-center gap-1 rounded-full border border-white/10 bg-white/4 p-1">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`relative block rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${isActive(item.path)
                      ? "bg-[#E6B35C]/15 text-[#E6B35C] shadow-[inset_0_0_0_1px_rgba(230,179,92,0.25)]"
                      : "text-gray-300 hover:bg-white/5 hover:text-[#E6B35C]"
                      }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop Auth */}
            <div className="relative hidden lg:flex items-center gap-3">
              {!user ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="rounded-xl bg-linear-to-r from-[#E6B35C] to-[#F7CF75] px-5 py-2 text-sm font-bold text-black shadow-[0_10px_28px_rgba(230,179,92,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(230,179,92,0.45)]"
                  >
                    Register
                  </button>
                </>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-3 rounded-full border border-[#E6B35C]/25 bg-[#E6B35C]/10 px-3 py-2 text-[#E6B35C] transition hover:bg-[#E6B35C]/15"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E6B35C] text-sm font-black text-black">
                      {(user?.name || user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <span className="max-w-27.5  truncate text-sm font-bold">
                      Hi, {user?.name?.split(" ")[0] || "User"}
                    </span>

                    <span
                      className={`text-xs transition ${profileOpen ? "rotate-180" : ""
                        }`}
                    >
                      ▼
                    </span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-4 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#07101b]/95 p-2 text-sm shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                      <button
                        type="button"
                        onClick={() => navigate("/bookings")}
                        className="block w-full rounded-xl px-4 py-3 text-left font-semibold text-gray-200 transition hover:bg-white/7 hover:text-[#E6B35C]"
                      >
                        My Bookings
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full rounded-xl px-4 py-3 text-left font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Button */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-[#E6B35C]/15 hover:text-[#E6B35C] lg:hidden"
            >
              {menuOpen ? <HiX size={26} /> : <HiMenu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="
  mt-2
  max-h-[calc(100dvh-82px)]
  overflow-y-auto
  overscroll-contain
  touch-pan-y
  rounded-[20px]
  border border-white/10
  bg-[#06111d]/97
  p-2.5
  pb-[calc(env(safe-area-inset-bottom)+10px)]
  text-gray-200
  shadow-[0_20px_55px_rgba(0,0,0,0.58)]
  backdrop-blur-2xl
  [-webkit-overflow-scrolling:touch]
  lg:hidden
"
          >
            <div className="mb-2.5 rounded-xl border border-[#E6B35C]/15 bg-[#E6B35C]/8 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E6B35C]">
                    FlyingLyte
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-gray-400">
                    Explore • Book • Travel
                  </p>
                </div>

                <span className="text-base text-[#E6B35C]">
                  ✦
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">

              {navLinks.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  // onClick={() => {
                  //   if (item.name === "Hotels") {
                  //     handleReloadNavigate("/", {
                  //       searchTab: "hotels",
                  //     });
                  //   } else {
                  //     handleReloadNavigate(item.path);
                  //   }
                  // }}


                  onClick={() => {
                    handleReloadNavigate(item.path);
                  }}
                  className={`group flex min-h-10 items-center justify-between rounded-xl border px-3.5 py-2 text-left text-[13px] font-semibold transition-all duration-200 ${isActive(item.path)
                    ? "border-[#E6B35C]/60 bg-[#E6B35C] text-black shadow-[0_6px_18px_rgba(230,179,92,0.18)]"
                    : "border-white/5 bg-white/[0.035] text-gray-200 hover:border-[#E6B35C]/20 hover:bg-white/[0.07] hover:text-[#E6B35C]"
                    }`}
                >
                  {item.name}
                  <span className="text-sm opacity-70 transition-transform duration-200 group-hover:translate-x-0.5">
                    ›
                  </span>
                </button>
              ))}
            </div>

            <div className="my-2.5 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

            {!user ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/8"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="rounded-xl bg-linear-to-r from-[#E6B35C] to-[#F7CF75] px-4 py-2.5 text-sm font-bold text-black shadow-[0_10px_28px_rgba(230,179,92,0.3)]"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E6B35C] font-black text-black">
                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#E6B35C]">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {user?.email || "Welcome back"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/bookings")}
                  className="block w-full rounded-2xl bg-[#E6B35C]/10 px-4 py-3 text-left text-sm font-semibold text-[#E6B35C] transition hover:bg-[#E6B35C]/15"
                >
                  My Bookings
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-2xl bg-red-500/10 px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/15"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
