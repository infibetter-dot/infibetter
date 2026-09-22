import { forwardRef } from "react";
import { format } from "date-fns";

interface VoucherGiftCardProps {
  voucher: {
    code: string;
    title: string;
    description: string;
    type: string;
    value: number;
    min_order: number;
    end_at: string;
  };
}

const VoucherGiftCard = forwardRef<
  HTMLDivElement,
  VoucherGiftCardProps
>(({ voucher }, ref) => {

  const discount =
    voucher.type === "percent"
      ? `${voucher.value}% OFF`
      : voucher.type === "fixed"
      ? `${Number(voucher.value).toLocaleString("vi-VN")}đ`
      : "ƯU ĐÃI";

  return (

    <div
  ref={ref}
  className="
    relative
    w-full

    rounded-[28px]

    border
    border-[#E7DAC9]

    bg-[#FBF8F3]

    shadow-[0_20px_50px_rgba(0,0,0,.08)]
  "
>

      {/* Background */}

      <div
        className="
          absolute
          inset-0

          bg-[radial-gradient(circle_at_top_right,#F2E6D7,transparent_40%)]
        "
      />

      <div
        className="
          absolute

          -bottom-16
          -left-16

          h-44
          w-44

          rounded-full

          bg-[#DDEEE4]

          opacity-40

          blur-[70px]
        "
      />

      {/* Border */}

      <div
        className="
          absolute

          inset-4

          rounded-[22px]

          border

          border-dashed

          border-[#E7DAC9]
        "
      />

      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}

      <div className="relative z-10 p-6">

        {/* Header */}

        <div className="flex items-start justify-between">

          <div>

            <p
              className="
                text-[11px]

                uppercase

                tracking-[0.45em]

                text-[#B78A63]
              "
            >
              OLIVE LIVING
            </p>

            <h2
              className="
                mt-2

                text-[30px]

                font-display

                leading-none
              "
            >
              Premium Voucher
            </h2>

          </div>

          <div
            className="
              rounded-full

              bg-gradient-to-r

              from-[#D8A252]

              to-[#C98731]

              px-5

              py-2.5

              text-lg

              font-black

              text-white
            "
          >
            {discount}
          </div>

        </div>

        {/* Divider */}

        <div className="my-5 h-px bg-[#E8DACB]" />

        {/* Voucher Code */}

        <p
          className="
            text-[11px]

            uppercase

            tracking-[0.35em]

            text-neutral-400
          "
        >
          Voucher Code
        </p>

        <h1
          className="
            mt-2

            font-display

            text-[42px]

            tracking-[0.08em]

            leading-none
          "
        >
          {voucher.code || "OLV-XXXXXX"}
        </h1>

        {/* Description */}

        <p
          className="
            mt-4

            text-[15px]

            leading-7

            text-neutral-600
          "
        >
          {voucher.description ||
            "Voucher dành riêng cho khách hàng của Olive Living."}
        </p>

                {/* ========================= */}
        {/* INFO */}
        {/* ========================= */}

        <div className="mt-6 rounded-2xl border border-[#E8DACB] bg-white/60">

          <div className="grid grid-cols-2 divide-x divide-[#E8DACB]">

            <div className="px-5 py-4">

              <p
                className="
                  text-[10px]

                  uppercase

                  tracking-[0.30em]

                  text-neutral-400
                "
              >
                Hạn sử dụng
              </p>

              <h3
                className="
                  mt-2

                  text-xl

                  font-bold
                "
              >
                {voucher.end_at
                  ? format(
                      new Date(voucher.end_at),
                      "dd/MM/yyyy"
                    )
                  : "--"}
              </h3>

            </div>

            <div className="px-5 py-4">

              <p
                className="
                  text-[10px]

                  uppercase

                  tracking-[0.30em]

                  text-neutral-400
                "
              >
                Đơn tối thiểu
              </p>

              <h3
                className="
                  mt-2

                  text-xl

                  font-bold
                "
              >
                {Number(
                  voucher.min_order || 0
                ).toLocaleString("vi-VN")}đ
              </h3>

            </div>

          </div>

        </div>

        {/* Divider */}

        <div className="my-5 h-px bg-[#E8DACB]" />

        {/* Footer */}

        <div className="flex items-center justify-between">

          <div>

            <h3
              className="
                font-display

                text-[26px]
              "
            >
              Olive Living
            </h3>

            <p
              className="
                mt-1

                text-sm

                text-neutral-500
              "
            >
              Minimal Living • Timeless Design
            </p>

          </div>

          <div
            className="
              rounded-full

              bg-[#F5EEE6]

              px-4

              py-2

              text-xs

              font-semibold

              tracking-[0.15em]

              text-[#B78A63]
            "
          >
            PREMIUM
          </div>

          </div>

                  {/* Decorative */}

        <div
          className="
            absolute

            -right-10

            -bottom-10

            h-28

            w-28

            rounded-full

            border

            border-[#E9DDCF]

            opacity-40
          "
        />

        <div
          className="
            absolute

            top-5

            right-5

            h-2

            w-2

            rounded-full

            bg-[#CFA06A]
          "
        />

        <div
          className="
            absolute

            top-10

            right-9

            h-1.5

            w-1.5

            rounded-full

            bg-[#DFC4A5]
          "
        />

        <div
          className="
            absolute

            top-16

            right-6

            h-1

            w-1

            rounded-full

            bg-[#EADBC9]
          "
        />

      </div>

    </div>
    
);

});

VoucherGiftCard.displayName = "VoucherGiftCard";

export default VoucherGiftCard;