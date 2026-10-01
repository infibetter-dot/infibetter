import { Link } from "@tanstack/react-router";
import CartDrawer from "@/components/cart/CartDrawer";
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
import { supabase } from "@/integrations/supabase/client";

import banner01 from "@/assets/hero/banner01.png";
import banner02 from "@/assets/hero/banner02.png";
import banner03 from "@/assets/hero/banner03.png";

type MegaMenuKey = "cases" | "charging" | "lifestyle" | null;

type MegaItem = {
  id: string;
  category_id: string | null;
  label_override: string | null;
  sort_order: number;
  is_visible: boolean;
  categories: { id: string; name: string; slug: string; parent_id: string | null } | null;
};

type MegaGroup = {
  id: string;
  section_id: string;
  title: string;
  category_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  mega_menu_items: MegaItem[];
  category: { id: string; name: string; slug: string; parent_id: string | null } | null;
};

type MegaSection = {
  id: string;
  menu_key: Exclude<MegaMenuKey, null>;
  title: string;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  mega_menu_groups: MegaGroup[];
};

const fallbackImages = [banner01, banner02, banner03];

function getSectionFallback(menuKey: string) {
  if (menuKey === "cases") return banner02;
  if (menuKey === "charging") return banner03;
  return banner01;
}

function getGroupFallback(menuKey: string, index: number) {
  if (menuKey === "charging") {
    return [banner03, banner02, banner01, banner03][index] ?? banner03;
  }
  if (menuKey === "cases") {
    return [banner01, banner02, banner03][index] ?? banner01;
  }
  return fallbackImages[index % fallbackImages.length];
}

function getMegaGridColumns(groupCount: number) {
  return Math.max(1, Math.min(groupCount, 4));
}

export function SiteHeader() {
  const { count } = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [activeMenu, setActiveMenu] =
    useState<MegaMenuKey>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuLevel, setMobileMenuLevel] = useState<
    "root" | Exclude<MegaMenuKey, null>
  >("root");
  const [megaMenus, setMegaMenus] = useState<MegaSection[]>([]);

  const loadMegaMenus = async () => {
    const { data, error } = await supabase
      .from("mega_menu_sections")
      .select(`
        id, menu_key, title, image_url, sort_order, is_visible,
        mega_menu_groups (
          id, section_id, title, category_id, image_url, sort_order, is_visible,
          categories ( id, name, slug, parent_id ),
          mega_menu_items (
            id, category_id, label_override, sort_order, is_visible,
            categories ( id, name, slug, parent_id )
          )
        )
      `)
      .eq("is_visible", true)
      .order("sort_order");

    if (error) {
      console.error("Mega Menu load error:", error);
      return;
    }

    const normalized = ((data ?? []) as any[]).map((section) => ({
      ...section,
      mega_menu_groups: [...(section.mega_menu_groups ?? [])]
        .filter((group: any) => group.is_visible)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((group: any) => ({
          ...group,
          category: group.categories ?? null,
          mega_menu_items: [...(group.mega_menu_items ?? [])]
            .filter((item: any) => item.is_visible && item.category_id)
            .sort((a: any, b: any) => a.sort_order - b.sort_order),
        })),
    }));

    setMegaMenus(normalized as MegaSection[]);
  };

  useEffect(() => {
    loadMegaMenus();
    const handleMegaMenuUpdated = () => loadMegaMenus();
    window.addEventListener("infibetter:mega-menu-updated", handleMegaMenuUpdated);
    return () => {
      window.removeEventListener("infibetter:mega-menu-updated", handleMegaMenuUpdated);
    };
  }, []);

  const headerRef =
    useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * CLICK OUTSIDE
   * ============================================================
   */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(
          event.target as Node,
        )
      ) {
        setActiveMenu(null);
        setSearchOpen(false);
        setMobileOpen(false);
        setMobileMenuLevel("root");
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /*
   * ============================================================
   * ESC
   * ============================================================
   */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setSearchOpen(false);
        setMobileOpen(false);
        setMobileMenuLevel("root");
        setCartOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /*
   * ============================================================
   * OPEN CART FROM PRODUCT PAGE
   * ============================================================
   *
   * Product detail phát:
   *
   * window.dispatchEvent(
   *   new Event("infibetter:open-cart")
   * )
   *
   * Header nhận event này và mở CartDrawer.
   */

  useEffect(() => {
    const handleOpenCart = () => {
      setCartOpen(true);
    };

    window.addEventListener(
      "infibetter:open-cart",
      handleOpenCart,
    );

    return () => {
      window.removeEventListener(
        "infibetter:open-cart",
        handleOpenCart,
      );
    };
  }, []);

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const keyword = searchValue.trim();

    if (!keyword) return;

    window.location.href = `/shop?q=${encodeURIComponent(
      keyword,
    )}`;
  };

  /*
   * ============================================================
   * MEGA MENU
   * ============================================================
   */

  const toggleMenu = (
    menu: Exclude<MegaMenuKey, null>,
  ) => {
    setSearchOpen(false);
    setMobileOpen(false);

    setActiveMenu((current) =>
      current === menu ? null : menu,
    );
  };

  const activeMegaMenu =
    activeMenu === null
      ? null
      : megaMenus.find((menu) => menu.menu_key === activeMenu) ?? null;

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

        <span className="text-[#94A3B8]">
          ·
        </span>

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
              gap-1
              rounded-full
              border
              border-[#D6DCE5]
              bg-[#F6F8FB]
              p-1
              shadow-[0_2px_10px_rgba(15,23,42,0.06)]
              lg:flex
            "
          >
            <Link
              to="/shop"
              className="
                flex
                items-center
                gap-1.5
                whitespace-nowrap
                rounded-full
                px-3.5
                py-2
                text-[11px]
                font-semibold
                tracking-[-0.01em]
                text-[#334155]
                transition-all
                hover:bg-white
                hover:text-[#111827]
                hover:shadow-[0_1px_4px_rgba(15,23,42,0.06)]
              "
            >
              Shop Apple accessories

              <ArrowRight
                size={10}
                strokeWidth={1.8}
              />
            </Link>

            <button
              type="button"
              onClick={() =>
                toggleMenu("cases")
              }
              className={`
                flex
                items-center
                gap-1.5
                whitespace-nowrap
                rounded-full
                px-3.5
                py-2
                text-[11px]
                font-semibold
                tracking-[-0.01em]
                transition-all
                ${
                  activeMenu === "cases"
                    ? "bg-[#111827] text-white shadow-[0_2px_7px_rgba(15,23,42,0.16)]"
                    : "text-[#334155]"
                }
              `}
            >
              Cases & Bands

              <ChevronDown
                size={12}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  activeMenu === "cases"
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                toggleMenu("charging")
              }
              className={`
                flex
                items-center
                gap-1.5
                whitespace-nowrap
                rounded-full
                px-3.5
                py-2
                text-[11px]
                font-semibold
                tracking-[-0.01em]
                transition-all
                ${
                  activeMenu === "charging"
                    ? "bg-[#111827] text-white shadow-[0_2px_7px_rgba(15,23,42,0.16)]"
                    : "text-[#334155]"
                }
              `}
            >
              Charging

              <ChevronDown
                size={12}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  activeMenu === "charging"
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                toggleMenu("lifestyle")
              }
              className={`
                flex
                items-center
                gap-1.5
                whitespace-nowrap
                rounded-full
                px-3.5
                py-2
                text-[11px]
                font-semibold
                tracking-[-0.01em]
                transition-all
                ${
                  activeMenu === "lifestyle"
                    ? "bg-[#111827] text-white shadow-[0_2px_7px_rgba(15,23,42,0.16)]"
                    : "text-[#334155]"
                }
              `}
            >
              Lifestyle Gear

              <ChevronDown
                size={12}
                strokeWidth={2}
                className={`transition-transform duration-200 ${
                  activeMenu === "lifestyle"
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
          </nav>

          {/* ACTIONS */}

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            {searchOpen && (
              <form
                onSubmit={
                  handleSearchSubmit
                }
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
                    setSearchValue(
                      event.target.value,
                    )
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

            {/* SEARCH */}

            <button
              type="button"
              onClick={() =>
                setSearchOpen(
                  (value) => !value,
                )
              }
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
                <X
                  size={16}
                  strokeWidth={1.7}
                />
              ) : (
                <Search
                  size={16}
                  strokeWidth={1.7}
                />
              )}
            </button>

            {/* ACCOUNT */}

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
              <User
                size={16}
                strokeWidth={1.7}
              />
            </Link>

            {/* CART */}

            <button
              type="button"
              onClick={() =>
                setCartOpen(true)
              }
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
              <ShoppingBag
                size={16}
                strokeWidth={1.7}
              />

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
                  {count > 99
                    ? "99+"
                    : count}
                </span>
              )}
            </button>

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => {
                setMobileOpen((value) => {
                  const next = !value;
                  if (!next) setMobileMenuLevel("root");
                  return next;
                });
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
              {mobileOpen ? (
                <X size={17} />
              ) : (
                <Menu size={17} />
              )}
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
              w-[calc(100%-28px)]
              max-w-[1280px]
              -translate-x-1/2
              overflow-hidden
              rounded-[18px]
              border
              border-[#D9DEE7]
              bg-white
              shadow-[0_24px_60px_rgba(15,23,42,0.12)]
              lg:block
            "
          >
            <div className="grid grid-cols-[1fr_168px] gap-3 p-3.5">
              {/* CATEGORY CARDS */}

              <div
                className="
                  grid
                  gap-x-3.5
                  gap-y-4
                  p-1
                "
                style={{
                  gridTemplateColumns: `repeat(${getMegaGridColumns(
                    activeMegaMenu.mega_menu_groups.length,
                  )}, minmax(0, 1fr))`,
                }}
              >
                {activeMegaMenu.mega_menu_groups.map(
                  (column, columnIndex) => (
                    <div
                      key={column.title}
                      className="min-w-0"
                    >
                      <Link
                        to="/shop"
                        search={
                          {
                            category:
                              column.category?.slug ?? undefined,
                          } as never
                        }
                        onClick={() =>
                          setActiveMenu(
                            null,
                          )
                        }
                        className="group block"
                      >
                        <div
                          className="
                            relative
                            mb-2.5
                            aspect-[2.85/1]
                            w-[76%]
                            overflow-hidden
                            rounded-[11px]
                            border
                            border-[#E1E5EA]
                            shadow-[0_5px_16px_rgba(15,23,42,0.10)]
                            bg-[#F1F3F5]
                          "
                        >
                          <img
                            src={column.image_url || getGroupFallback(activeMegaMenu.menu_key, columnIndex)}
                            alt={column.title}
                            className="
                              h-full
                              w-full
                              object-cover
                              drop-shadow-[0_3px_8px_rgba(15,23,42,0.08)]
                              transition-transform
                              duration-500
                              group-hover:scale-[1.04]
                            "
                          />
                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-1
                            text-[12px]
                            font-semibold
                            tracking-[-0.02em]
                            text-[#171A1F]
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
                        {column.mega_menu_items.map((item) => {
                          const itemLabel =
                            item.label_override ||
                            item.categories?.name ||
                            "Category";
                          const itemSlug = item.categories?.slug;

                          return (
                            <Link
                              key={item.id}
                              to="/shop"
                              search={
                                itemSlug
                                  ? ({ category: itemSlug } as never)
                                  : undefined
                              }
                              onClick={() => setActiveMenu(null)}
                              className="
                                w-fit
                                rounded-[6px]
                                py-0.5
                                text-[10px]
                                font-medium
                                leading-5
                                text-[#667085]
                                transition-all
                                hover:bg-[#F5F7FA]
                                hover:px-1.5
                                hover:text-[#111827]
                              "
                            >
                              {itemLabel}
                            </Link>
                          );
                        })}
                      </div>

                      {/* VIEW ALL */}

                      <Link
                        to="/shop"
                        search={
                          {
                            category:
                              column.category?.slug ?? undefined,
                          } as never
                        }
                        onClick={() =>
                          setActiveMenu(
                            null,
                          )
                        }
                        className="
                          mt-3
                          inline-flex
                          items-center
                          gap-1.5
                          text-[9px]
                          font-semibold
                          text-[#475467]
                          transition
                          hover:text-[#111827]
                        "
                      >
                        View all

                        <ArrowRight size={8} />
                      </Link>
                    </div>
                  ),
                )}
              </div>

              {/* FEATURE CARD */}

              <Link
                to="/shop"
                search={
                  activeMegaMenu.mega_menu_groups[0]?.category?.slug
                    ? ({
                        category:
                          activeMegaMenu.mega_menu_groups[0].category?.slug,
                      } as never)
                    : undefined
                }
                onClick={() =>
                  setActiveMenu(null)
                }
                className="
                  group
                  relative
                  min-h-[218px]
                  overflow-hidden
                  rounded-[14px]
                  border
                  border-[#E3E7EC]
                  bg-[#E9EEF3]
                  shadow-[0_8px_22px_rgba(15,23,42,0.12)]
                "
              >
                <img
                  src={activeMegaMenu.image_url || getSectionFallback(activeMegaMenu.menu_key)}
                  alt={
                    activeMegaMenu.title
                  }
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
                    p-3
                  "
                >
                  <p
                    className="
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-white/75
                    "
                  >
                    Explore
                  </p>

                  <h3
                    className="
                      mt-1
                      text-[16px]
                      font-semibold
                      tracking-[-0.035em]
                      text-white
                    "
                  >
                    {activeMegaMenu.title}
                  </h3>

                  <span
                    className="
                      mt-2.5
                      inline-flex
                      h-8
                      items-center
                      gap-2
                      rounded-full
                      bg-white
                      px-3.5
                      text-[9px]
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

        {/* MOBILE MENU — PARENT → CHILD, USING REAL SUPABASE MEGA MENU DATA */}
        {mobileOpen && (
          <div
            className="
              absolute
              left-0
              right-0
              top-[62px]
              z-50
              overflow-hidden
              rounded-[14px]
              border
              border-[#DDE2E8]
              bg-white
              shadow-[0_18px_50px_rgba(15,23,42,0.14)]
              lg:hidden
            "
          >
            {mobileMenuLevel === "root" ? (
              <nav className="p-3">
                <Link
                  to="/shop"
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileMenuLevel("root");
                  }}
                  className="
                    mb-1 flex min-h-[44px] items-center justify-between
                    rounded-[9px] bg-[#F6F8FB] px-3 text-[11px]
                    font-semibold text-[#111827] active:bg-[#EEF2F6]
                  "
                >
                  <span>Shop Apple accessories</span>
                  <ArrowRight size={13} strokeWidth={1.8} />
                </Link>

                {([
                  ["cases", "Cases & Bands"],
                  ["charging", "Charging"],
                  ["lifestyle", "Lifestyle Gear"],
                ] as const).map(([menuKey, fallbackTitle]) => {
                  const section = megaMenus.find(
                    (menu) => menu.menu_key === menuKey,
                  );
                  const title = section?.title || fallbackTitle;
                  const groupCount = section?.mega_menu_groups?.length ?? 0;

                  return (
                    <button
                      key={menuKey}
                      type="button"
                      onClick={() => setMobileMenuLevel(menuKey)}
                      className="
                        flex min-h-[48px] w-full items-center justify-between
                        border-b border-[#EEF1F4] px-3 text-left text-[11px]
                        font-semibold text-[#1F2937] active:bg-[#F8FAFC]
                      "
                    >
                      <span>{title}</span>
                      <span className="flex items-center gap-2">
                        {groupCount > 0 && (
                          <span className="text-[8px] font-medium text-[#A0A8B3]">
                            {groupCount}
                          </span>
                        )}
                        <ChevronDown
                          size={15}
                          strokeWidth={1.8}
                          className="-rotate-90 text-[#64748B]"
                        />
                      </span>
                    </button>
                  );
                })}

                <Link
                  to="/account"
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileMenuLevel("root");
                  }}
                  className="
                    mt-1 block border-t border-[#E5E7EB] px-3 pt-4
                    text-[11px] font-medium text-[#94A3B8]
                  "
                >
                  Account
                </Link>
              </nav>
            ) : (
              (() => {
                const section = megaMenus.find(
                  (menu) => menu.menu_key === mobileMenuLevel,
                );

                if (!section) {
                  return (
                    <div className="p-3">
                      <button
                        type="button"
                        onClick={() => setMobileMenuLevel("root")}
                        className="flex items-center gap-2 text-[11px] font-semibold text-[#111827]"
                      >
                        <ArrowRight size={14} className="rotate-180" />
                        Back
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="p-3">
                    <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
                      <button
                        type="button"
                        onClick={() => setMobileMenuLevel("root")}
                        aria-label="Back to categories"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F7FA] text-[#334155]"
                      >
                        <ArrowRight size={15} strokeWidth={1.8} className="rotate-180" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                          Category
                        </p>
                        <h3 className="mt-0.5 truncate text-[14px] font-semibold tracking-[-0.025em] text-[#111827]">
                          {section.title}
                        </h3>
                      </div>
                    </div>

                    <Link
                      to="/shop"
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileMenuLevel("root");
                      }}
                      className="mt-3 flex min-h-[42px] items-center justify-between rounded-[9px] bg-[#F6F8FB] px-3 text-[10px] font-semibold text-[#111827]"
                    >
                      <span>Shop all {section.title}</span>
                      <ArrowRight size={13} strokeWidth={1.8} />
                    </Link>

                    <div className="mt-2 space-y-2">
                      {section.mega_menu_groups.map((group, groupIndex) => {
                        const childSlug = group.category?.slug;
                        const childItems = group.mega_menu_items
                          .map(
                            (item) =>
                              item.label_override ||
                              item.categories?.name ||
                              "",
                          )
                          .filter(Boolean);

                        const groupImage =
                          group.image_url ||
                          getGroupFallback(section.menu_key, groupIndex);

                        return (
                          <Link
                            key={group.id}
                            to="/shop"
                            search={
                              childSlug
                                ? ({ category: childSlug } as never)
                                : undefined
                            }
                            onClick={() => {
                              setMobileOpen(false);
                              setMobileMenuLevel("root");
                            }}
                            className="
                              group
                              flex
                              min-h-[68px]
                              w-full
                              items-center
                              gap-3
                              rounded-[11px]
                              border
                              border-[#E1E5EA]
                              bg-white
                              px-2.5
                              py-2
                              shadow-[0_2px_8px_rgba(15,23,42,0.04)]
                              transition-all
                              active:scale-[0.99]
                              active:bg-[#F8FAFC]
                            "
                          >
                            {/* IMAGE ALREADY SET IN ADMIN MEGA MENU */}
                            <div
                              className="
                                h-[52px]
                                w-[62px]
                                shrink-0
                                overflow-hidden
                                rounded-[8px]
                                border
                                border-[#E8EBEF]
                                bg-[#F5F7F9]
                              "
                            >
                              <img
                                src={groupImage}
                                alt={group.title}
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition-transform
                                  duration-300
                                  group-active:scale-[1.03]
                                "
                                loading="lazy"
                              />
                            </div>

                            {/* CATEGORY CONTENT */}
                            <div className="min-w-0 flex-1 pr-1">
                              <p className="text-[12px] font-semibold tracking-[-0.01em] text-[#111827]">
                                {group.title}
                              </p>

                              {childItems.length > 0 && (
                                <p className="mt-0.5 line-clamp-1 text-[9px] leading-4 text-[#98A2B3]">
                                  {childItems.slice(0, 3).join(" · ")}
                                </p>
                              )}

                              <span className="mt-1 inline-flex items-center text-[8px] font-semibold text-[#64748B]">
                                Shop category
                              </span>
                            </div>

                            <ChevronDown
                              size={15}
                              strokeWidth={1.8}
                              className="-rotate-90 shrink-0 text-[#64748B]"
                            />
                          </Link>
                        );
                      })}
                    </div>

                    {section.mega_menu_groups.some(
                      (group) => group.mega_menu_items.length > 0,
                    ) && (
                      <div className="mt-4 border-t border-[#E5E7EB] pt-3">
                        <p className="px-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#98A2B3]">
                          Quick links
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {section.mega_menu_groups
                            .flatMap((group) => group.mega_menu_items)
                            .map((item) => ({
                              ...item,
                              label:
                                item.label_override ||
                                item.categories?.name ||
                                "Category",
                              slug: item.categories?.slug,
                            }))
                            .slice(0, 6)
                            .map((item) => (
                              <Link
                                key={item.id}
                                to="/shop"
                                search={
                                  item.slug
                                    ? ({ category: item.slug } as never)
                                    : undefined
                                }
                                onClick={() => {
                                  setMobileOpen(false);
                                  setMobileMenuLevel("root");
                                }}
                                className="rounded-full border border-[#E5E7EB] bg-[#FAFBFC] px-2.5 py-1.5 text-[8px] font-medium text-[#667085]"
                              >
                                {item.label}
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          CART DRAWER
          ======================================================== */}

      <CartDrawer
  open={cartOpen}
  onClose={() => setCartOpen(false)}
  onPayPal={() => {
    window.location.href = "/checkout";
  }}
/>

    </header>
  );
}