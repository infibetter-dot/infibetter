import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

interface ProductReview {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  content: string;
  image_url: string | null;
  video_url: string | null;
  verified_purchase: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

/* =========================================================
   TRUSTPILOT-INSPIRED COLORS
========================================================= */

const REVIEW_GREEN = "#00B67A";
const VERIFIED_GREEN = "#008F68";
const VERIFIED_BG = "#F0FAF7";

/* =========================================================
   TRUSTPILOT-STYLE STAR
========================================================= */

function ReviewStar({
  size = "sm",
  filled = true,
}: {
  size?: "sm" | "md";
  filled?: boolean;
}) {
  const boxSize =
    size === "md"
      ? "h-[17px] w-[17px]"
      : "h-[14px] w-[14px]";

  const iconSize =
    size === "md" ? 10 : 8;

  return (
    <span
      className={`
        inline-flex
        ${boxSize}
        shrink-0
        items-center
        justify-center
        ${
          filled
            ? "bg-[#00B67A]"
            : "bg-[#E6E6E6]"
        }
      `}
      aria-hidden="true"
    >
      <Star
        size={iconSize}
        strokeWidth={2.5}
        className="fill-white text-white"
      />
    </span>
  );
}

/* =========================================================
   STAR GROUP
========================================================= */

function ReviewStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const normalizedRating = Math.max(
    0,
    Math.min(
      5,
      Math.round(Number(rating)),
    ),
  );

  return (
    <div
      className="flex items-center gap-[2px]"
      aria-label={`${normalizedRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <ReviewStar
            key={star}
            size={size}
            filled={
              star <=
              normalizedRating
            }
          />
        ),
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ProductReviews({
  productId,
}: ProductReviewsProps) {
  /* =======================================================
     LOCAL REVIEW LIST STATE

     Mobile  = 3 reviews
     Desktop = 4 reviews
  ======================================================= */

  const [showAllReviews, setShowAllReviews] =
    useState(false);

  const [isDesktop, setIsDesktop] =
    useState(false);

  /* =======================================================
     RESPONSIVE REVIEW COUNT

     This does NOT affect Supabase.
     It only controls how many reviews are rendered.
  ======================================================= */

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 768px)",
    );

    const updateViewport = () => {
      setIsDesktop(
        mediaQuery.matches,
      );
    };

    updateViewport();

    mediaQuery.addEventListener(
      "change",
      updateViewport,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateViewport,
      );
    };
  }, []);

  /* =======================================================
     QUERY
  ======================================================= */

  const reviewsQuery = useQuery({
    queryKey: [
      "product-reviews",
      productId,
    ],

    enabled: Boolean(productId),

    queryFn: async () => {
      const { data, error } =
        await supabase
          .from("product_reviews")
          .select(
            `
              id,
              product_id,
              customer_name,
              rating,
              title,
              content,
              image_url,
              video_url,
              verified_purchase,
              is_visible,
              sort_order,
              created_at
            `,
          )
          .eq(
            "product_id",
            productId,
          )
          .eq(
            "is_visible",
            true,
          )
          .order("sort_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        console.error(
          "PRODUCT REVIEWS QUERY ERROR:",
          error,
        );

        throw new Error(
          error.message,
        );
      }

      return (data ??
        []) as ProductReview[];
    },
  });

  const reviews =
    reviewsQuery.data ?? [];

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total =
      reviews.length;

    if (!total) {
      return {
        total: 0,
        average: 0,
        counts: [
          0,
          0,
          0,
          0,
          0,
        ],
      };
    }

    const counts = [
      0,
      0,
      0,
      0,
      0,
    ];

    reviews.forEach(
      (review) => {
        const rating =
          Math.max(
            1,
            Math.min(
              5,
              Number(
                review.rating,
              ),
            ),
          );

        counts[
          rating - 1
        ] += 1;
      },
    );

    const average =
      reviews.reduce(
        (
          sum,
          review,
        ) =>
          sum +
          Number(
            review.rating,
          ),
        0,
      ) / total;

    return {
      total,
      average,
      counts,
    };
  }, [reviews]);

  /* =======================================================
     INITIAL REVIEW COUNT

     Mobile: 3
     Desktop: 4
  ======================================================= */

  const initialReviewCount =
    isDesktop ? 4 : 3;

  /* =======================================================
     VISIBLE REVIEWS

     IMPORTANT:
     This is local UI filtering only.
     Supabase query remains unchanged.
  ======================================================= */

  const visibleReviews =
    showAllReviews
      ? reviews
      : reviews.slice(
          0,
          initialReviewCount,
        );

  const canToggleReviews =
    reviews.length >
    initialReviewCount;

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  const formatReviewDate = (
    date: string,
  ) => {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        year: "numeric",
      },
    ).format(
      new Date(date),
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    reviewsQuery.isLoading
  ) {
    return (
      <section className="border-t border-[#E5E5E5] bg-white">
        <div className="mx-auto max-w-[1000px] px-5 py-12 md:px-8 md:py-16">
          <div className="animate-pulse">
            <div className="mx-auto h-3 w-32 rounded bg-[#F2F2F2]" />

            <div className="mx-auto mt-3 h-8 w-64 rounded bg-[#F2F2F2]" />

            <div className="mx-auto mt-6 h-[220px] max-w-[900px] rounded-[16px] bg-[#F5F5F7]" />

            <div className="mx-auto mt-6 h-28 max-w-[900px] rounded bg-[#F5F5F7]" />
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY / ERROR
  ======================================================= */

  if (
    reviewsQuery.isError ||
    reviews.length === 0
  ) {
    return null;
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <section className="border-t border-[#E5E5E5] bg-white">
      <div
        className="
          mx-auto
          max-w-[1000px]
          px-4
          py-12
          sm:px-5
          md:px-8
          md:py-16
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center">
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-[#6B6B6B]
            "
          >
            Customer reviews
          </p>

          <h2
            className="
              mt-2
              text-[27px]
              font-semibold
              leading-[1.12]
              tracking-[-0.035em]
              text-[#111111]
              sm:text-[34px]
            "
          >
            What customers are saying
          </h2>

          {/* Overall rating */}

          <div className="mt-3 flex items-center justify-center gap-2">
            <ReviewStars
              rating={stats.average}
              size="sm"
            />

            <span className="text-[12px] font-semibold text-[#111111]">
              {stats.average.toFixed(1)}
            </span>

            <span className="text-[11px] text-[#6B6B6B]">
              · {stats.total} reviews
            </span>
          </div>
        </div>

        {/* =================================================
            REVIEW SUMMARY
        ================================================= */}

        <div
          className="
            mx-auto
            mt-6
            w-full
            max-w-[900px]
            overflow-hidden
            rounded-[14px]
            border
            border-[#E5E5E5]
            bg-white
            shadow-[0_2px_10px_rgba(0,0,0,0.04)]
            sm:mt-7
          "
        >
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-[175px_minmax(0,1fr)]
            "
          >
            {/* =================================================
                AVERAGE RATING
            ================================================= */}

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                border-b
                border-[#E5E5E5]
                px-4
                py-4
                md:border-b-0
                md:border-r
                md:px-5
                md:py-5
              "
            >
              <div
                className="
                  text-[34px]
                  font-semibold
                  leading-none
                  tracking-[-0.045em]
                  text-[#111111]
                  sm:text-[38px]
                "
              >
                {stats.average.toFixed(1)}
              </div>

              <div className="mt-1.5">
                <ReviewStars
                  rating={stats.average}
                  size="md"
                />
              </div>

              <p
                className="
                  mt-1
                  text-[10px]
                  leading-4
                  text-[#6B6B6B]
                "
              >
                Based on {stats.total} reviews
              </p>
            </div>

            {/* =================================================
                RATING DISTRIBUTION
            ================================================= */}

            <div
              className="
                flex
                flex-col
                justify-center
                px-4
                py-3.5
                sm:px-6
                sm:py-4
                md:px-8
                md:py-5
              "
            >
              {[5, 4, 3, 2, 1].map(
                (rating) => {
                  const count =
                    stats.counts[
                      rating - 1
                    ];

                  const percentage =
                    stats.total > 0
                      ? (count /
                          stats.total) *
                        100
                      : 0;

                  return (
                    <div
                      key={rating}
                      className="
                        flex
                        h-[23px]
                        min-w-0
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          w-[34px]
                          shrink-0
                          text-[10px]
                          leading-none
                          text-[#6B6B6B]
                        "
                      >
                        {rating} star
                      </span>

                      <div
                        className="
                          h-[5px]
                          min-w-0
                          flex-1
                          overflow-hidden
                          rounded-full
                          bg-[#E6E6E6]
                        "
                      >
                        <div
                          className="
                            h-full
                            rounded-full
                            bg-[#00B67A]
                            transition-all
                            duration-500
                          "
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span
                        className="
                          w-[18px]
                          shrink-0
                          text-right
                          text-[10px]
                          leading-none
                          text-[#6B6B6B]
                        "
                      >
                        {count}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            REVIEW LIST
        ================================================= */}

        <div
          className="
            mt-7
            divide-y
            divide-[#E5E5E5]
            border-y
            border-[#E5E5E5]
          "
        >
          {visibleReviews.map(
            (review) => (
              <article
                key={review.id}
                className="py-6"
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                  "
                >
                  {/* Review content */}

                  <div className="min-w-0">
                    {/* Stars */}

                    <ReviewStars
                      rating={
                        review.rating
                      }
                      size="sm"
                    />

                    {/* Title */}

                    {review.title && (
                      <h3
                        className="
                          mt-2
                          text-[14px]
                          font-semibold
                          tracking-[-0.01em]
                          text-[#111111]
                        "
                      >
                        {
                          review.title
                        }
                      </h3>
                    )}

                    {/* Content */}

                    <p
                      className="
                        mt-2
                        max-w-[720px]
                        text-[13px]
                        leading-6
                        text-[#424245]
                      "
                    >
                      {
                        review.content
                      }
                    </p>
                  </div>

                  {/* Customer */}

                  <div
                    className="
                      shrink-0
                      sm:text-right
                    "
                  >
                    <p
                      className="
                        text-[12px]
                        font-semibold
                        text-[#111111]
                      "
                    >
                      {
                        review.customer_name
                      }
                    </p>

                    {/* Verified purchase */}

                    {review.verified_purchase && (
                      <div
                        className="
                          mt-1
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          bg-[#F0FAF7]
                          px-1.5
                          py-0.5
                          text-[10px]
                          font-medium
                          text-[#008F68]
                          sm:justify-end
                        "
                      >
                        <CheckCircle2
                          size={11}
                          strokeWidth={2}
                          className="text-[#00B67A]"
                        />

                        <span>
                          Verified
                          purchase
                        </span>
                      </div>
                    )}

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-[#6B6B6B]
                      "
                    >
                      {formatReviewDate(
                        review.created_at,
                      )}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    MEDIA
                ================================================= */}

                {(review.image_url ||
                  review.video_url) && (
                  <div className="mt-4 flex gap-2">
                    {review.image_url && (
                      <img
                        src={
                          review.image_url
                        }
                        alt={`${review.customer_name} review`}
                        loading="lazy"
                        className="
                          h-20
                          w-20
                          rounded-[10px]
                          object-cover
                        "
                      />
                    )}

                    {review.video_url && (
                      <a
                        href={
                          review.video_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="
                          flex
                          h-20
                          items-center
                          rounded-[10px]
                          border
                          border-[#E5E5E5]
                          px-4
                          text-[11px]
                          font-medium
                          text-[#111111]
                          transition-colors
                          hover:bg-[#F5F5F5]
                        "
                      >
                        Watch video
                      </a>
                    )}
                  </div>
                )}
              </article>
            ),
          )}
        </div>

        {/* =================================================
            VIEW MORE / SHOW FEWER
        ================================================= */}

        {canToggleReviews && (
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={() =>
                setShowAllReviews(
                  (current) =>
                    !current,
                )
              }
              className="
                inline-flex
                min-h-[44px]
                items-center
                justify-center
                gap-1.5
                rounded-[8px]
                border
                border-[#E5E5E5]
                bg-white
                px-4
                text-[13px]
                font-medium
                text-[#111111]
                transition-colors
                duration-150
                hover:bg-[#F7F7F7]
                active:bg-[#F2F2F2]
              "
              aria-expanded={
                showAllReviews
              }
            >
              {showAllReviews ? (
                <>
                  <span>
                    Show fewer reviews
                  </span>

                  <ChevronUp
                    size={15}
                    strokeWidth={1.8}
                  />
                </>
              ) : (
                <>
                  <span>
                    View more reviews
                  </span>

                  <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                  />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}