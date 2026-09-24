import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Headphones,
  LockKeyhole,
  Package,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

import banner01 from "@/assets/hero/banner01.png";
import banner02 from "@/assets/hero/banner02.png";
import banner03 from "@/assets/hero/banner03.png";
import hero1 from "@/assets/hero/hero-1.png";
import hero2 from "@/assets/hero/hero_2.png";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  image_url?: string | null;
  compare_at_price?: number | string | null;
}

interface DesignedForRealLifeProps {
  products?: Product[];
}

/* =========================================================
   FALLBACK PRODUCTS
========================================================= */

const fallbackProducts = [
  {
    id: "fallback-1",
    name: "MagCase Metal",
    description: "Color-matched protection.",
    image: banner01,
  },
  {
    id: "fallback-2",
    name: "MagBank Qi2 Slim",
    description: "Power that disappears into your pocket.",
    image: banner02,
  },
  {
    id: "fallback-3",
    name: "MagFold Qi2 Twist",
    description: "Three devices. One foldable charger.",
    image: banner03,
  },
  {
    id: "fallback-4",
    name: "WatchBand Active",
    description: "Built to move. Designed to last.",
    image: hero1,
  },
];

/* =========================================================
   REVIEW DATA
========================================================= */

const reviews = [
  {
    name: "Mrs",
    image: banner03,
    review:
      "Love this case. I had been looking for something premium, lightweight and easy to use every day.",
  },
  {
    name: "Charles",
    image: banner01,
    review:
      "I love the design and lightweight feel. Everything looks clean and works exactly the way I expected.",
  },
  {
    name: "Julie",
    image: banner02,
    review:
      "The quality is really good and the product feels great in everyday use. I also love the color.",
  },
  {
    name: "Rafael",
    image: hero1,
    review:
      "The watch band looks and feels great. It was very easy to adjust and comfortable for everyday wear.",
  },
  {
    name: "K",
    image: hero2,
    review:
      "Great power bank. Nice and slim, easy to carry around and perfect for travel.",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DesignedForRealLife({
  products = [],
}: DesignedForRealLifeProps) {
  const displayProducts = products.slice(0, 4);

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[1320px]
        px-4
        pb-8
        pt-4
        sm:px-5
        sm:pb-10
        sm:pt-5
        lg:px-6
        lg:pb-12
        lg:pt-6
      "
    >
      {/* =====================================================
          SECTION HEADER
      ====================================================== */}

      <div>
        <h2
          className="
            font-sans
            text-[28px]
            font-bold
            leading-[1.05]
            tracking-[-0.035em]
            text-[#111111]
            sm:text-[32px]
            lg:text-[34px]
          "
        >
          Designed for real life
        </h2>

        <p
          className="
            mt-2
            text-[10px]
            leading-4
            text-neutral-500
            sm:text-[11px]
          "
        >
          See how our products simplify the way you charge,
          carry, and connect.
        </p>
      </div>

      {/* =====================================================
          FEATURED PRODUCTS
      ====================================================== */}

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-2
          sm:grid-cols-2
          sm:gap-3
          lg:grid-cols-4
        "
      >
        {displayProducts.length > 0
          ? displayProducts.map((product, index) => (
              <FeatureCard
                key={product.id}
                product={product}
                index={index}
              />
            ))
          : fallbackProducts.map((product) => (
              <FallbackCard
                key={product.id}
                name={product.name}
                description={product.description}
                image={product.image}
              />
            ))}
      </div>

      {/* =====================================================
          CUSTOMER / COMMUNITY INTRO
      ====================================================== */}

      <div
        className="
          mt-7
          grid
          overflow-hidden
          rounded-[10px]
          border
          border-[#E2E2E2]
          bg-white
          lg:grid-cols-[1.35fr_1fr]
        "
      >
        {/* REVIEWS INTRO */}

        <div
          className="
            px-5
            py-5
            sm:px-6
            sm:py-6
            lg:px-7
            lg:py-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[#0066E6]
            "
          >
            <span
              className="
                h-1
                w-1
                rounded-full
                bg-[#0066E6]
              "
            />

            Real customers. Real reviews.
          </div>

          <h3
            className="
              mt-3
              font-sans
              text-[25px]
              font-bold
              leading-none
              tracking-[-0.035em]
              text-[#111111]
              sm:text-[28px]
              lg:text-[29px]
            "
          >
            What customers are saying
          </h3>

          <p
            className="
              mt-2
              max-w-[390px]
              text-[10px]
              leading-4
              text-neutral-500
              sm:text-[11px]
            "
          >
            See how customers use INFIBETTER at home,
            at work and on the move.
          </p>

          <Link
            to="/shop"
            className="
              mt-4
              inline-flex
              h-8
              items-center
              gap-2
              rounded-[7px]
              bg-[#171717]
              px-4
              text-[9px]
              font-semibold
              text-white
              transition-colors
              duration-200
              hover:bg-[#0066E6]
            "
          >
            Read all reviews
            <ArrowRight size={11} />
          </Link>
        </div>

        {/* COMMUNITY */}

        <div
          className="
            border-t
            border-[#E2E2E2]
            px-5
            py-5
            sm:px-6
            sm:py-6
            lg:border-l
            lg:border-t-0
            lg:px-7
            lg:py-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[#0066E6]
            "
          >
            <span
              className="
                h-1
                w-1
                rounded-full
                bg-[#0066E6]
              "
            />

            Our community
          </div>

          <div
            className="
              mt-3
              font-sans
              text-[34px]
              font-bold
              leading-none
              tracking-[-0.045em]
              text-[#111111]
              sm:text-[38px]
            "
          >
            230,000+
          </div>

          <p
            className="
              mt-1
              text-[10px]
              text-neutral-500
              sm:text-[11px]
            "
          >
            Customers served worldwide
          </p>

          <div
            className="
              mt-6
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-2
            "
          >
            <TrustItem
              icon={<Camera size={10} />}
              label="Photos & videos"
            />

            <TrustItem
              icon={<CheckCircle2 size={10} />}
              label="Verified buyers"
            />

            <TrustItem
              icon={<ShieldCheck size={10} />}
              label="Secure shopping"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER REVIEWS
      ====================================================== */}

      <div className="relative mt-5">
        <div
          className="
            flex
            gap-3
            overflow-x-auto
            pb-2
            lg:grid
            lg:grid-cols-5
            lg:overflow-visible
          "
        >
          {reviews.map((review) => (
            <ReviewCard
              key={review.name}
              name={review.name}
              review={review.review}
              image={review.image}
            />
          ))}
        </div>

        {/* DESKTOP NEXT BUTTON */}

        <button
          type="button"
          aria-label="Next reviews"
          className="
            absolute
            right-[-7px]
            top-[70px]
            z-10
            hidden
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-[#E4E4E4]
            bg-white
            text-[#171717]
            shadow-[0_4px_18px_rgba(0,0,0,0.10)]
            transition-colors
            hover:bg-[#0066E6]
            hover:text-white
            lg:flex
          "
        >
          <ChevronRight size={17} />
        </button>
      </div>

      {/* =====================================================
          TRUST BAR
      ====================================================== */}

      <div
        className="
          mt-8
          grid
          overflow-hidden
          rounded-[10px]
          border
          border-[#DCDCDC]
          bg-white
          sm:grid-cols-4
        "
      >
        {/* FREE SHIPPING */}

        <TrustBarItem
          icon={<Package size={18} strokeWidth={1.5} />}
          title="Free tracked shipping"
          link="Shipping details"
        />

        {/* SUPPORT */}

        <TrustBarItem
          icon={<Headphones size={18} strokeWidth={1.5} />}
          title="Here to help"
          link="Product help & support"
        />

        {/* RETURNS */}

        <TrustBarItem
          icon={<RotateCcw size={18} strokeWidth={1.5} />}
          title="30-day returns"
          link="Returns explained"
        />

        {/* PAYMENTS */}

        <TrustBarItem
          icon={<LockKeyhole size={18} strokeWidth={1.5} />}
          title="Secure payments"
          link="Payment methods"
          last
        />
      </div>
    </section>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const descriptions = [
    "Color-matched protection.",
    "Power that disappears into your pocket.",
    "Three devices. One foldable charger.",
    "Built to move. Designed to last.",
  ];

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="
        group
        relative
        aspect-[0.78/1]
        overflow-hidden
        rounded-[9px]
        bg-[#E8E8E8]
      "
    >
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-[1.035]
          "
        />
      ) : (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-[#F2F2F2]
            text-[10px]
            text-neutral-400
          "
        >
          Product image
        </div>
      )}

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
          sm:p-3.5
        "
      >
        <h3
          className="
            text-[12px]
            font-semibold
            leading-tight
            tracking-[-0.015em]
            text-white
            sm:text-[14px]
          "
        >
          {product.name}
        </h3>

        <p
          className="
            mt-1
            text-[8px]
            leading-3
            text-white/80
            sm:text-[9px]
          "
        >
          {descriptions[index] ?? "Designed for everyday use."}
        </p>

        <div
          className="
            mt-3
            flex
            h-7
            items-center
            justify-between
            rounded-[6px]
            bg-white
            px-3
            text-[8px]
            font-semibold
            text-[#171717]
            sm:h-8
            sm:text-[9px]
          "
        >
          <span>Explore {product.name}</span>

          <ArrowRight
            size={11}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   FALLBACK CARD
========================================================= */

function FallbackCard({
  name,
  description,
  image,
}: {
  name: string;
  description: string;
  image: string;
}) {
  return (
    <div
      className="
        relative
        aspect-[0.78/1]
        overflow-hidden
        rounded-[9px]
        bg-[#F1F1F1]
      "
    >
      <img
        src={image}
        alt={name}
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
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
        <h3
          className="
            text-[12px]
            font-semibold
            text-white
          "
        >
          {name}
        </h3>

        <p
          className="
            mt-1
            text-[8px]
            text-white/75
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({
  name,
  review,
  image,
}: {
  name: string;
  review: string;
  image: string;
}) {
  return (
    <article
      className="
        group
        relative
        min-w-[220px]
        overflow-hidden
        rounded-[9px]
        border
        border-[#E4E4E4]
        bg-white
        shadow-[0_4px_14px_rgba(0,0,0,0.06)]
        sm:min-w-[250px]
        lg:min-w-0
      "
    >
      {/* REVIEW IMAGE */}

      <div
        className="
          relative
          aspect-[1.18/0.82]
          overflow-hidden
          bg-[#F3F3F3]
        "
      >
        <img
          src={image}
          alt={`${name} customer review`}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-[1.04]
          "
        />

        {/* PLAY BUTTON */}

        <button
          type="button"
          aria-label={`Play review from ${name}`}
          className="
            absolute
            left-1/2
            top-1/2
            flex
            h-12
            w-12
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/80
            bg-black/20
            text-white
            backdrop-blur-sm
            transition-all
            duration-300
            group-hover:scale-105
            group-hover:bg-[#0066E6]
          "
        >
          <Play
            size={17}
            fill="currentColor"
            className="ml-0.5"
          />
        </button>

        {/* STAR BADGE */}

        <div
          className="
            absolute
            -bottom-3
            left-1/2
            flex
            -translate-x-1/2
            items-center
            gap-[2px]
            rounded-[5px]
            bg-white
            px-2.5
            py-1.5
            shadow-[0_3px_12px_rgba(0,0,0,0.12)]
          "
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="
                text-[14px]
                leading-none
                text-[#00B67A]
              "
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* REVIEW TEXT */}

      <div className="px-3 pb-4 pt-6">
        <div
          className="
            flex
            items-center
            justify-center
            gap-1
            text-[10px]
            font-semibold
            text-[#171717]
          "
        >
          <span>{name}</span>

          <CheckCircle2
            size={11}
            className="text-[#0066E6]"
          />
        </div>

        <p
          className="
            mt-2
            line-clamp-4
            min-h-[62px]
            text-center
            text-[9px]
            leading-[1.55]
            text-[#303030]
          "
        >
          {review}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   COMMUNITY TRUST ITEM
========================================================= */

function TrustItem({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-1.5
        text-[8px]
        text-neutral-500
      "
    >
      <span className="text-[#0066E6]">
        {icon}
      </span>

      {label}
    </div>
  );
}

/* =========================================================
   TRUST BAR ITEM
========================================================= */

function TrustBarItem({
  icon,
  title,
  link,
  last = false,
}: {
  icon: ReactNode;
  title: string;
  link: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        flex
        min-h-[88px]
        flex-col
        items-center
        justify-center
        px-4
        py-4
        text-center
        ${
          !last
            ? "border-b border-[#E5E5E5] sm:border-b-0 sm:border-r sm:border-[#E5E5E5]"
            : ""
        }
      `}
    >
      <span className="text-[#171717]">
        {icon}
      </span>

      <p
        className="
          mt-2
          text-[9px]
          font-semibold
          text-[#171717]
        "
      >
        {title}
      </p>

      <Link
        to="/shop"
        className="
          mt-1.5
          text-[8px]
          text-neutral-500
          underline
          underline-offset-2
          transition-colors
          hover:text-[#0066E6]
        "
      >
        {link}
      </Link>
    </div>
  );
}