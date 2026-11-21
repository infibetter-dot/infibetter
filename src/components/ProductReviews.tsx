import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type FormEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  ImagePlus,
  X,
  LoaderCircle,
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

  // Review submission state
  const [formOpen, setFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [customerName, setCustomerName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handleReviewPhotoChange(file: File | null) {
    if (!file) return;

    const isImage =
      file.type.startsWith("image/") ||
      /\\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name);

    if (!isImage) {
      window.alert("Please choose an image file (JPG, PNG, WEBP, GIF, BMP or AVIF).");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      window.alert("Image size must be 10 MB or less.");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }

    setReviewPhoto(file);
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productId || !customerName.trim() || !reviewContent.trim()) return;

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (reviewPhoto) {
        const safeName = reviewPhoto.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        // INFIBETTER stores customer review photos in Cloudflare R2,
        // using the same Worker already used by ProductGallery / product admin.
        const R2_WORKER_URL =
          "https://nova-deal-spot-upload.97protech-work.workers.dev";

        const extension =
          reviewPhoto.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName =
          `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const r2Key = `${productId}/reviews/${fileName}`;
        const uploadUrl = `${R2_WORKER_URL}/${r2Key
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`;

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: reviewPhoto,
          headers: {
            "Content-Type":
              reviewPhoto.type ||
              `image/${extension === "jpg" ? "jpeg" : extension}`,
          },
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(
            `Cloudflare R2 upload failed: ${uploadResponse.status} ${errorText}`,
          );
        }

        // The Worker URL is also the public image URL used by INFIBETTER.
        imageUrl = uploadUrl;
      }

      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        customer_name: customerName.trim(),
        rating: formRating,
        title: reviewTitle.trim() || null,
        content: reviewContent.trim(),
        image_url: imageUrl,
        is_visible: false,
        verified_purchase: false,
      });

      if (error) throw error;

      window.alert("Thank you! Your review and photo have been submitted. The photo is stored on Cloudflare R2 and the review will appear after approval.");
      setFormOpen(false);
      setFormRating(5);
      setCustomerName("");
      setReviewTitle("");
      setReviewContent("");
      setReviewPhoto(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      await reviewsQuery.refetch();
    } catch (error) {
      console.error("SUBMIT PRODUCT REVIEW ERROR:", error);
      window.alert("Unable to submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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

  const reviews = useMemo(() => {
    const rows = reviewsQuery.data ?? [];

    // Preserve Admin ordering within each group, but show customer media first.
    const withPhotos = rows.filter((review) => Boolean(review.image_url));
    const withVideos = rows.filter(
      (review) => !review.image_url && Boolean(review.video_url),
    );
    const textOnly = rows.filter(
      (review) => !review.image_url && !review.video_url,
    );

    return [...withPhotos, ...withVideos, ...textOnly];
  }, [reviewsQuery.data]);

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

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            aria-expanded={formOpen}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#00B67A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#009E69]"
          >
            {formOpen ? <X size={16} /> : <Star size={16} />}
            {formOpen ? "Close review form" : "Write a Review"}
          </button>
        </div>

        {formOpen && (
          <form
            onSubmit={handleReviewSubmit}
            className="mx-auto mt-6 max-w-[900px] rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:p-6"
          >
            <h3 className="text-base font-semibold text-[#111111]">Share your experience</h3>
            <p className="mt-1 text-sm text-[#6B6B6B]">Your feedback helps other customers choose.</p>

            <label className="mt-5 block text-xs font-semibold text-[#333333]">Your rating</label>
            <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={formRating === star}
                  aria-label={`${star} stars`}
                  onClick={() => setFormRating(star)}
                  className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-[#00B67A]"
                >
                  <Star size={24} className={star <= formRating ? "fill-[#00B67A] text-[#00B67A]" : "text-[#D1D5DB]"} />
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="product-review-name" className="mb-1.5 block text-xs font-medium text-[#333333]">Name *</label>
                <input
                  id="product-review-name"
                  required
                  maxLength={80}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Your name"
                  className="h-11 w-full rounded-lg border border-[#D9DDE2] px-3 text-sm outline-none focus:border-[#00B67A]"
                />
              </div>
              <div>
                <label htmlFor="product-review-title" className="mb-1.5 block text-xs font-medium text-[#333333]">Review title (optional)</label>
                <input
                  id="product-review-title"
                  maxLength={120}
                  value={reviewTitle}
                  onChange={(event) => setReviewTitle(event.target.value)}
                  placeholder="Give your review a title"
                  className="h-11 w-full rounded-lg border border-[#D9DDE2] px-3 text-sm outline-none focus:border-[#00B67A]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="product-review-content" className="mb-1.5 block text-xs font-medium text-[#333333]">Your review *</label>
              <textarea
                id="product-review-content"
                required
                minLength={5}
                maxLength={3000}
                rows={4}
                value={reviewContent}
                onChange={(event) => setReviewContent(event.target.value)}
                placeholder="What did you think about this product?"
                className="w-full resize-y rounded-lg border border-[#D9DDE2] px-3 py-2.5 text-sm leading-6 outline-none focus:border-[#00B67A]"
              />
            </div>

            <div className="mt-4">
              <span className="block text-xs font-medium text-[#333333]">Add a photo (optional)</span>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif"
                className="sr-only"
                onChange={(event) => handleReviewPhotoChange(event.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-dashed border-[#D1D5DB] px-3 py-2 text-xs text-[#333333] hover:border-[#00B67A]"
              >
                <ImagePlus size={16} /> Choose photo
              </button>
              {reviewPhoto && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-2.5">
                  <img
                    src={URL.createObjectURL(reviewPhoto)}
                    alt="Selected review upload preview"
                    className="h-16 w-16 rounded-lg bg-white object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[#333333]">{reviewPhoto.name}</p>
                    <p className="mt-1 text-[11px] text-[#777777]">
                      {(reviewPhoto.size / 1024).toFixed(1)} KB · Ready to upload
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewPhoto(null);
                      if (photoInputRef.current) photoInputRef.current.value = "";
                    }}
                    aria-label="Remove photo"
                    className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
              <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#00B67A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#009E69] disabled:cursor-not-allowed disabled:opacity-60">
                {submitting && <LoaderCircle size={16} className="animate-spin" />}
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button type="button" disabled={submitting} onClick={() => setFormOpen(false)} className="min-h-11 rounded-lg border border-[#D9DDE2] px-5 py-3 text-sm text-[#333333] hover:bg-[#F7F7F7]">
                Cancel
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[#777777]">Reviews are checked before they appear publicly.</p>
          </form>
        )}

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