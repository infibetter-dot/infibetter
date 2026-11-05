import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Image as ImageIcon,
  MessageSquare,
  Play,
  Star,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ReviewRow = {
  id: string;
  product_id: string;
  customer_name: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  verified_purchase: boolean | null;
  created_at: string;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
};

type Review = ReviewRow & {
  product_name: string;
  product_slug: string;
};

const PAGE_SIZE = 12;

export const Route = createFileRoute("/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [mediaOnly, setMediaOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError(null);

      try {
        // Only approved reviews are public. Exclude AI-generated demo entries.
        const { data: reviewData, error: reviewError } = await supabase
          .from("product_reviews")
          .select(
            "id, product_id, customer_name, rating, title, content, image_url, video_url, verified_purchase, created_at",
          )
          .eq("is_visible", true)
          .not("title", "ilike", "[SAMPLE]%")
          .order("created_at", { ascending: false });

        if (reviewError) throw reviewError;

        const rows = (reviewData ?? []) as ReviewRow[];
        const productIds = [...new Set(rows.map((review) => review.product_id).filter(Boolean))];

        let productMap = new Map<string, ProductRow>();

        if (productIds.length > 0) {
          const { data: productData, error: productError } = await supabase
            .from("products")
            .select("id, name, slug")
            .in("id", productIds);

          if (productError) throw productError;

          productMap = new Map(
            ((productData ?? []) as ProductRow[]).map((product) => [
              product.id,
              product,
            ]),
          );
        }

        const mapped: Review[] = rows.map((review) => {
          const product = productMap.get(review.product_id);
          return {
            ...review,
            product_name: product?.name ?? "INFIBETTER Product",
            product_slug: product?.slug ?? "",
          };
        });

        if (active) setReviews(mapped);
      } catch (err) {
        console.error("Failed to load product reviews:", err);
        if (active) {
          setError(
            "We couldn't load reviews right now. Please refresh the page and try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, []);

  const products = useMemo(() => {
    const unique = new Map<string, string>();
    reviews.forEach((review) => {
      unique.set(review.product_id, review.product_name);
    });
    return [...unique.entries()].map(([id, name]) => ({ id, name }));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesProduct =
        selectedProduct === "all" || review.product_id === selectedProduct;
      const matchesRating =
        selectedRating === "all" || review.rating === Number(selectedRating);
      const matchesMedia =
        !mediaOnly || Boolean(review.image_url || review.video_url);
      return matchesProduct && matchesRating && matchesMedia;
    });
  }, [reviews, selectedProduct, selectedRating, mediaOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const visibleReviews = filteredReviews.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [selectedProduct, selectedRating, mediaOnly]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <main className="mx-auto min-h-[65vh] w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-7">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-neutral-500 transition hover:text-[#0066E6]"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>

      <section className="rounded-[20px] border border-[#E8E8E8] bg-white p-5 shadow-[0_3px_14px_rgba(17,24,39,0.035)] sm:p-8 lg:p-10">
        <div className="grid gap-7 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#0066E6] sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0066E6]" />
              Real customer feedback
            </p>
            <h1 className="max-w-2xl text-[30px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#111111] sm:text-[40px] lg:text-[48px]">
              What customers are saying
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-7 text-[#667085] sm:text-[14px]">
              Explore feedback on INFIBETTER accessories, from everyday charging
              to the essentials you take on the move.
            </p>
          </div>

          <div className="flex flex-col justify-center border-t border-[#E5E7EB] pt-6 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#0066E6] sm:text-[10px]">
              Review community
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[42px] font-semibold leading-none tracking-[-0.05em] text-[#111111]">
                {loading ? "—" : reviews.length.toLocaleString("en-US")}
              </span>
              <span className="text-[12px] text-[#667085]">published reviews</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-[#F5A623]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={15}
                    fill={index < Math.round(averageRating) ? "currentColor" : "none"}
                    strokeWidth={1.8}
                  />
                ))}
              </div>
              <span className="text-[12px] font-semibold text-[#202939]">
                {reviews.length ? averageRating.toFixed(1) : "—"}
              </span>
              <span className="text-[11px] text-[#667085]">average rating</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-[11px] text-[#344054]">
              <span className="inline-flex items-center gap-2">
                <ImageIcon size={14} className="text-[#0066E6]" />
                Photos & videos
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck size={14} className="text-[#0066E6]" />
                Verified buyers
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 sm:mt-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[22px] font-semibold tracking-[-0.035em] text-[#171717] sm:text-[26px]">
              Customer reviews
            </h2>
            <p className="mt-1 text-[11px] text-neutral-500">
              {loading
                ? "Loading reviews..."
                : `${filteredReviews.length} reviews`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedProduct}
              onChange={(event) => setSelectedProduct(event.target.value)}
              className="h-10 min-w-[170px] rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#344054] outline-none focus:border-[#0066E6]"
              aria-label="Filter by product"
            >
              <option value="all">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <select
              value={selectedRating}
              onChange={(event) => setSelectedRating(event.target.value)}
              className="h-10 min-w-[125px] rounded-xl border border-[#E5E7EB] bg-white px-3 text-[12px] text-[#344054] outline-none focus:border-[#0066E6]"
              aria-label="Filter by rating"
            >
              <option value="all">All ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={String(rating)}>
                  {rating} stars
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMediaOnly((value) => !value)}
              aria-pressed={mediaOnly}
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-[12px] font-medium transition ${
                mediaOnly
                  ? "border-[#0066E6] bg-[#EFF6FF] text-[#0057C2]"
                  : "border-[#E5E7EB] bg-white text-[#344054] hover:border-[#B8C7DA]"
              }`}
            >
              <ImageIcon size={14} />
              With media
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-2xl border border-[#EEEEEE] bg-white"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center text-[13px] text-red-700">
            {error}
          </div>
        ) : visibleReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D9DEE7] bg-white px-5 py-14 text-center">
            <MessageSquare className="mx-auto h-7 w-7 text-neutral-300" />
            <h3 className="mt-3 text-[15px] font-semibold text-[#202939]">
              No reviews found
            </h3>
            <p className="mt-1 text-[12px] text-neutral-500">
              There are no published reviews matching these filters yet.
            </p>
            {(selectedProduct !== "all" || selectedRating !== "all" || mediaOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct("all");
                  setSelectedRating("all");
                  setMediaOnly(false);
                }}
                className="mt-4 text-[12px] font-semibold text-[#0066E6] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleReviews.map((review) => (
                <article
                  key={review.id}
                  className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_2px_10px_rgba(17,24,39,0.025)]"
                >
                  {(review.image_url || review.video_url) && (
                    <div className="grid grid-cols-2 gap-1 bg-[#F5F6F8]">
                      {review.image_url && (
                        <a
                          href={review.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative block aspect-[4/3] overflow-hidden"
                        >
                          <img
                            src={review.image_url}
                            alt={`Review from ${review.customer_name ?? "customer"}`}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                          />
                        </a>
                      )}
                      {review.video_url && (
                        <a
                          href={review.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative flex aspect-[4/3] items-center justify-center bg-[#202939] text-white"
                        >
                          <Play size={24} fill="currentColor" />
                          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px]">
                            <Video size={12} /> Watch video
                          </span>
                        </a>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-0.5 text-[#F5A623]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={13}
                            fill={index < review.rating ? "currentColor" : "none"}
                            strokeWidth={1.8}
                          />
                        ))}
                      </div>
                      {review.verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-[#16865D]">
                          <BadgeCheck size={12} />
                          Verified buyer
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0066E6]">
                      {review.product_name}
                    </p>
                    {review.title && (
                      <h3 className="mt-1 text-[14px] font-semibold leading-snug text-[#202939]">
                        {review.title}
                      </h3>
                    )}
                    {review.content && (
                      <p className="mt-2 whitespace-pre-line text-[12px] leading-6 text-[#596273]">
                        {review.content}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-[#F0F1F3] pt-3">
                      <span className="text-[11px] font-medium text-[#344054]">
                        {review.customer_name || "Customer"}
                      </span>
                      <time className="text-[10px] text-neutral-400">
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-7 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[11px] font-medium text-[#344054] disabled:opacity-40"
                >
                  <ArrowLeft size={13} />
                  Previous
                </button>
                <span className="text-[11px] tabular-nums text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page === totalPages}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[11px] font-medium text-[#344054] disabled:opacity-40"
                >
                  Next
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

