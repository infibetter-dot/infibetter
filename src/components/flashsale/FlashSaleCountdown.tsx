import { useEffect, useState } from "react";

interface Props {
  endAt: string;
}

interface CountdownState {
  day: number;
  hour: number;
  minute: number;
  second: number;
  expired: boolean;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export default function FlashSaleCountdown({
  endAt,
}: Props) {

  const [time, setTime] = useState<CountdownState>({
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    expired: false,
  });

  useEffect(() => {

    function updateCountdown() {

      if (!endAt) return;

      const diff =
        new Date(endAt).getTime() -
        Date.now();

      if (diff <= 0) {

        setTime({
          day: 0,
          hour: 0,
          minute: 0,
          second: 0,
          expired: true,
        });

        return;
      }

      setTime({
        day: Math.floor(diff / 86400000),
        hour: Math.floor(diff / 3600000) % 24,
        minute: Math.floor(diff / 60000) % 60,
        second: Math.floor(diff / 1000) % 60,
        expired: false,
      });
    }

    updateCountdown();

    const timer = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(timer);

  }, [endAt]);

  if (time.expired) {

    return (

      <div
        className="
          rounded-3xl
          bg-red-600
          px-8
          py-6
          text-center
          text-xl
          font-bold
          text-white
        "
      >
        Flash Sale đã kết thúc
      </div>

    );

  }

  const danger =
    time.day === 0 &&
    time.hour < 24;

  const superDanger =
    time.day === 0 &&
    time.hour < 3;

  const items = [

    {
      value: pad(time.day),
      label: "NGÀY",
    },

    {
      value: pad(time.hour),
      label: "GIỜ",
    },

    {
      value: pad(time.minute),
      label: "PHÚT",
    },

    {
      value: pad(time.second),
      label: "GIÂY",
    },

  ];

  return (

  <>

    <div className="mb-6 flex justify-center">

      <div
        className={`
          inline-flex
          items-center
          gap-2
          rounded-full
          px-5
          py-2
          text-sm
          font-bold
          text-white
          shadow-xl

          ${
            danger
              ? "bg-red-600 animate-pulse"
              : "bg-orange-500"
          }
        `}
      >

        🔥 Flash Sale sắp kết thúc

      </div>

    </div>

    <div
      className="
        flex
        justify-center
        gap-3

        sm:gap-4
      "
    >

      {items.map((item, index) => (

        <div
          key={index}
          className={`
            relative
            overflow-hidden

            rounded-2xl

            border

            ${
              superDanger
                ? "border-red-300 bg-gradient-to-b from-red-600 to-red-700 shadow-[0_15px_35px_rgba(239,68,68,.45)]"
                : danger
                ? "border-red-200 bg-gradient-to-b from-red-500 to-red-600 shadow-[0_12px_30px_rgba(239,68,68,.35)]"
                : "border-orange-300 bg-gradient-to-b from-orange-400 to-orange-600 shadow-[0_12px_30px_rgba(249,115,22,.25)]"
            }

            w-[72px]
            sm:w-[86px]

            px-3
            py-4

            text-center

            transition-all
            duration-300
          `}
        >

          <div
            className="
              absolute
              inset-0

              bg-white/10

              blur-2xl
            "
          />

          <div className="relative z-10">

            <p
              className={`
                text-3xl
                sm:text-4xl

                font-black

                tracking-tight

                ${
                  danger
                    ? "animate-pulse"
                    : ""
                }
              `}
            >

              {item.value}

            </p>

            <p
              className="
                mt-2

                text-[10px]
                sm:text-[11px]

                font-semibold

                tracking-[0.25em]

                text-white/80
              "
            >

              {item.label}

            </p>

          </div>

        </div>

      ))}

    </div>

        <div className="mt-6">

      <div className="flex items-center justify-between text-xs text-white/80">

        <span>Đã bán nhanh</span>

        <span>82%</span>

      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">

        <div
          className={`
            h-full
            rounded-full

            ${
              danger
                ? "bg-red-300 animate-pulse"
                : "bg-yellow-300"
            }

            transition-all
            duration-700
          `}
          style={{ width: "82%" }}
        />

      </div>

    </div>

    <p
      className={`
        mt-5

        text-center

        text-sm

        font-medium

        ${
          danger
            ? "text-yellow-200"
            : "text-white/90"
        }
      `}
    >

      ⚡ Giá sẽ trở về mức bình thường khi thời gian kết thúc.

    </p>

    {superDanger && (

      <div
        className="
          mt-4

          rounded-2xl

          border
          border-red-300

          bg-red-500/20

          px-5
          py-3

          text-center

          text-sm

          font-semibold

          text-white

          animate-pulse
        "
      >

        🚨 Chỉ còn vài giờ cuối cùng — đừng bỏ lỡ ưu đãi!

      </div>

    )}

  </>

);
}