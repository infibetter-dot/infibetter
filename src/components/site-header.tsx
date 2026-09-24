import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

import banner01 from "@/assets/hero/banner01.png";
import banner02 from "@/assets/hero/banner02.png";
import banner03 from "@/assets/hero/banner03.png";

type MegaMenuKey = "cases" | "charging" | "lifestyle" | null;

type MegaColumn = {
  title: string;
  image: string;
  items: string[];
  category: string;
};

const megaMenus: Record<
  Exclude<MegaMenuKey, null>,
  {
    title: string;
    image: string;
    columns: MegaColumn[];
  }
> = {
  cases: {
    title: "Cases & Bands",
    image: banner02,
    columns: [
      {
        title: "iPhone Cases",
        image: banner01,
        items: [
          "Signature Cases",
          "Stand Cases",
          "Bumper Cases",
          "Essential Cases",
        ],
        category: "iphone-cases",
      },
      {
        title: "iPad Cases",
        image: banner02,
        items: ["TypeMate", "StudioCase Air", "PivotCase"],
        category: "ipad-cases",
      },
      {
        title: "Apple Watch Bands",
        image: banner03,
        items: ["WatchBand Active", "Titanium Bands", "Sport Bands"],
        category: "watch-bands",
      },
    ],
  },

  charging: {
    title: "Charging",
    image: banner03,
    columns: [
      {
        title: "Wireless Charging",
        image: banner03,
        items: ["MagFold Qi2", "MagBank Qi2", "3-in-1 Chargers"],
        category: "wireless-chargers",
      },
      {
        title: "Power Banks",
        image: banner02,
        items: ["MagBank Slim", "MagBank Pro", "Travel Power"],
        category: "power-banks",
      },
      {
        title: "Wall Chargers",
        image: banner01,
        items: ["20W Chargers", "30W Chargers", "65W Chargers"],
        category: "chargers",
      },
      {
        title: "Charging Cables",
        image: banner03,
        items: ["USB-C", "USB-C to Lightning", "Braided Cables"],
        category: "charging-cables",
      },
    ],
  },

  lifestyle: {
    title: "Lifestyle Gear",
    image: banner01,
    columns: [
      {
        title: "Travel",
        image: banner01,
        items: ["Travel Accessories", "Tech Organizers", "Portable Gear"],
        category: "travel",
      },
      {
        title: "Desk Setup",
        image: banner03,
        items: ["Desk Accessories", "Stands", "Organization"],
        category: "desk-setup",
      },
      {
        title: "Everyday Carry",
        image: banner02,
        items: ["Everyday Gear", "Minimal Accessories", "Smart Essentials"],
        category: "everyday-carry",
      },
      {
        title: "Apple Setup",
        image: banner01,
        items: ["iPhone", "Apple Watch", "AirPods"],
        category: "apple",
      },
    ],
  },
};

export function SiteHeader() {
  const { count } = useCart();

  const [activeMenu, setActiveMenu] = useState<MegaMenuKey>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const keyword = searchValue.trim();

    if (!keyword) return;

    window.location.href = `/shop?q=${encodeURIComponent(keyword)}`;
  };

  const toggleMenu = (menu: Exclude<MegaMenuKey, null>) => {
    setSearchOpen(false);
    setMobileOpen(false);

    setActiveMenu((current) => (current === menu ? null : menu));
  };

  const activeMegaMenu =
    activeMenu === null ? null : megaMenus[activeMenu];

  return (
    <header
      ref={headerRef}
      className="
        sticky
        top-0
        z-[100]
        w-full
        bg-[#F7F8FA]/95
        py-2
        backdrop-blur-xl
        sm:py-2.5
      "
    >
      {/* TOP ANNOUNCEMENT */}

      <div
        className="
          mb-1.5
          flex
          h-4
          items-center
          justify-center
          gap-2
          text-[7px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-[#334155]
        "
      >
        <span>Free tracked shipping</span>
        <span className="text-[#94A3B8]">·</span>
        <span>30-day returns</span>
      </div>

      {/* HEADER CAPSULE */}

      <div className="relative mx-auto w-[calc(100%-24px)] max-w-[1320px]">
        <div
          className="
            relative
            flex
            h-[54px]
            items-center
            rounded-[12px]
            border
            border-[#D8DDE4]
            bg-white
            px-3
            shadow-[0_2px_12px_rgba(15,23,42,0.06)]
            sm:h-[58px]
            sm:px-4
            lg:px-5
          "
        >
          {/* LOGO */}

          <Link
            to="/"
            onClick={() => {
              setActiveMenu(null);
              setMobileOpen(false);
            }}
            className="
              shrink-0
              text-[18px]
              font-bold
              tracking-[-0.055em]
              text-[#111827]
              sm:text-[20px]
            "
          >
            INFIBETTER
          </Link>

          {/* DESKTOP NAV */}

          <nav
            className="
              absolute
              left-1/2
              hidden
              -translate-x-1/2
              items-center
              gap-7
              lg:flex
            "
          >
            <Link
              to="/shop"
              className="
                flex
                items-center
                gap-1
                whitespace-nowrap
                text-[10px]
                font-semibold
                text-[#334155]
                transition-colors
                hover:text-[#0877E8]
              "
            >
              Shop Apple accessories
              <ArrowRight size={10} strokeWidth={1.8} />
            </Link>

            <button
              type="button"
              onClick={() => toggleMenu("cases")}
              className={`
                flex
                items-center
                gap-1
                whitespace-nowrap
                text-[10px]
                font-semibold
                transition-colors
                ${
                  activeMenu === "cases"
                    ? "text-[#0877E8]"
                    : "text-[#334155]"
                }
              `}
            >
              Cases & Bands
              <ChevronDown
                size={11}
                strokeWidth={1.7}
                className={`transition-transform duration-200 ${
                  activeMenu === "cases" ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => toggleMenu("charging")}
              className={`
                flex
                items-center
                gap-1
                whitespace-nowrap
                text-[10px]
                font-semibold
                transition-colors
                ${
                  activeMenu === "charging"
                    ? "text-[#0877E8]"
                    : "text-[#334155]"
                }
              `}
            >
              Charging
              <ChevronDown
                size={11}
                strokeWidth={1.7}
                className={`transition-transform duration-200 ${
                  activeMenu === "charging" ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => toggleMenu("lifestyle")}
              className={`
                flex
                items-center
                gap-1
                whitespace-nowrap
                text-[10px]
                font-semibold
                transition-colors
                ${
                  activeMenu === "lifestyle"
                    ? "text-[#0877E8]"
                    : "text-[#334155]"
                }
              `}
            >
              Lifestyle Gear
              <ChevronDown
                size={11}
                strokeWidth={1.7}
                className={`transition-transform duration-200 ${
                  activeMenu === "lifestyle" ? "rotate-180" : ""
                }`}
              />
            </button>
          </nav>

          {/* ACTIONS */}

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="
                  hidden
                  h-8
                  w-[180px]
                  overflow-hidden
                  rounded-[7px]
                  border
                  border-[#D9DEE5]
                  bg-[#F8FAFC]
                  lg:flex
                "
              >
                <input
                  autoFocus
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(event.target.value)
                  }
                  placeholder="Search"
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-3
                    text-[9px]
                    text-[#111827]
                    outline-none
                    placeholder:text-[#94A3B8]
                  "
                />
              </form>
            )}

            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="Search"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-[#334155]
                transition
                hover:bg-[#F1F5F9]
                hover:text-[#0877E8]
              "
            >
              {searchOpen ? (
                <X size={16} strokeWidth={1.7} />
              ) : (
                <Search size={16} strokeWidth={1.7} />
              )}
            </button>

            <Link
              to="/account"
              aria-label="Account"
              className="
                hidden
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-[#334155]
                transition
                hover:bg-[#F1F5F9]
                hover:text-[#0877E8]
                sm:flex
              "
            >
              <User size={16} strokeWidth={1.7} />
            </Link>

            <Link
              to="/cart"
              aria-label="Cart"
              className="
                relative
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-[#334155]
                transition
                hover:bg-[#F1F5F9]
                hover:text-[#0877E8]
              "
            >
              <ShoppingBag size={16} strokeWidth={1.7} />

              {count > 0 && (
                <span
                  className="
                    absolute
                    right-0
                    top-0
                    flex
                    h-3.5
                    min-w-3.5
                    items-center
                    justify-center
                    rounded-full
                    bg-[#0877E8]
                    px-1
                    text-[7px]
                    font-bold
                    text-white
                  "
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen((value) => !value);
                setActiveMenu(null);
              }}
              aria-label="Menu"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-[#334155]
                lg:hidden
              "
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* MEGA MENU */}

        {activeMegaMenu && (
          <div
            className="
              absolute
              left-1/2
              top-[62px]
              hidden
              w-[calc(100%-48px)]
              max-w-[1240px]
              -translate-x-1/2
              overflow-hidden
              rounded-[14px]
              border
              border-[#DDE2E8]
              bg-white
              shadow-[0_18px_50px_rgba(15,23,42,0.14)]
              lg:block
            "
          >
            <div className="grid grid-cols-[1fr_172px] gap-2 p-3">
              {/* CATEGORY CARDS */}

              <div
                className="
                  grid
                  grid-cols-3
                  gap-5
                  p-2
                "
              >
                {activeMegaMenu.columns.map((column) => (
                  <div key={column.title} className="min-w-0">
                    <Link
                      to="/shop"
                      search={{
                        category: column.category,
                      } as never}
                      onClick={() => setActiveMenu(null)}
                      className="group block"
                    >
                      {/* DEMO IMAGE CARD */}

                      <div
                        className="
                          relative
                          mb-3
                          aspect-[2.2/1]
                          w-full
                          overflow-hidden
                          rounded-[9px]
                          border
                          border-[#E5E7EB]
                          bg-[#F1F3F5]
                        "
                      >
                        <img
                          src={column.image}
                          alt={column.title}
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-[1.04]
                          "
                        />
                      </div>

                      {/* TITLE */}

                      <div
                        className="
                          flex
                          items-center
                          gap-1
                          text-[10px]
                          font-semibold
                          text-[#111827]
                          transition-colors
                          group-hover:text-[#0877E8]
                        "
                      >
                        {column.title}
                        <ArrowRight
                          size={9}
                          className="
                            opacity-40
                            transition
                            group-hover:translate-x-0.5
                            group-hover:opacity-100
                          "
                        />
                      </div>
                    </Link>

                    {/* ITEMS */}

                    <div className="mt-3 flex flex-col gap-2">
                      {column.items.map((item) => (
                        <Link
                          key={item}
                          to="/shop"
                          search={{ q: item } as never}
                          onClick={() => setActiveMenu(null)}
                          className="
                            w-fit
                            text-[9px]
                            font-medium
                            text-[#64748B]
                            transition-colors
                            hover:text-[#0877E8]
                          "
                        >
                          {item}
                        </Link>
                      ))}
                    </div>

                    {/* VIEW ALL */}

                    <Link
                      to="/shop"
                      search={{
                        category: column.category,
                      } as never}
                      onClick={() => setActiveMenu(null)}
                      className="
                        mt-4
                        inline-flex
                        items-center
                        gap-1
                        text-[8px]
                        font-medium
                        text-[#64748B]
                        underline
                        underline-offset-2
                        transition
                        hover:text-[#0877E8]
                      "
                    >
                      View all
                      <ArrowRight size={8} />
                    </Link>
                  </div>
                ))}
              </div>

              {/* FEATURE CARD */}

              <Link
                to="/shop"
                onClick={() => setActiveMenu(null)}
                className="
                  group
                  relative
                  min-h-[250px]
                  overflow-hidden
                  rounded-[10px]
                  bg-[#E9EEF3]
                "
              >
                <img
                  src={activeMegaMenu.image}
                  alt={activeMegaMenu.title}
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-[1.03]
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/65
                    via-black/10
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    p-3.5
                  "
                >
                  <p
                    className="
                      text-[7px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-white/75
                    "
                  >
                    Explore
                  </p>

                  <h3
                    className="
                      mt-1
                      text-[15px]
                      font-semibold
                      tracking-[-0.03em]
                      text-white
                    "
                  >
                    {activeMegaMenu.title}
                  </h3>

                  <span
                    className="
                      mt-3
                      inline-flex
                      h-7
                      items-center
                      gap-2
                      rounded-[6px]
                      bg-white
                      px-3
                      text-[8px]
                      font-semibold
                      text-[#111827]
                    "
                  >
                    Shop now
                    <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* MOBILE MENU */}

        {mobileOpen && (
          <div
            className="
              absolute
              left-0
              right-0
              top-[62px]
              overflow-hidden
              rounded-[12px]
              border
              border-[#DDE2E8]
              bg-white
              shadow-[0_15px_45px_rgba(15,23,42,0.12)]
              lg:hidden
            "
          >
            <nav className="flex flex-col p-3">
              {[
                ["Shop Apple accessories", "/shop"],
                ["Cases & Bands", "/shop"],
                ["Charging", "/shop"],
                ["Lifestyle Gear", "/shop"],
              ].map(([label, to]) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="
                    rounded-[8px]
                    px-3
                    py-3
                    text-[11px]
                    font-medium
                    text-[#111827]
                    hover:bg-[#F8FAFC]
                  "
                >
                  {label}
                </Link>
              ))}

              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="
                  mt-1
                  border-t
                  border-[#E5E7EB]
                  px-3
                  py-3
                  text-[11px]
                  text-[#64748B]
                "
              >
                Account
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
