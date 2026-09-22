export default function ShopHero() {
  return (
    <section className="mb-16 overflow-hidden rounded-[32px] bg-[#F7F5F2]">
      <div className="grid items-center gap-12 px-8 py-16 lg:grid-cols-2 lg:px-20">

        <div>

          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            OLIVE LIVING
          </p>

          <h1 className="mt-6 font-display text-5xl leading-tight lg:text-6xl">
            Bộ sưu tập
            <br />
            đèn decor
          </h1>

          <p className="mt-8 max-w-xl text-neutral-500 leading-8">
            Những thiết kế tối giản dành cho không gian sống hiện đại,
            mang lại cảm giác ấm áp và cân bằng cho mỗi góc nhà.
          </p>

        </div>

        <div className="flex justify-end">

          <div className="rounded-full border border-neutral-300 px-8 py-3 text-sm uppercase tracking-[0.25em]">
            Collection
          </div>

        </div>

      </div>
    </section>
  );
}