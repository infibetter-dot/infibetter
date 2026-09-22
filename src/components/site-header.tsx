import { Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Search,
  ChevronDown,
  LampDesk,
  LampFloor,
  Lightbulb,
  Home,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

const NAV = [
  { to: "/", label: "Trang chủ" },
  { to: "/shop", label: "Cửa hàng" },
];

const categories = [
  {
    title: "Đèn bàn",
    slug: "den-ban",
    icon: LampDesk,
  },
  {
    title: "Đèn đứng",
    slug: "den-dung",
    icon: LampFloor,
  },
  {
    title: "Đèn thả",
    slug: "den-tha",
    icon: Lightbulb,
  },
  {
    title: "Đèn tường",
    slug: "den-tuong",
    icon: Home,
  },
  {
    title: "Đồ decor",
    slug: "do-decor",
    icon: Sparkles,
  },
];

export function SiteHeader() {
  const { count } = useCart();

  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const categoryRef = useRef<HTMLDivElement>(null);

  /* =====================================================
     CLOSE CATEGORY WHEN CLICK OUTSIDE
  ====================================================== */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =====================================================
     ESC TO CLOSE
  ====================================================== */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCategoryOpen(false);
        setSearchOpen(false);
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* =====================================================
     SEARCH
  ====================================================== */

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const keyword = searchValue.trim();

    if (!keyword) return;

    window.location.href = `/shop?q=${encodeURIComponent(keyword)}`;
  };

  /* =====================================================
     CLOSE MOBILE MENU
  ====================================================== */

  const closeMobileMenu = () => {
    setOpen(false);
    setCategoryOpen(false);
  };

  return (
    <header
      className="
        sticky
        top-0
        z-50
        bg-transparent
        px-3
        py-2
        sm:px-5
        sm:py-3
      "
    >
      {/* =====================================================
          MAIN CAPSULE HEADER
      ====================================================== */}

      <div
        className="
          mx-auto
          flex
          h-14
          w-full
          max-w-[1600px]
          items-center
          justify-between
          gap-4
          rounded-full
          border
          border-neutral-200/80
          bg-white
          px-5
          shadow-[0_8px_30px_rgba(0,0,0,0.06)]
          sm:h-16
          sm:px-6
          lg:px-7
        "
      >
        {/* =================================================
            LOGO
        ================================================== */}

        <Link
          to="/"
          className="
            shrink-0
            font-display
            text-[20px]
            font-semibold
            tracking-[0.12em]
            text-[#2F2F2F]
            sm:text-[22px]
          "
        >
          OLIVE LIVING
          <span className="text-primary">.</span>
        </Link>

        {/* =================================================
            DESKTOP NAV
        ================================================== */}

        <nav
          className="
            hidden
            items-center
            gap-9
            lg:flex
          "
        >
          {/* -------------------------------------------------
              TRANG CHỦ / CỬA HÀNG
          -------------------------------------------------- */}

          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="
                relative
                text-[14px]
                font-normal
                tracking-wide
                text-neutral-600
                transition-all
                duration-300
                hover:text-black

                after:absolute
                after:-bottom-1
                after:left-0
                after:h-px
                after:w-0
                after:bg-black
                after:transition-all
                hover:after:w-full
              "
              activeProps={{
                className:
                  "relative text-[14px] font-normal tracking-wide text-black after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-black",
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* =================================================
              DANH MỤC
          ================================================== */}

          <div
            ref={categoryRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setCategoryOpen((value) => !value)
              }
              aria-expanded={categoryOpen}
              aria-haspopup="menu"
              className="
                flex
                items-center
                gap-1.5
                text-[14px]
                font-normal
                tracking-wide
                text-neutral-600
                transition-all
                duration-300
                hover:text-black
              "
            >
              <span>Danh mục</span>

              <ChevronDown
                className={`
                  h-3.5
                  w-3.5
                  transition-transform
                  duration-300
                  ${
                    categoryOpen
                      ? "rotate-180"
                      : "rotate-0"
                  }
                `}
                strokeWidth={1.5}
              />
            </button>

            {/* =================================================
                DESKTOP DROPDOWN
            ================================================== */}

            {categoryOpen && (
              <div
                className="
                  absolute
                  left-1/2
                  top-[calc(100%+18px)]
                  z-[100]
                  w-[245px]
                  -translate-x-1/2
                  overflow-hidden
                  rounded-2xl
                  border
                  border-neutral-200/80
                  bg-white
                  p-2
                  shadow-[0_18px_50px_rgba(0,0,0,0.10)]
                "
              >
                {/* -------------------------------------------------
                    DROPDOWN HEADER
                -------------------------------------------------- */}

                <div className="px-3 pb-2 pt-2">
                  <p
                    className="
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-[0.28em]
                      text-neutral-400
                    "
                  >
                    COLLECTIONS
                  </p>
                </div>

                {/* -------------------------------------------------
                    CATEGORY LIST
                -------------------------------------------------- */}

                <div className="space-y-0.5">
                  {categories.map((category) => {
                    const Icon = category.icon;

                    return (
                      <Link
                        key={category.slug}
                        to="/shop"
                        search={{
                          category: category.slug,
                        } as never}
                        onClick={() =>
                          setCategoryOpen(false)
                        }
                        className="
                          group
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          px-3
                          py-2.5
                          text-[13px]
                          text-neutral-600
                          transition-all
                          duration-200
                          hover:bg-[#F7FAF5]
                          hover:text-[#6F8B5E]
                        "
                      >
                        {/* ICON + LABEL */}

                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-neutral-100
                              bg-neutral-50
                              text-neutral-500
                              transition-all
                              duration-200
                              group-hover:border-[#DDE8D7]
                              group-hover:bg-[#F1F6EE]
                              group-hover:text-[#6F8B5E]
                            "
                          >
                            <Icon
                              className="
                                h-[17px]
                                w-[17px]
                              "
                              strokeWidth={1.5}
                            />
                          </div>

                          <span>
                            {category.title}
                          </span>
                        </div>

                        {/* ARROW */}

                        <span
                          className="
                            text-[13px]
                            text-neutral-300
                            transition-transform
                            duration-200
                            group-hover:translate-x-1
                            group-hover:text-[#6F8B5E]
                          "
                        >
                          →
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* -------------------------------------------------
                    ALL PRODUCTS
                -------------------------------------------------- */}

                <div
                  className="
                    mt-1
                    border-t
                    border-neutral-100
                    pt-1
                  "
                >
                  <Link
                    to="/shop"
                    onClick={() =>
                      setCategoryOpen(false)
                    }
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      px-3
                      py-2.5
                      text-[13px]
                      font-medium
                      text-[#2F2F2F]
                      transition-all
                      duration-200
                      hover:bg-neutral-50
                    "
                  >
                    <span>
                      Xem tất cả sản phẩm
                    </span>

                    <span
                      className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* =====================================================
            RIGHT ACTIONS
        ====================================================== */}

        <div className="flex items-center gap-0.5">
          {/* =================================================
              ACCOUNT - DESKTOP ONLY
          ================================================== */}

          <Link
            to="/account"
            aria-label="Tài khoản"
            className="
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-neutral-600
              transition-all
              duration-300
              hover:bg-neutral-100
              hover:text-black
              lg:inline-flex
            "
          >
            <User
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
            />
          </Link>

          {/* =================================================
              SEARCH
          ================================================== */}

          <button
            type="button"
            aria-label="Tìm kiếm"
            onClick={() =>
              setSearchOpen((value) => !value)
            }
            className="
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-neutral-600
              transition-all
              duration-300
              hover:bg-neutral-100
              hover:text-black
            "
          >
            <Search
              className="h-[19px] w-[19px]"
              strokeWidth={1.5}
            />
          </button>

          {/* =================================================
              CART
          ================================================== */}

          <Link
            to="/cart"
            aria-label="Giỏ hàng"
            className="
              relative
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-neutral-600
              transition-all
              duration-300
              hover:bg-neutral-100
              hover:text-black
            "
          >
            <ShoppingBag
              className="h-[19px] w-[19px]"
              strokeWidth={1.5}
            />

            {count > 0 && (
              <span
                className="
                  absolute
                  right-0
                  top-0
                  grid
                  h-[17px]
                  min-w-[17px]
                  place-items-center
                  rounded-full
                  bg-primary
                  px-1
                  text-[9px]
                  font-medium
                  text-primary-foreground
                "
              >
                {count}
              </span>
            )}
          </Link>

          {/* =================================================
              MOBILE MENU
          ================================================== */}

          <button
            type="button"
            aria-label="Menu"
            onClick={() =>
              setOpen((value) => !value)
            }
            className="
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-neutral-600
              transition-all
              duration-300
              hover:bg-neutral-100
              lg:hidden
            "
          >
            {open ? (
              <X
                className="h-[19px] w-[19px]"
                strokeWidth={1.5}
              />
            ) : (
              <Menu
                className="h-[19px] w-[19px]"
                strokeWidth={1.5}
              />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          SEARCH PANEL
      ====================================================== */}

      {searchOpen && (
        <div
          className="
            mx-auto
            mt-2
            max-w-[1600px]
            rounded-2xl
            border
            border-neutral-200
            bg-white
            p-3
            shadow-[0_10px_35px_rgba(0,0,0,0.08)]
          "
        >
          <form
            onSubmit={handleSearchSubmit}
            className="
              flex
              items-center
              gap-2
            "
          >
            <Search
              className="
                ml-2
                h-4
                w-4
                shrink-0
                text-neutral-400
              "
              strokeWidth={1.5}
            />

            <input
              autoFocus
              type="text"
              value={searchValue}
              onChange={(event) =>
                setSearchValue(event.target.value)
              }
              placeholder="Tìm kiếm sản phẩm..."
              className="
                h-10
                flex-1
                bg-transparent
                px-2
                text-sm
                text-neutral-800
                outline-none
                placeholder:text-neutral-400
              "
            />

            <button
              type="submit"
              className="
                rounded-full
                bg-[#2F3528]
                px-5
                py-2.5
                text-xs
                font-medium
                text-white
                transition
                hover:bg-[#6F8B5E]
              "
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      )}

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      {open && (
        <div
          className="
            mx-auto
            mt-2
            max-w-[1600px]
            overflow-hidden
            rounded-2xl
            border
            border-neutral-200
            bg-white
            shadow-[0_10px_35px_rgba(0,0,0,0.08)]
            lg:hidden
          "
        >
          <nav className="flex flex-col p-3">
            {/* -------------------------------------------------
                TRANG CHỦ
            -------------------------------------------------- */}

            <Link
              to="/"
              onClick={closeMobileMenu}
              className="
                rounded-xl
                px-4
                py-3
                text-sm
                text-neutral-700
                transition
                hover:bg-neutral-50
              "
            >
              Trang chủ
            </Link>

            {/* -------------------------------------------------
                CỬA HÀNG
            -------------------------------------------------- */}

            <Link
              to="/shop"
              onClick={closeMobileMenu}
              className="
                rounded-xl
                px-4
                py-3
                text-sm
                text-neutral-700
                transition
                hover:bg-neutral-50
              "
            >
              Cửa hàng
            </Link>

            {/* =================================================
                MOBILE CATEGORY
            ================================================== */}

            <div
              className="
                mt-1
                border-t
                border-neutral-100
                pt-1
              "
            >
              <p
                className="
                  px-4
                  pb-2
                  pt-3
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.28em]
                  text-neutral-400
                "
              >
                DANH MỤC
              </p>

              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    key={category.slug}
                    to="/shop"
                    search={{
                      category: category.slug,
                    } as never}
                    onClick={closeMobileMenu}
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      text-neutral-600
                      transition-all
                      duration-200
                      hover:bg-[#F7FAF5]
                      hover:text-[#6F8B5E]
                    "
                  >
                    {/* ICON + LABEL */}

                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-neutral-50
                          text-neutral-400
                          transition-all
                          group-hover:bg-[#F1F6EE]
                          group-hover:text-[#6F8B5E]
                        "
                      >
                        <Icon
                          className="h-4 w-4"
                          strokeWidth={1.5}
                        />
                      </div>

                      <span>
                        {category.title}
                      </span>
                    </div>

                    {/* ARROW */}

                    <span
                      className="
                        text-neutral-300
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                    >
                      →
                    </span>
                  </Link>
                );
              })}

              {/* -------------------------------------------------
                  ALL PRODUCTS
              -------------------------------------------------- */}

              <Link
                to="/shop"
                onClick={closeMobileMenu}
                className="
                  mt-1
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border-t
                  border-neutral-100
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-[#2F2F2F]
                "
              >
                <span>
                  Xem tất cả sản phẩm
                </span>

                <span>→</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}