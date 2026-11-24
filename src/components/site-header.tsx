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

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);

  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<MegaMenuKey>(null);
  const [mobileScreen, setMobileScreen] = useState<"home" | "collections" | "products">("home");
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

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileExpandedMenu(null);
    setMobileSelectedCategory(null);
    setMobileScreen("home");
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

      {/* TOP ANNOUNCEMENT - CONTINUOUS RUNNING RIBBON */}
      <div className="relative left-1/2 mb-1.5 h-5 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-[#252525] text-white sm:left-auto sm:mx-0 sm:h-6 sm:w-full sm:translate-x-0">
        <style>{`
          @keyframes infibetter-announcement-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .infibetter-announcement-track {
            display: flex;
            width: max-content;
            animation: infibetter-announcement-marquee 28s linear infinite;
            will-change: transform;
          }
          .infibetter-announcement-track:hover {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .infibetter-announcement-track { animation: none; }
          }
        `}</style>
        <div className="infibetter-announcement-track h-full items-center">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
              className="flex h-full shrink-0 items-center gap-5 px-3 text-[8px] font-semibold uppercase tracking-[0.04em] sm:gap-7 sm:px-5 sm:text-[9px]"
            >
              <span>Free tracked shipping</span>
              <span className="text-[#A3A3A3]">•</span>
              <span>30-day returns</span>
              <span className="text-[#A3A3A3]">•</span>
              <span>Free tracked shipping</span>
              <span className="text-[#A3A3A3]">•</span>
              <span>30-day returns</span>
              <span className="text-[#A3A3A3]">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER CAPSULE */}


      <div className="relative mx-auto w-full max-w-none sm:w-[calc(100%-24px)] sm:max-w-[1320px]">

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


            {megaMenus.some((menu) => menu.menu_key === "cases" && menu.mega_menu_groups.length > 0) && (
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

              {megaMenus.find((menu) => menu.menu_key === "cases")?.title ?? "Cases & Bands"}


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
            )}


            {megaMenus.some((menu) => menu.menu_key === "charging" && menu.mega_menu_groups.length > 0) && (
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

              {megaMenus.find((menu) => menu.menu_key === "charging")?.title ?? "Charging"}


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
            )}


            {megaMenus.some((menu) => menu.menu_key === "lifestyle" && menu.mega_menu_groups.length > 0) && (
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

              {megaMenus.find((menu) => menu.menu_key === "lifestyle")?.title ?? "Lifestyle Gear"}


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
            )}

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

              max-w-[1320px]

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

            <div className="grid grid-cols-[minmax(0,1fr)_190px] gap-3 p-3">

              {/* CATEGORY CARDS */}


              <div

                className="

                  grid

                  gap-x-3

                  gap-y-3

                  p-0.5

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

                      className="flex h-full min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#E8EBF0] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.045)] transition-shadow duration-300 hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]"

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

                            aspect-[3/2]

                            w-full

                            overflow-hidden

                            rounded-t-[13px]

                            bg-[#F1F3F5]

                          "

                        >

                          {column.image_url ? (
                            <img src={column.image_url} alt={column.title} className="

                              h-full

                              w-full

                              object-cover

                              transition-transform

                              duration-500

                              group-hover:scale-[1.04]

                            " />
                          ) : null}

                        </div>


                        <div

                          className="

                            flex

                            items-center

                            gap-1.5

                            px-3

                            pt-3

                            text-[13px]
                            font-extrabold
                            leading-[1.05]
                            tracking-[-0.045em]
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


                      <p className="px-3 pt-1 text-[10px] leading-4 text-[#7B8493]">{column.title.toLowerCase().includes("case") ? "Stylish protection for every device." : column.title.toLowerCase().includes("charging") ? "Effortless power for everyday life." : column.title.toLowerCase().includes("bank") ? "Compact power, bigger possibilities." : column.title.toLowerCase().includes("travel") ? "Stay powered wherever you go." : "Smart accessories for everyday life."}</p>

                      <div className="mt-2 flex flex-col gap-0.5 px-2.5">

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

                              className="group

                                flex

                                w-full

                                items-center

                                justify-between

                                rounded-[7px]

                                px-2

                                py-1

                                text-[10px]
                                font-medium
                                leading-4
                                text-[#475467]

                                transition-all

                                hover:bg-[#F5F7FA]

                                hover:text-[#111827]

                              "

                            >

                              <span>{itemLabel}</span>
                              <ArrowRight size={10} className="shrink-0 text-[#94A3B8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#475467]" />

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

                          mx-3

                          mb-3

                          mt-auto

                          flex

                          h-8

                          shrink-0

                          items-center

                          justify-between

                          rounded-full

                          border border-white/80

                          bg-white/55

                          px-3

                          text-[10px]

                          font-semibold

                          text-[#344054]

                          shadow-[0_3px_10px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.95)]

                          backdrop-blur-xl

                          transition-all

                          duration-200

                          hover:border-white

                          hover:bg-white/80

                          hover:shadow-[0_5px_14px_rgba(15,23,42,0.11),inset_0_1px_0_rgba(255,255,255,1)]

                        "

                      >

                        View all


                        <ArrowRight size={11} />

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

                  min-h-[360px]

                  overflow-hidden

                  rounded-[14px]

                  border

                  border-[#E3E7EC]

                  bg-[#E9EEF3]

                  shadow-[0_8px_22px_rgba(15,23,42,0.12)]

                "

              >

                {activeMegaMenu.image_url ? (
                  <img src={activeMegaMenu.image_url} alt={activeMegaMenu.title} className="

                    absolute

                    inset-0

                    h-full

                    w-full

                    object-cover

                    transition-transform

                    duration-500

                    group-hover:scale-[1.03]

                  " />
                ) : null}


                <div

                  className="

                    absolute

                    inset-0

                    bg-gradient-to-t

                    from-black/70

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

                      text-[9px]

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

                      mt-0.5

                      text-[16px]

                      font-extrabold

                      leading-[1.05]

                      tracking-[-0.045em]

                      text-white

                    "

                  >

                    {activeMegaMenu.title}

                  </h3>


                  <span

                    className="

                      mt-1.5

                      inline-flex

                      h-7

                      items-center

                      gap-2

                      rounded-full

                      bg-white

                      px-2.5

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
          <div className="fixed inset-0 z-[200] bg-black/45 lg:hidden">
            <button
              type="button"
              aria-label="Close menu overlay"
              onClick={closeMobileMenu}
              className="absolute inset-0 h-full w-full cursor-default"
            />

            <div className="absolute inset-x-0 bottom-0 top-[7vh] flex max-h-[93vh] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_-12px_50px_rgba(0,0,0,0.16)]">
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
                  <div className="min-h-full px-[22px] pb-8 pt-3">
                    <div className="flex flex-col">
                      <Link
                        to="/shop"
                        onClick={closeMobileMenu}
                        className="flex min-h-[52px] items-center justify-between text-[23px] font-medium tracking-[-0.045em] text-[#17191D]"
                      >
                        <span>Shop All</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setMobileScreen("collections")}
                        className="flex min-h-[52px] w-full items-center justify-between text-left text-[23px] font-medium tracking-[-0.045em] text-[#17191D]"
                      >
                        <span>Products</span>
                        <ChevronDown className="-rotate-90 text-[#A5A5A5]" size={21} strokeWidth={1.5} />
                      </button>

                      <Link
                        to="/support"
                        onClick={closeMobileMenu}
                        className="flex min-h-[52px] items-center justify-between text-[23px] font-medium tracking-[-0.045em] text-[#17191D]"
                      >
                        <span>Support</span>
                        <ChevronDown className="-rotate-90 text-[#A5A5A5]" size={21} strokeWidth={1.5} />
                      </Link>
                    </div>
                  </div>
                )}

                {mobileScreen === "collections" && (
                  <div className="animate-[mobileMenuIn_220ms_ease-out]">
                    <div className="sticky top-0 z-10 flex h-[58px] items-center border-b border-[#ECEFF2] bg-white px-4">
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
                      <button
                        type="button"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                        className="flex h-10 w-10 items-center justify-center text-[#17191D]"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="px-4 pb-7 pt-4">
                      <div className="relative mb-5 h-[150px] overflow-hidden rounded-[13px] bg-[#E9EDF1]">
                        {megaMenus.find((section) => section.menu_key === "cases")?.image_url && (
                          <img
                            src={megaMenus.find((section) => section.menu_key === "cases")?.image_url ?? ""}
                            alt="Explore Collections"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/15 to-transparent" />
                        <div className="absolute bottom-5 left-5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                            INFIBETTER
                          </p>
                          <h2 className="mt-1 text-[25px] font-semibold tracking-[-0.05em] text-white">
                            Explore Collections
                          </h2>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        <Link
                          to="/shop"
                          onClick={closeMobileMenu}
                          className="rounded-full border border-[#17191D] bg-[#17191D] px-4 py-2 text-[12px] font-medium text-white"
                        >
                          All Products
                        </Link>
                        {megaMenus.flatMap((section) => section.mega_menu_groups).flatMap((group) =>
                          group.mega_menu_items.map((item) => {
                            const label = item.label_override || item.categories?.name;
                            const slug = item.categories?.slug;
                            if (!label || !slug) return null;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => openMobileCategory({ name: label, slug })}
                                className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[12px] font-medium text-[#555B64]"
                              >
                                {label}
                              </button>
                            );
                          })
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {megaMenus.flatMap((section) => section.mega_menu_groups).map((group) => {
                          const targetCategory =
                            group.category?.slug
                              ? { name: group.title, slug: group.category.slug }
                              : group.mega_menu_items.find((item) => item.categories?.slug)
                                ? {
                                    name: group.mega_menu_items.find((item) => item.categories?.slug)?.label_override
                                      || group.mega_menu_items.find((item) => item.categories?.slug)?.categories?.name
                                      || group.title,
                                    slug: group.mega_menu_items.find((item) => item.categories?.slug)?.categories?.slug || "",
                                  }
                                : null;

                          return (
                            <button
                              key={group.id}
                              type="button"
                              disabled={!targetCategory?.slug}
                              onClick={() => targetCategory?.slug && openMobileCategory(targetCategory)}
                              className="group overflow-hidden rounded-[12px] border border-[#E8EAED] bg-white text-left disabled:opacity-60"
                            >
                              <div className="aspect-[4/3] overflow-hidden bg-[#F4F5F6]">
                                {group.image_url ? (
                                  <img
                                    src={group.image_url}
                                    alt={group.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-active:scale-[1.02]"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-br from-[#F3F4F5] to-[#E5E7EB]" />
                                )}
                              </div>
                              <div className="flex min-h-[48px] items-center justify-between gap-2 px-3 py-2.5">
                                <span className="line-clamp-2 text-[13px] font-semibold leading-[1.25] text-[#202329]">
                                  {group.title}
                                </span>
                                <ArrowRight className="shrink-0 text-[#9AA0A6]" size={15} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
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
                      <button
                        type="button"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                        className="flex h-10 w-10 items-center justify-center text-[#17191D]"
                      >
                        <X size={20} />
                      </button>
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
                                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(product.price) || 0)}
                                  </span>
                                  {Number(product.compare_at_price) > Number(product.price) && (
                                    <span className="text-[11px] text-[#92979D] line-through">
                                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(product.compare_at_price))}
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

              <div className="shrink-0 border-t border-[#ECEFF2] bg-white">
                <button
                  type="button"
                  className="flex h-[48px] w-full items-center justify-between border-b border-[#ECEFF2] px-[22px] text-[13px] font-medium text-[#30343A]"
                >
                  <span>United States (USD $)</span>
                  <ChevronDown size={16} strokeWidth={1.5} />
                </button>
                <div className="flex h-[72px] items-center justify-between bg-[#FAFAFA] px-[22px]">
                  <Link
                    to="/account"
                    onClick={closeMobileMenu}
                    className="flex h-[40px] min-w-[110px] items-center justify-center gap-2 bg-[#171717] px-4 text-[13px] font-semibold text-white"
                  >
                    <User size={17} strokeWidth={1.7} />
                    Login
                  </Link>
                  <div className="flex items-center gap-[18px] text-[#17191D]" aria-label="Social media">
                    <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-[20px] font-bold">f</a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-[20px]">◎</a>
                    <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-[18px]">▶</a>
                    <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" aria-label="Pinterest" className="text-[20px] font-bold">p</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

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