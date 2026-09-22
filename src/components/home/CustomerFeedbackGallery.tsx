import { motion } from "framer-motion";

const feedbackImages = [
  "/images/customer-feedback-01.jpg",
  "/images/customer-feedback-02.jpg",
  "/images/customer-feedback-03.jpg",
  "/images/customer-feedback-04.jpg",
  "/images/customer-feedback-05.jpg",
  "/images/customer-feedback-06.jpg",
];

export default function CustomerFeedbackGallery() {
  const images = [...feedbackImages, ...feedbackImages];

  return (
    <section className="overflow-hidden bg-[var(--color-sand)] pb-10 sm:pb-14 lg:pb-16">
      <div className="mx-auto mb-7 max-w-xl px-4 text-center sm:mb-9">
        <p
  className="
    text-[11px]
    font-semibold
    uppercase
    tracking-[0.32em]
    text-[#6F8B5E]
    sm:text-xs
  "
>
  FROM OUR CUSTOMERS
</p>

<h2
  className="
    mt-3
    font-display
    text-4xl
    leading-[1.08]
    tracking-[-0.025em]
    text-[#292725]
    sm:text-5xl
    lg:text-6xl
  "
>
  Những không gian thật,
  <br />
  những câu chuyện thật.
</h2>

<p
  className="
    mx-auto
    mt-4
    max-w-2xl
    text-sm
    leading-7
    text-neutral-500
    sm:text-base
    lg:text-lg
  "
>
  Khám phá cách khách hàng Olive Living mang những thiết kế yêu thích
  vào từng góc nhỏ của không gian sống.
</p>
      </div>

      <div className="relative w-full overflow-hidden">

        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-12 bg-gradient-to-r from-[var(--color-sand)] to-transparent sm:w-20 lg:w-32" />

        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-12 bg-gradient-to-l from-[var(--color-sand)] to-transparent sm:w-20 lg:w-32" />

        <motion.div
          className="flex w-max gap-3 sm:gap-4 lg:gap-5"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          {images.map((image, index) => (
  <div
  key={`${image}-${index}`}
  className="
    group
    relative
    h-[250px]
    w-[185px]
    shrink-0
    overflow-hidden
    rounded-[14px]
    border
    border-[#E7DED3]
    bg-white
    shadow-[0_6px_24px_rgba(60,45,30,0.08)]

    sm:h-[300px]
    sm:w-[220px]

    lg:h-[340px]
    lg:w-[250px]

    xl:h-[360px]
    xl:w-[265px]
  "
>
  <img
    src={image}
    alt="Feedback khách hàng Olive Living"
    loading={index < 6 ? "eager" : "lazy"}
    className="
      block
      h-full
      w-full
      object-cover
      object-center
      transition-transform
      duration-700
      group-hover:scale-[1.02]
    "
  />
</div>
))}

        </motion.div>

      </div>
    </section>
  );
}
