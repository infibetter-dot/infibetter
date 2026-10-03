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
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<MegaMenuKey>(null);
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
                setMobileOpen((value) => !value);
                setActiveMenu(null);
                setMobileExpandedMenu(null);
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
                  gap-x-2.5
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
                            w-full
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

        {/* MOBILE MENU */}

        {mobileOpen && (
          <div
            className="
              absolute left-0 right-0 top-[62px]
              overflow-hidden rounded-[14px]
              border border-[#DDE2E8] bg-white
              shadow-[0_18px_50px_rgba(15,23,42,0.14)]
              lg:hidden
            "
          >
            <nav className="max-h-[calc(100vh-90px)] overflow-y-auto p-3">
              <Link
                to="/shop"
                onClick={() => { setMobileOpen(false); setMobileExpandedMenu(null); }}
                className="flex items-center justify-between rounded-[9px] px-3 py-3 text-[11px] font-semibold text-[#111827] hover:bg-[#F8FAFC]"
              >
                <span>Shop Apple accessories</span>
                <ArrowRight size={13} className="text-[#94A3B8]" />
              </Link>

              {([
                ["cases", "Cases & Bands"],
                ["charging", "Charging"],
                ["lifestyle", "Lifestyle Gear"],
              ] as const).map(([menuKey, label]) => {
                const section = megaMenus.find((menu) => menu.menu_key === menuKey);
                const expanded = mobileExpandedMenu === menuKey;

                if (!section) {
                  return (
                    <Link key={menuKey} to="/shop" onClick={() => { setMobileOpen(false); setMobileExpandedMenu(null); }} className="flex items-center justify-between rounded-[9px] px-3 py-3 text-[11px] font-medium text-[#111827] hover:bg-[#F8FAFC]">
                      <span>{label}</span><ArrowRight size={13} className="text-[#94A3B8]" />
                    </Link>
                  );
                }

                return (
                  <div key={menuKey} className="overflow-hidden border-b border-[#E5E7EB]">
                    <button type="button" onClick={() => setMobileExpandedMenu(expanded ? null : menuKey)} className="flex w-full items-center justify-between rounded-[9px] px-3 py-3 text-left text-[11px] font-medium text-[#111827] hover:bg-[#F8FAFC]">
                      <span>{label}</span>
                      <ChevronDown size={14} className={`text-[#64748B] transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>

                    {expanded && (
                      <div className="px-2 pb-3">
                        <Link
                          to="/shop"
                          search={section.mega_menu_groups[0]?.category?.slug ? ({ category: section.mega_menu_groups[0].category.slug } as never) : undefined}
                          onClick={() => { setMobileOpen(false); setMobileExpandedMenu(null); }}
                          className="group relative mb-3 block h-[105px] overflow-hidden rounded-[10px] border border-[#E1E5EA] bg-[#F1F3F5]"
                        >
                          <img src={section.image_url || getSectionFallback(section.menu_key)} alt={section.title || label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/75">Explore</div>
                            <div className="mt-0.5 text-[14px] font-semibold text-white">{section.title || label}</div>
                          </div>
                        </Link>

                        <div className="flex flex-col gap-3">
                          {section.mega_menu_groups.map((group, groupIndex) => (
                            <div key={group.id} className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-[#FAFBFC]">
                              <Link
                                to="/shop"
                                search={group.category?.slug ? ({ category: group.category.slug } as never) : undefined}
                                onClick={() => { setMobileOpen(false); setMobileExpandedMenu(null); }}
                                className="flex items-center gap-3 p-2.5"
                              >
                                <div className="h-[52px] w-[72px] shrink-0 overflow-hidden rounded-[8px] border border-[#E1E5EA] bg-white">
                                  <img src={group.image_url || getGroupFallback(section.menu_key, groupIndex)} alt={group.title} className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#171A1F]">
                                    <span className="truncate">{group.title}</span><ArrowRight size={10} className="shrink-0 text-[#94A3B8]" />
                                  </div>
                                  <div className="mt-1 text-[9px] text-[#98A2B3]">View collection</div>
                                </div>
                              </Link>

                              {group.mega_menu_items.length > 0 && (
                                <div className="border-t border-[#E5E7EB] bg-white px-3 py-2.5">
                                  <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                                    {group.mega_menu_items.map((item) => {
                                      const itemLabel = item.label_override || item.categories?.name || "Category";
                                      const itemSlug = item.categories?.slug;
                                      if (!itemSlug) return null;
                                      return (
                                        <Link key={item.id} to="/shop" search={{ category: itemSlug } as never} onClick={() => { setMobileOpen(false); setMobileExpandedMenu(null); }} className="rounded-[6px] bg-[#F5F7FA] px-2 py-1.5 text-[9px] font-medium text-[#667085] hover:bg-[#EEF2F6] hover:text-[#111827]">
                                          {itemLabel}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Link to="/account" onClick={() => { setMobileOpen(false); setMobileExpandedMenu(null); }} className="mt-1 flex items-center justify-between border-t border-[#E5E7EB] px-3 py-3 text-[11px] text-[#64748B]">
                <span>Account</span><User size={14} strokeWidth={1.7} />
              </Link>
            </nav>
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