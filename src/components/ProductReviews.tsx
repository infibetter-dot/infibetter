import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Star } from "lucide-react";

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

export default function ProductReviews({
  productId,
}: ProductReviewsProps) {
  const reviewsQuery = useQuery({
    queryKey: ["product-reviews", productId],
    enabled: Boolean(productId),
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq("product_id", productId)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("PRODUCT REVIEWS QUERY ERROR:", error);
        throw new Error(error.message);
      }

      return (data ?? []) as ProductReview[];
    },
  });

  const reviews = reviewsQuery.data ?? [];

  const stats = useMemo(() => {
    const total = reviews.length;

    if (!total) {
      return {
        total: 0,
        average: 0,
        counts: [0, 0, 0, 0, 0],
      };
    }

    const counts = [0, 0, 0, 0, 0];

    reviews.forEach((review) => {
      const rating = Math.max(1, Math.min(5, Number(review.rating)));
      counts[rating - 1] += 1;
    });

    const average =
      reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
      total;

    return {
      total,
      average,
      counts,
    };
  }, [reviews]);

  if (reviewsQuery.isLoading) {
    return (
      <section className="border-t border-[#D2D2D7] bg-white">
        <div className="mx-auto max-w-[1000px] px-5 py-14 md:px-8 lg:py-20">
          <div className="animate-pulse">
            <div className="mx-auto h-8 w-52 rounded bg-[#F2F2F2]" />
            <div className="mt-8 h-32 rounded-[18px] bg-[#F5F5F7]" />
            <div className="mt-5 h-28 rounded-[18px] bg-[#F5F5F7]" />
          </div>
        </div>
      </section>
    );
  }

  if (reviewsQuery.isError || reviews.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[#D2D2D7] bg-white">
      <div className="mx-auto max-w-[1000px] px-5 py-14 md:px-8 lg:py-20">
        {/* HEADER */}
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6E6E73]">
            Customer reviews
          </p>

          <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.035em] sm:text-[34px]">
            What customers are saying
          </h2>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  className="fill-[#FFB800] text-[#FFB800]"
                  strokeWidth={1.5}
                />
              ))}
            </div>

            <span className="text-[13px] font-semibold">
              {stats.average.toFixed(1)}
            </span>

            <span className="text-[13px] text-[#6E6E73]">
              · {stats.total} reviews
            </span>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-8 grid gap-6 rounded-[20px] border border-[#E5E5EA] bg-[#FAFAFA] p-5 sm:grid-cols-[180px_1fr] sm:p-6">
          <div className="flex flex-col items-center justify-center border-b border-[#E5E5EA] pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
            <div className="text-[42px] font-semibold leading-none tracking-[-0.04em]">
              {stats.average.toFixed(1)}
            </div>

            <div className="mt-3 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className="fill-[#FFB800] text-[#FFB800]"
                />
              ))}
            </div>

            <p className="mt-2 text-[11px] text-[#6E6E73]">
              Based on {stats.total} reviews
            </p>
          </div>

          <div className="flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.counts[rating - 1];
              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0;

              return (
                <div
                  key={rating}
                  className="flex items-center gap-3 text-[11px]"
                >
                  <span className="w-7 shrink-0 text-[#6E6E73]">
                    {rating} star
                  </span>

                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E5E5EA]">
                    <div
                      className="h-full rounded-full bg-[#1D1D1F]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-5 text-right text-[#86868B]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-8 divide-y divide-[#E5E5EA] border-y border-[#E5E5EA]">
          {reviews.map((review) => (
            <article key={review.id} className="py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        className={
                          star <= review.rating
                            ? "fill-[#FFB800] text-[#FFB800]"
                            : "text-[#D2D2D7]"
                        }
                      />
                    ))}
                  </div>

                  {review.title && (
                    <h3 className="mt-2 text-[14px] font-semibold tracking-[-0.01em]">
                      {review.title}
                    </h3>
                  )}

                  <p className="mt-2 max-w-[720px] text-[13px] leading-6 text-[#424245]">
                    {review.content}
                  </p>
                </div>

                <div className="shrink-0 sm:text-right">
                  <p className="text-[12px] font-semibold text-[#1D1D1F]">
                    {review.customer_name}
                  </p>

                  {review.verified_purchase && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#34A853] sm:justify-end">
                      <CheckCircle2 size={12} />
                      <span>Verified purchase</span>
                    </div>
                  )}

                  <p className="mt-1 text-[10px] text-[#86868B]">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      year: "numeric",
                    }).format(new Date(review.created_at))}
                  </p>
                </div>
              </div>

              {(review.image_url || review.video_url) && (
                <div className="mt-4 flex gap-2">
                  {review.image_url && (
                    <img
                      src={review.image_url}
                      alt={`${review.customer_name} review`}
                      className="h-20 w-20 rounded-[10px] object-cover"
                    />
                  )}

                  {review.video_url && (
                    <a
                      href={review.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-20 items-center rounded-[10px] border border-[#E5E5EA] px-4 text-[11px] font-medium hover:bg-[#F5F5F7]"
                    >
                      Watch video
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
