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

                          <img

                            src={column.image_url || getGroupFallback(activeMegaMenu.menu_key, columnIndex)}

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



              {(["cases", "charging", "lifestyle"] as const).map((menuKey) => {

                const section = megaMenus.find((menu) => menu.menu_key === menuKey);

                if (!section || section.mega_menu_groups.length === 0) return null;

                const label = section.title;

                const expanded = mobileExpandedMenu === menuKey;



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

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

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

                                        <Link key={item.id} to="/shop" search={{ category: itemSlug } as never} onClick={() => { setMobileOpen(false); setMobileExpandedMenu(null); }} className="rounded-[8px] border border-white/70 bg-white/55 px-2 py-1.5 text-[9px] font-medium text-[#475467] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-xl hover:bg-white/75 hover:text-[#111827]">

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



              <Link to="/account" onClick={() => { setMobileOpen(false); setMobileExpandedMenu(null); }} className="mt-1 flex items-center justify-between px-3 py-3 text-[11px] text-[#64748B]">

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