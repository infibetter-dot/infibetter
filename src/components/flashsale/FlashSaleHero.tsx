import { Flame, Timer, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlashSaleCountdown from "./FlashSaleCountdown";

interface Props {
  endAt: string;
}

export default function FlashSaleHero({
  endAt,
}: Props) {

  const scrollProducts = () => {

    document
      .getElementById("flash-products")
      ?.scrollIntoView({
        behavior: "smooth",
      });

  };

  return (

    <section
  className="
    relative
    overflow-hidden
    rounded-3xl

    bg-gradient-to-r
    from-orange-500
    via-red-500
    to-pink-500

    px-5
    py-10

    sm:px-8
    sm:py-16

    text-white
    shadow-xl
  "
>

      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />

      <div
  className="
    relative
    mx-auto
    flex
    max-w-7xl
    flex-col
    gap-10

    lg:flex-row
    lg:items-center
    lg:justify-between
  "
>

        <div className="max-w-xl">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">

            <Flame className="h-5 w-5" />

            <span className="font-semibold">

              FLASH SALE 14.07 → 19.07

            </span>

          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-none">

            GIẢM

            <span className="block text-yellow-300">

              ĐẾN 40%

            </span>

          </h1>

          <p className="mt-6 text-lg text-white/90">

            Chỉ áp dụng trong thời gian diễn ra Flash Sale.

            Giá sẽ quay về bình thường sau khi kết thúc.

          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">

            <Button
              size="lg"
              className="bg-white text-red-600 hover:bg-neutral-100"
              onClick={scrollProducts}
            >
              Mua ngay
            </Button>

            <Button
  size="lg"
  variant="outline"
  className="border-white bg-transparent font-semibold text-white hover:bg-white hover:text-red-600"
>
  Xem ưu đãi
</Button>

          </div>

        </div>

        <div className="w-full max-w-[420px] rounded-3xl bg-white/15 p-6 backdrop-blur">

  <div className="mb-5 flex items-center gap-2">

    <Timer className="h-6 w-6" />

    <span className="font-semibold text-lg">

      Kết thúc sau

    </span>

  </div>

  <FlashSaleCountdown
    endAt={endAt}
  />



</div>

      </div>

      <button
        onClick={scrollProducts}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <ArrowDown className="h-7 w-7" />
      </button>

    </section>

  );

}