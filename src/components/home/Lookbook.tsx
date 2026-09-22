import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import heroImg from "@/assets/hero/hero_4.png";

export default function Lookbook() {
  return (
    <section className="py-10 lg:py-16">

      <div
        className="
          relative
          overflow-hidden
          rounded-[24px]
          lg:rounded-[40px]
        "
      >

        <div
  className="
    relative

    h-[340px]

    md:h-[420px]

    lg:h-[560px]

    xl:h-[680px]

    overflow-hidden
  "
>

  <img
  src={heroImg}
  alt="Lookbook"
  className="
    absolute
    inset-0

    h-full
    w-full

    object-cover

    object-center

    transition
    duration-700

    hover:scale-105
  "
/>

</div>


        <div
          className="
            absolute
            inset-0

            flex
            items-center

            px-6
            lg:px-16
          "
        >

          <div className="max-w-[520px]
lg:max-w-[560px] text-white">

           

           

            <p
              className="
                mt-4

                max-w-md

                text-sm
                leading-6

                text-white/85

                lg:mt-6
                lg:text-lg
                lg:leading-8
              "
            >
              
            </p>

            <Link
  to="/shop"
  className="
    absolute

    left-5
    bottom-5

    inline-flex
    items-center
    gap-3

    rounded-full

    bg-white

    px-6
    py-3

    text-[14px]
    font-medium

    text-[#2F2F2F]

    shadow-[0_8px_25px_rgba(0,0,0,.12)]

    transition-all
    duration-300

    hover:-translate-y-0.5
    hover:bg-[#F7F5F2]

    md:left-10
    md:bottom-10

    lg:px-8
    lg:py-4
    lg:text-[15px]
  "
>
  Khám phá bộ sưu tập

  <ArrowRight
    size={18}
    className="
      transition-transform
      duration-300
      group-hover:translate-x-1
    "
  />
</Link>

          </div>

        </div>

      </div>

    </section>
  );
}