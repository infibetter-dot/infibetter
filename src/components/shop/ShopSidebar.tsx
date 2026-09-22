import { Search } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Props {
  search: string;
  category?: string;
  categories: Category[];
  maxPrice: number;
  priceCap: number;
  onSearch: (value: string) => void;
  onCategoryChange: (slug?: string) => void;
  onPriceChange: (value: number) => void;
}

export default function ShopSidebar({
  search,
  category,
  categories,
  maxPrice,
  priceCap,
  onSearch,
  onCategoryChange,
  onPriceChange,
}: Props) {
  return (
    <aside className="space-y-8 rounded-3xl border border-neutral-200 bg-white p-6">

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Bộ lọc
        </h3>

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="h-12 w-full rounded-full border border-neutral-200 pl-11 pr-4 outline-none focus:border-black"
          />

        </div>
      </div>

      <div>

        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-500">
          Danh mục
        </p>

        <div className="space-y-3">

          <button
           type="button"
           onClick={() => onCategoryChange(undefined)}
            className={`block text-left ${
              !category ? "font-semibold" : "text-neutral-500"
            }`}
          >
            Tất cả
          </button>

        {categories.map((item) => (
  <button
    key={item.id}
  
    type="button"
    onClick={() => onCategoryChange(item.slug)}
    className={`block w-full text-left text-sm transition-colors hover:text-primary ${
      category === item.slug
        ? "font-semibold text-primary"
        : "text-neutral-500"
    }`}
  >
    {item.name}
  </button>
))}

        </div>

      </div>

      <div>

        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-neutral-500">
          Giá tối đa
        </p>

        <input
          type="range"
          min={100000}
          max={maxPrice}
          value={priceCap}
          onChange={(e) =>
            onPriceChange(Number(e.target.value))
          }
          className="w-full"
        />

      </div>

    </aside>
  );
}