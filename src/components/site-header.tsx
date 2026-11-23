import { Link } from "@tanstack/react-router";

import CartDrawer from "@/components/cart/CartDrawer";

import {

  ArrowRight,
  Check,

  ChevronDown,

  Menu,

  Search,

  ShoppingBag,

  User,

  X,

} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { useCart } from "@/lib/cart";
import {
  CURRENCIES,
  getCurrency,
  setCurrency as updateCurrency,
  subscribeToCurrencyChange,
  type CurrencyCode,
} from "@/lib/currency-system";

import { supabase } from "@/integrations/supabase/client";


type MegaMenuKey = "cases" | "charging" | "lifestyle" | null;



function CurrencyFlag({ code }: { code: CurrencyCode }) {
  const flags: Record<CurrencyCode, string> = {
    USD: "🇺🇸",
    VND: "🇻🇳",
    CAD: "🇨🇦",
    AUD: "🇦🇺",
    EUR: "🇪🇺",
    GBP: "🇬🇧",
    SGD: "🇸🇬",
  };

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[18px] w-[25px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] text-[17px] leading-none"
    >
      {flags[code] ?? "🌐"}
    </span>
  );
}

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


type MobileCategory = { name: string; slug: string };

type MobileProduct = {
  id: string;
  slug: string;
  name: string;
  price: number | string | null;
  compare_at_price: number | string | null;
  image_url: string | null;
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


function getMegaGridColumns(groupCount: number) {

  return Math.max(1, Math.min(groupCount, 4));

}


export function SiteHeader() {

  const { count } = useCart();


  const [cartOpen, setCartOpen] = useState(false);

  const [activeMenu, setActiveMenu] =

    useState<MegaMenuKey>(null);

  const [desktopSupportOpen, setDesktopSupportOpen] = useState(false);
  const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);
  const [desktopSelectedCategory, setDesktopSelectedCategory] = useState<MobileCategory | null>(null);
  const [desktopCategoryProducts, setDesktopCategoryProducts] = useState<MobileProduct[]>([]);
  const [desktopProductsLoading, setDesktopProductsLoading] = useState(false);


  const [searchOpen, setSearchOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>(() => getCurrency());
  const currencyRef = useRef<HTMLDivElement | null>(null);
  const [mobileScreen, setMobileScreen] = useState<"home" | "collections" | "products">("home");
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false);

  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<MegaMenuKey>(null);
  const [mobileSelectedCategory, setMobileSelectedCategory] = useState<MobileCategory | null>(null);
  const [mobileCategoryProducts, setMobileCategoryProducts] = useState<MobileProduct[]>([]);
  const [mobileProductsLoading, setMobileProductsLoading] = useState(false);

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


  const openMobileCategory = async (category: MobileCategory) => {
    setMobileScreen("products");
    setMobileSelectedCategory(category);
    setMobileCategoryProducts([]);
    setMobileProductsLoading(true);

    try {
      const { data: selectedCategory, error: categoryError } = await supabase
        .from("categories")
        .select("id,name,slug,parent_id")
        .eq("slug", category.slug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!selectedCategory) {
        setMobileCategoryProducts([]);
        return;
      }

      const { data: allCategories, error: treeError } = await supabase
        .from("categories")
        .select("id,parent_id");

      if (treeError) throw treeError;

      const categoryIds = new Set<string>([selectedCategory.id]);
      let changed = true;

      while (changed) {
        changed = false;
        for (const row of allCategories ?? []) {
          if (row.parent_id && categoryIds.has(row.parent_id) && !categoryIds.has(row.id)) {
            categoryIds.add(row.id);
            changed = true;
          }
        }
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id,slug,name,price,compare_at_price,image_url,is_active,status,created_at")
        .eq("is_active", true)
        .in("category_id", Array.from(categoryIds))
        .order("created_at", { ascending: false })
        .limit(50);

      if (productsError) throw productsError;

      setMobileCategoryProducts(
        ((products ?? []) as any[])
          .filter((product) => product.status !== "hidden")
          .map((product) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            compare_at_price: product.compare_at_price,
            image_url: product.image_url,
          })),
      );
    } catch (error) {
      console.error("MOBILE MENU CATEGORY PRODUCTS ERROR:", error);
      setMobileCategoryProducts([]);
    } finally {
      setMobileProductsLoading(false);
    }
  };

  const loadDesktopCategoryProducts = async (category: MobileCategory) => {
    setDesktopSelectedCategory(category);
    setDesktopCategoryProducts([]);
    setDesktopProductsLoading(true);

    try {
      const { data: selectedCategory, error: categoryError } = await supabase
        .from("categories")
        .select("id,name,slug,parent_id")
        .eq("slug", category.slug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!selectedCategory) {
        setDesktopCategoryProducts([]);
        return;
      }

      const { data: allCategories, error: treeError } = await supabase
        .from("categories")
        .select("id,parent_id");

      if (treeError) throw treeError;

      const categoryIds = new Set<string>([selectedCategory.id]);
      let changed = true;

      while (changed) {
        changed = false;
        for (const row of allCategories ?? []) {
          if (row.parent_id && categoryIds.has(row.parent_id) && !categoryIds.has(row.id)) {
            categoryIds.add(row.id);
            changed = true;
          }
        }
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id,slug,name,price,compare_at_price,image_url,is_active,status,created_at")
        .eq("is_active", true)
        .in("category_id", Array.from(categoryIds))
        .order("created_at", { ascending: false })
        .limit(12);

      if (productsError) throw productsError;

      setDesktopCategoryProducts(
        ((products ?? []) as any[])
          .filter((product) => product.status !== "hidden")
          .slice(0, 3)
          .map((product) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            compare_at_price: product.compare_at_price,
            image_url: product.image_url,
          })),
      );
    } catch (error) {
      console.error("DESKTOP MEGA MENU PRODUCTS ERROR:", error);
      setDesktopCategoryProducts([]);
    } finally {
      setDesktopProductsLoading(false);
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileExpandedMenu(null);
    setMobileSelectedCategory(null);
    setMobileScreen("home");
    setMobileSupportOpen(false);
    setCurrencyOpen(false);
  };

  const activeMegaMenu =

    activeMenu === null

      ? null

      : megaMenus.find((menu) => menu.menu_key === activeMenu) ?? null;

  // Build Desktop Products from every visible top-level mega-menu group.
  // The admin editor stores each primary collection as a mega_menu_group;
  // its child categories live in mega_menu_items and must not become
  // separate top-level entries here.
  const desktopProductCategories = Array.from(
    new Map(
      megaMenus
        .flatMap((section) => section.mega_menu_groups ?? [])
        .filter((group) => group.is_visible)
        .flatMap((group) => {
          const visibleItems = (group.mega_menu_items ?? []).filter(
            (item) => item.is_visible && item.categories?.slug,
          );

          // If this group has exactly one visible child category (e.g. Chargers
          // -> Charging Stations), use that category for the product query.
          // Otherwise use the group-level category so multi-category groups
          // continue to aggregate their configured child collections.
          const singleVisibleItem =
            visibleItems.length === 1 ? visibleItems[0] : null;

          const targetCategory = singleVisibleItem
            ? {
                name: group.title || singleVisibleItem.label_override || singleVisibleItem.categories.name,
                slug: singleVisibleItem.categories.slug,
              }
            : group.category?.slug
              ? {
                  name: group.title || group.category.name,
                  slug: group.category.slug,
                }
              : visibleItems[0]?.categories?.slug
                ? {
                    name: group.title || visibleItems[0].label_override || visibleItems[0].categories.name,
                    slug: visibleItems[0].categories.slug,
                  }
                : null;

          return targetCategory
            ? [[targetCategory.slug, targetCategory] as const]
            : [];
        }),
    ).values(),
  );

  // Build mobile collections directly from the exact same resolved category
  // list used by the Desktop Products menu. This prevents the mobile drawer
  // from silently dropping a group such as Chargers.
  const mobileCollectionGroups = desktopProductCategories.map((targetCategory) => {
    const matchingGroup = megaMenus
      .flatMap((section) => section.mega_menu_groups ?? [])
      .find((group) => {
        if (!group.is_visible) return false;
        const visibleItems = (group.mega_menu_items ?? []).filter(
          (item) => item.is_visible && item.categories?.slug,
        );
        const resolvedSlug =
          visibleItems.length === 1
            ? visibleItems[0].categories.slug
            : group.category?.slug || visibleItems[0]?.categories?.slug;
        return resolvedSlug === targetCategory.slug;
      });

    return {
      group: {
        id: matchingGroup?.id || targetCategory.slug,
        title: targetCategory.name,
        image_url: matchingGroup?.image_url || null,
      },
      targetCategory,
    };
  });

  useEffect(() => {
    if (!desktopProductsOpen || desktopProductCategories.length === 0) return;

    const selectedStillExists = desktopSelectedCategory &&
      desktopProductCategories.some((category) => category.slug === desktopSelectedCategory.slug);

    if (!selectedStillExists) {
      void loadDesktopCategoryProducts(desktopProductCategories[0]);
    }
  }, [desktopProductsOpen, megaMenus]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setCurrency(getCurrency());
    return subscribeToCurrencyChange((code) => setCurrency(code));
  }, []);

  useEffect(() => {
    if (!currencyOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node)
      ) {
        setCurrencyOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCurrencyOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currencyOpen]);

  const selectedCurrency = CURRENCIES[currency];

  // Product prices in Supabase are stored in USD.
  // Keep the header drawer formatter aligned with the existing INFIBETTER
  // product-price conversion rules and the shared selected currency state.
  const HEADER_CURRENCY_RATES: Record<CurrencyCode, number> = {
    USD: 1,
    VND: 25500,
    CAD: 1.38,
    AUD: 1.52,
    EUR: 0.88,
    GBP: 0.75,
    SGD: 1.28,
  };

  const HEADER_CURRENCY_LOCALES: Record<CurrencyCode, string> = {
    USD: "en-US",
    VND: "vi-VN",
    CAD: "en-CA",
    AUD: "en-AU",
    EUR: "de-DE",
    GBP: "en-GB",
    SGD: "en-SG",
  };

  const formatHeaderProductPrice = (value: unknown): string => {
    const usd = Number(value);
    if (!Number.isFinite(usd)) return "—";

    const activeCurrency: CurrencyCode =
      currency in HEADER_CURRENCY_RATES ? currency : "USD";
    const converted = usd * HEADER_CURRENCY_RATES[activeCurrency];

    if (!Number.isFinite(converted)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usd);
    }

    const fractionDigits = activeCurrency === "VND" ? 0 : 2;
    return new Intl.NumberFormat(HEADER_CURRENCY_LOCALES[activeCurrency], {
      style: "currency",
      currency: activeCurrency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(converted);
  };

  const selectCurrency = (code: string) => {
    if (!(code in CURRENCIES)) return;
    updateCurrency(code as CurrencyCode);
    setCurrency(code as CurrencyCode);
    setCurrencyOpen(false);
  };



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

        sm:py-2.5

        lg:py-0

      "

    >

      <style>{`
        @keyframes infibetter-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .infibetter-marquee-track {
            animation: none !important;
          }
        }
      `}</style>

      {/* TOP ANNOUNCEMENT — existing INFIBETTER benefits */}
      <div className="group hidden h-[52px] w-full items-center overflow-hidden bg-[#1D1D1D] text-white lg:flex">
        <div className="infibetter-marquee-track flex w-max min-w-max animate-[infibetter-marquee_34s_linear_infinite] items-center group-hover:[animation-play-state:paused]">
          {[0, 1].map((track) => (
            <div
              key={track}
              aria-hidden={track === 1}
              className="flex shrink-0 items-center"
            >
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={`${track}-${index}`}
                  className="flex shrink-0 items-center gap-3 px-7 whitespace-nowrap text-[12px] font-semibold tracking-[-0.01em]"
                >
                  <span>Free tracked shipping</span>
                  <span className="text-white/70">·</span>
                  <span>30-day returns</span>
                  <span className="ml-5 text-[15px] text-white">•</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE SHIPPING PROMISE STRIP */}
      <div className="mb-1.5 flex h-4 items-center justify-center gap-2 text-[7px] font-semibold uppercase tracking-[0.08em] text-[#334155] lg:hidden">
        <span>Free tracked shipping</span>
        <span className="text-[#94A3B8]">·</span>
        <span>30-day returns</span>
      </div>


      {/* HEADER CAPSULE */}


      <div className="relative mx-auto w-[calc(100%-24px)] max-w-[1320px] lg:w-full lg:max-w-none">

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

            lg:h-[72px]

            lg:rounded-none

            lg:border-x-0

            lg:border-b-0

            lg:border-t-0

            lg:px-[max(32px,calc((100vw-1440px)/2))]

            lg:shadow-none

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

              lg:text-[24px]

            "

          >

            INFIBETTER

          </Link>


          {/* DESKTOP NAV */}


          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 whitespace-nowrap lg:flex">
            <Link
              to="/shop"
              onClick={() => {
                setActiveMenu(null);
                setDesktopProductsOpen(false);
                setDesktopSupportOpen(false);
              }}
              className="inline-flex h-11 w-[128px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#17191D] px-4 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(23,25,29,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#30343A] hover:shadow-[0_6px_16px_rgba(23,25,29,0.18)]"
            >
              Shop All
              <ArrowRight size={14} className="ml-2" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setDesktopSupportOpen(false);
                setSearchOpen(false);
                setDesktopProductsOpen((open) => !open);
              }}
              aria-expanded={desktopProductsOpen}
              className={`inline-flex h-11 w-[116px] shrink-0 items-center justify-center gap-2 rounded-full px-3 text-[14px] font-medium transition-all duration-200 ${
                desktopProductsOpen
                  ? "bg-[#F1F3F5] text-[#17191D] shadow-inner"
                  : "bg-transparent text-[#343A40] hover:bg-[#F5F6F7]"
              }`}
            >
              Products
              <ChevronDown
                size={14}
                strokeWidth={1.8}
                className={`transition-transform duration-200 ${
                  desktopProductsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className="relative">
              <button
                type="button"
                aria-expanded={desktopSupportOpen}
                onClick={() => {
                  setActiveMenu(null);
                  setDesktopSupportOpen((open) => !open);
                }}
                className={`inline-flex h-11 w-[116px] shrink-0 items-center justify-center gap-2 rounded-full px-3 text-[14px] font-medium transition-all duration-200 ${
                  desktopSupportOpen
                    ? "bg-[#F1F3F5] text-[#17191D] shadow-inner"
                    : "bg-transparent text-[#343A40] hover:bg-[#F5F6F7]"
                }`}
              >
                Support
                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className={`transition-transform duration-200 ${
                    desktopSupportOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {desktopSupportOpen && (
                <div className="absolute left-1/2 top-full z-[220] mt-3 w-[300px] -translate-x-1/2 rounded-[16px] border border-[#E7E9ED] bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
                  <div className="grid grid-cols-2 gap-x-3">
                    {[
                      { label: "FAQs", to: "/faqs" },
                      { label: "Contact Us", to: "/contact" },
                      { label: "Order & Payment", to: "/order-payment" },
                      { label: "Shipping & Returns", to: "/shipping" },
                      { label: "Warranty", to: "/warranty" },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDesktopSupportOpen(false)}
                        className="flex min-h-[42px] items-center border-b border-[#ECEFF2] px-2 py-2 text-[12px] font-medium text-[#64748B] transition-colors hover:text-[#F05A28]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>


          {/* ACTIONS */}


          <div className="ml-auto flex items-center gap-1 sm:gap-1.5 lg:gap-3">

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


        {/* DESKTOP PRODUCTS MEGA MENU — INFIBETTER data, SKEGIC-style layout reference */}
        {desktopProductsOpen && (
          <div className="absolute left-1/2 top-[72px] z-[180] hidden w-[min(1320px,calc(100vw-64px))] -translate-x-1/2 overflow-hidden border border-[#E7E9ED] bg-white shadow-[0_22px_55px_rgba(15,23,42,0.13)] lg:block">
            <div className="grid min-h-[390px] grid-cols-[250px_minmax(0,1fr)] gap-8 px-8 py-7">
              <aside className="flex min-w-0 flex-col border-r border-[#ECEFF2] pr-7">
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B929B]">
                  Shop by Category
                </p>

                <div className="flex flex-col gap-3">
                  {desktopProductCategories.map((category) => {
                    const selected = desktopSelectedCategory?.slug === category.slug;
                    return (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => void loadDesktopCategoryProducts(category)}
                        className={`w-full text-left text-[18px] font-medium tracking-[-0.035em] transition-colors ${
                          selected ? "text-[#17191D]" : "text-[#737B85] hover:text-[#17191D]"
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>

                <Link
                  to="/shop"
                  onClick={() => { setActiveMenu(null); setDesktopProductsOpen(false); }}
                  className="mt-auto flex items-center justify-between border-t border-[#DDE1E6] pt-4 text-[13px] font-medium text-[#333A43] transition-colors hover:text-[#F05A28]"
                >
                  Shop All Products
                  <ArrowRight size={16} />
                </Link>
              </aside>

              <section className="min-w-0">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B929B]">
                    Featured Products
                  </p>
                  {desktopSelectedCategory && (
                    <Link
                      to="/shop"
                      search={{ category: desktopSelectedCategory.slug } as never}
                      onClick={() => { setActiveMenu(null); setDesktopProductsOpen(false); }}
                      className="flex items-center gap-2 text-[13px] font-medium text-[#343A40] transition-colors hover:text-[#F05A28]"
                    >
                      All {desktopSelectedCategory.name}
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>

                {desktopProductsLoading ? (
                  <div className="grid grid-cols-3 gap-5">
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="animate-pulse">
                        <div className="aspect-[4/3] rounded-[10px] bg-[#F1F3F5]" />
                        <div className="mt-4 h-3 w-3/4 rounded bg-[#ECEFF2]" />
                        <div className="mt-2 h-3 w-1/3 rounded bg-[#ECEFF2]" />
                      </div>
                    ))}
                  </div>
                ) : desktopCategoryProducts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-5">
                    {desktopCategoryProducts.map((product, index) => (
                      <a
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => { setActiveMenu(null); setDesktopProductsOpen(false); }}
                        className="group min-w-0"
                      >
                        <div className="relative mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden bg-white">
                          {product.compare_at_price &&
                            Number(product.compare_at_price) > Number(product.price) &&
                            Number(product.compare_at_price) > 0 &&
                            Number(product.price) >= 0 && (
                              <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-[2px] bg-[#E3262E] px-2.5 py-1 text-[10px] font-bold tracking-[0.01em] text-white shadow-sm">
                                -{Math.round(
                                  ((Number(product.compare_at_price) - Number(product.price)) /
                                    Number(product.compare_at_price)) * 100,
                                )}%
                              </span>
                            )}
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full bg-white object-contain p-0 transition-transform duration-500 group-hover:scale-[1.035]"
                            />
                          ) : (
                            <span className="text-[11px] text-[#9AA1AA]">INFIBETTER</span>
                          )}
                        </div>
                        <p className="line-clamp-2 min-h-[36px] text-[13px] font-medium leading-[1.35] text-[#343A40] transition-colors group-hover:text-[#F05A28]">
                          {product.name}
                        </p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-[13px] font-semibold text-[#D94C4C]">
                            {formatHeaderProductPrice(product.price)}
                          </span>
                          {product.compare_at_price &&
                            Number(product.compare_at_price) > Number(product.price) && (
                              <span className="text-[10px] text-[#9AA1AA] line-through">
                                {formatHeaderProductPrice(product.compare_at_price)}
                              </span>
                            )}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[250px] items-center justify-center text-[13px] text-[#8B929B]">
                    {desktopSelectedCategory
                      ? "No products found in this category."
                      : "Choose a category to explore products."}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* MOBILE MENU */}


        {mobileOpen && (
          <div className="fixed inset-0 z-[200] bg-black/45 lg:hidden">
            <button
              type="button"
              aria-label="Close menu overlay"
              onClick={closeMobileMenu}
              className="absolute inset-0 h-full w-full cursor-default"
            />

            <div className="absolute inset-x-0 bottom-0 top-[3vh] flex max-h-[97vh] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-12px_50px_rgba(0,0,0,0.16)]">
              <div className="relative flex h-[54px] shrink-0 items-center justify-center bg-white">
                <span className="h-[4px] w-[44px] rounded-full bg-[#E5E5E5]" />
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[#17191D]"
                >
                  <X size={21} strokeWidth={1.7} />
                </button>
              </div>

              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {mobileScreen === "home" && (
                  <div className="min-h-full px-5 pb-8 pt-6">
                    <div className="mb-5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#F05A28]">
                        INFIBETTER
                      </p>
                      <h2 className="mt-1 text-[25px] font-semibold leading-tight tracking-[-0.055em] text-[#17191D]">
                        Explore
                      </h2>
                      <p className="mt-1 text-[12px] text-[#858B94]">
                        Find the right gear for your everyday setup.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <Link
                        to="/shop"
                        onClick={closeMobileMenu}
                        className="group flex min-h-[66px] items-center justify-between overflow-hidden rounded-[12px] bg-[#17191D] px-4 text-white shadow-[0_5px_14px_rgba(23,25,29,0.12)] transition-transform active:scale-[0.99]"
                      >
                        <span>
                          <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">
                            Browse everything
                          </span>
                          <span className="mt-0.5 block text-[19px] font-semibold tracking-[-0.04em]">
                            Shop All
                          </span>
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                          <ArrowRight size={18} />
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setMobileScreen("collections")}
                        className="flex min-h-[64px] w-full items-center justify-between rounded-[12px] border border-[#E8EAED] bg-white px-4 text-left transition-colors active:bg-[#F8F9FA]"
                      >
                        <span>
                          <span className="block text-[17px] font-semibold tracking-[-0.035em] text-[#17191D]">
                            Products
                          </span>
                          <span className="mt-0.5 block text-[11px] text-[#858B94]">
                            Explore collections
                          </span>
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F5F6] text-[#7C838C]">
                          <ArrowRight size={16} />
                        </span>
                      </button>

                      <div className="overflow-hidden rounded-[12px] border border-[#E8EAED] bg-white">
                        <button
                          type="button"
                          aria-expanded={mobileSupportOpen}
                          onClick={() => setMobileSupportOpen((open) => !open)}
                          className="flex min-h-[64px] w-full items-center justify-between px-4 text-left transition-colors active:bg-[#F8F9FA]"
                        >
                          <span>
                            <span className="block text-[17px] font-semibold tracking-[-0.035em] text-[#17191D]">
                              Support
                            </span>
                            <span className="mt-0.5 block text-[11px] text-[#858B94]">
                              Help, orders and customer care
                            </span>
                          </span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F5F6] text-[#7C838C]">
                            <ChevronDown
                              className={`transition-transform duration-200 ${mobileSupportOpen ? "rotate-180" : ""}`}
                              size={17}
                            />
                          </span>
                        </button>

                        {mobileSupportOpen && (
                          <div className="grid grid-cols-2 gap-x-4 border-t border-[#ECEFF2] bg-[#FAFAFA] px-4 py-2">
                            {[
                              { label: "FAQs", to: "/faqs" },
                              { label: "Contact Us", to: "/contact" },
                              { label: "Order & Payment", to: "/order-payment" },
                              { label: "Shipping & Returns", to: "/shipping" },
                              { label: "Warranty", to: "/warranty" },
                            ].map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={closeMobileMenu}
                                className="flex min-h-[40px] items-center border-b border-[#ECEFF2] py-2 text-[12px] font-medium text-[#626B76] transition-colors hover:text-[#F05A28]"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-[#F05A28]" />
                      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#A0A5AC]">
                        Power more. Carry less.
                      </span>
                    </div>
                  </div>
                )}

                {mobileScreen === "collections" && (
                  <div className="flex h-full min-h-0 flex-col overflow-hidden animate-[mobileMenuIn_220ms_ease-out]">
                    <div className="z-10 flex h-[50px] shrink-0 items-center border-b border-[#ECEFF2] bg-white px-3">
                      <button
                        type="button"
                        onClick={() => setMobileScreen("home")}
                        aria-label="Back to menu"
                        className="mr-3 flex h-10 w-10 items-center justify-center text-[#777B80]"
                      >
                        <ArrowRight className="rotate-180" size={20} strokeWidth={1.6} />
                      </button>
                      <span className="min-w-0 flex-1 text-[17px] font-semibold tracking-[-0.03em] text-[#17191D]">
                        Explore Collections
                      </span>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-3 pt-2">
                      <div className="relative mb-3 flex h-[72px] min-h-[72px] items-center overflow-hidden rounded-[14px] border border-[#D8E5F6] bg-[radial-gradient(ellipse_at_78%_15%,#E7F1FF_0%,#C6DCF9_48%,#91B4E3_100%)] px-4 py-3 shadow-[0_4px_12px_rgba(64,104,158,0.08)]">
                        <div className="absolute -right-9 -top-16 h-48 w-48 rounded-full border border-white/55" />
                        <div className="absolute -right-1 -top-10 h-36 w-36 rounded-full border border-white/45" />
                        <div className="absolute bottom-[-34px] right-[72px] h-20 w-20 rounded-full bg-white/15 blur-xl" />
                        <div className="relative">
                          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#405875]">
                            INFIBETTER · SHOP BY CATEGORY
                          </p>
                          <h2 className="mt-1 text-[19px] font-semibold leading-tight tracking-[-0.05em] text-[#17283E]">
                            Explore Collections
                          </h2>
                          <p className="mt-1 max-w-[250px] text-[10px] leading-[1.35] text-[#405875]">
                            Find the right accessories for your everyday setup.
                          </p>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center justify-between px-0.5">
                        <span className="text-[11px] font-semibold tracking-[-0.01em] text-[#343A40]">
                          Choose your collection
                        </span>
                        <span className="text-[9px] font-semibold tracking-[0.12em] text-[#A0A6AE]">
                          {String(desktopProductCategories.length).padStart(2, "0")} CATEGORIES
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {mobileCollectionGroups.map(({ group, targetCategory }) => {
                            return (
                              <button
                                key={group.id}
                                type="button"
                                disabled={!targetCategory?.slug}
                                onClick={() => {
                                  if (targetCategory?.slug) openMobileCategory(targetCategory);
                                }}
                                className="group flex h-[60px] min-h-[60px] w-full items-center gap-2.5 overflow-hidden rounded-[11px] border border-[#E7E9ED] bg-[#FFFFFF] px-2.5 py-1.5 text-left shadow-[0_2px_7px_rgba(20,30,45,0.035)] transition-all duration-200 hover:border-[#D4D9E0] hover:shadow-[0_4px_12px_rgba(20,30,45,0.07)] active:scale-[0.99] disabled:opacity-60"
                              >
                                <div className="flex h-[46px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-white">
                                  {group.image_url ? (
                                    <img
                                      src={group.image_url}
                                      alt={group.title}
                                      loading="lazy"
                                      className="h-full w-full object-contain p-1.5"
                                    />
                                  ) : (
                                    <div className="h-full w-full rounded-[8px] bg-gradient-to-br from-[#F3F4F5] to-[#E5E7EB]" />
                                  )}
                                </div>
                                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[-0.02em] text-[#202329]">
                                  {group.title}
                                </span>
                                <span className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F6F7] text-[#7F8791] transition-colors group-hover:bg-[#FFF0E9] group-hover:text-[#F05A28]"><ArrowRight size={14} /></span>
                              </button>
                            );
                          })}
                      </div>

                      <Link
                        to="/shop"
                        onClick={closeMobileMenu}
                        className="mt-3 flex h-[44px] min-h-[44px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#17191D] text-[12px] font-semibold tracking-[0.01em] text-white shadow-[0_5px_14px_rgba(23,25,29,0.12)] transition-all duration-200 hover:bg-[#292C31] active:scale-[0.99]"
                      >
                        View All Products
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[#F6A17F]"><ArrowRight size={14} /></span>
                      </Link>
                    </div>
                  </div>
                )}

                {mobileScreen === "products" && (
                  <div className="animate-[mobileMenuIn_220ms_ease-out]">
                    <div className="sticky top-0 z-10 flex h-[58px] items-center border-b border-[#ECEFF2] bg-white px-4">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileSelectedCategory(null);
                          setMobileScreen("collections");
                        }}
                        aria-label="Back to collections"
                        className="mr-3 flex h-10 w-10 items-center justify-center text-[#777B80]"
                      >
                        <ArrowRight className="rotate-180" size={20} strokeWidth={1.6} />
                      </button>
                      <span className="min-w-0 flex-1 truncate text-[16px] font-semibold text-[#17191D]">
                        {mobileSelectedCategory?.name ?? "Products"}
                      </span>
                    </div>

                    <div className="px-4 pb-6 pt-2">
                      {mobileProductsLoading ? (
                        <div className="flex min-h-[220px] items-center justify-center text-[13px] text-[#98A2B3]">
                          Loading products...
                        </div>
                      ) : mobileCategoryProducts.length > 0 ? (
                        <div>
                          {mobileCategoryProducts.map((product) => (
                            <a
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={closeMobileMenu}
                              className="flex min-h-[116px] items-center gap-4 border-b border-[#ECEFF2] py-3"
                            >
                              <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center bg-[#F8F8F8]">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-contain" />
                                ) : (
                                  <span className="text-[10px] text-[#A0A4AA]">No image</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-2 text-[13px] font-medium leading-[1.45] text-[#25282C]">{product.name}</div>
                                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="text-[13px] font-semibold text-[#D92929]">
                                    {formatHeaderProductPrice(product.price)}
                                  </span>
                                  {Number(product.compare_at_price) > Number(product.price) && (
                                    <span className="text-[11px] text-[#92979D] line-through">
                                      {formatHeaderProductPrice(product.compare_at_price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </a>
                          ))}
                          <Link
                            to="/shop"
                            search={{ category: mobileSelectedCategory?.slug } as never}
                            onClick={closeMobileMenu}
                            className="mt-4 flex h-[54px] items-center justify-center gap-3 bg-[#171717] px-4 text-[13px] font-semibold text-white"
                          >
                            All {mobileSelectedCategory?.name ?? "Products"}
                            <ArrowRight size={17} />
                          </Link>
                        </div>
                      ) : (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                          <p className="text-[13px] text-[#7B8493]">No products found in this collection.</p>
                          <Link
                            to="/shop"
                            search={mobileSelectedCategory ? ({ category: mobileSelectedCategory.slug } as never) : undefined}
                            onClick={closeMobileMenu}
                            className="bg-[#171717] px-5 py-3 text-[12px] font-semibold text-white"
                          >
                            View all products <ArrowRight size={14} className="ml-2 inline" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </nav>

              <div className="relative z-30 shrink-0 border-t border-[#ECEFF2] bg-white">
                <div ref={currencyRef} className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={currencyOpen}
                    onClick={() => setCurrencyOpen((open) => !open)}
                    className="flex h-[52px] w-full items-center justify-between gap-3 px-5 text-left text-[12px] font-medium text-[#30343A] transition-colors hover:bg-[#FAFBFC] active:bg-[#F5F6F7]"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <CurrencyFlag code={currency} />
                      <span className="min-w-0 truncate">
                        {currency === "VND"
                          ? "Vietnam (VND)"
                          : `${selectedCurrency.name} (${selectedCurrency.code})`}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={1.6}
                      className={`shrink-0 text-[#7D8792] transition-transform duration-200 ${currencyOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {currencyOpen && (
                    <div
                      role="listbox"
                      aria-label="Select currency"
                      className="absolute bottom-[calc(100%+8px)] left-3 right-3 z-[260] max-h-[min(55vh,360px)] overflow-y-auto rounded-[14px] border border-[#E1E5EA] bg-white p-1.5 shadow-[0_14px_38px_rgba(15,23,42,0.18)]"
                    >
                      <div className="px-3 pb-2 pt-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#98A1AC]">
                          Select currency
                        </p>
                      </div>
                      {Object.values(CURRENCIES).map((option) => {
                        const selected = option.code === currency;
                        return (
                          <button
                            key={option.code}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => selectCurrency(option.code)}
                            className={`flex min-h-[48px] w-full items-center gap-3 rounded-[9px] px-3 py-2 text-left transition-colors ${
                              selected
                                ? "bg-[#F1F5FA] text-[#17191D]"
                                : "text-[#59636F] hover:bg-[#F8F9FA]"
                            }`}
                          >
                            <span className="flex h-8 w-9 shrink-0 items-center justify-center rounded-md border border-[#E7EAF0] bg-white">
                              <CurrencyFlag code={option.code} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[12px] font-semibold">
                                {option.code}
                              </span>
                              <span className="block truncate text-[10px] text-[#8B95A1]">
                                {option.name}
                              </span>
                            </span>
                            {selected && (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#17191D] text-white">
                                <Check size={13} strokeWidth={2.4} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
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