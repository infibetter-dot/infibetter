interface Props {
  total: number;
  sort: string;
  onSortChange: (value: "newest" | "best") => void;
}

export default function ShopToolbar({
  total,
  sort,
  onSortChange,
}: Props) {
  return (
    <div className="mb-10 flex flex-col gap-5 border-b border-neutral-200 pb-6 lg:flex-row lg:items-center lg:justify-between">

      <div>

        <p className="text-sm text-neutral-500">
          Hiển thị
        </p>

        <h2 className="mt-1 text-2xl font-medium">
          {total} sản phẩm
        </h2>

      </div>

      <div className="flex items-center gap-3">

        <span className="text-sm text-neutral-500">
          Sắp xếp
        </span>

        <select
          value={sort}
          onChange={(e) =>
            onSortChange(
              e.target.value as "newest" | "best"
            )
          }
          className="rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm outline-none transition focus:border-black"
        >
          <option value="newest">
            Mới nhất
          </option>

          <option value="best">
            Bán chạy
          </option>

        </select>

      </div>

    </div>
  );
}