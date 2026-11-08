import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImagePlus, RefreshCw, Save, Layers3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute(
  "/_authenticated/admin/homepage-categories",
)({
  component: HomepageCategoriesPage,
});

type Category = {
  id: string;
  name: string;
  slug: string | null;
  parent_id: string | null;
};

type Tile = {
  position: number;
  category_id: string;
  title: string;
  image_url: string;
  is_active: boolean;
};

const EMPTY_TILES: Tile[] = [1, 2, 3].map((position) => ({
  position,
  category_id: "",
  title: "",
  image_url: "",
  is_active: true,
}));

function HomepageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tiles, setTiles] = useState<Tile[]>(EMPTY_TILES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");

      const [categoryResult, tileResult] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, slug, parent_id")
          .order("name"),

        (supabase as any)
          .from("homepage_category_tiles")
          .select("*")
          .order("position"),
      ]);

      if (!mounted) return;

      if (categoryResult.error || tileResult.error) {
        setError(
          categoryResult.error?.message ||
            tileResult.error?.message ||
            "Không thể tải dữ liệu.",
        );
        setLoading(false);
        return;
      }

      setCategories(categoryResult.data ?? []);

      const savedTiles = (tileResult.data ?? []) as Tile[];

      setTiles(
        EMPTY_TILES.map((empty) => {
          const saved = savedTiles.find(
            (item) => item.position === empty.position,
          );

          return saved
            ? {
                ...empty,
                ...saved,
                title: saved.title ?? "",
                image_url: saved.image_url ?? "",
              }
            : empty;
        }),
      );

      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = categories.flatMap((root) => {
    if (root.parent_id) return [];

    const children = categories.filter(
      (item) => item.parent_id === root.id,
    );

    return [
      { id: root.id, label: root.name },
      ...children.map((child) => ({
        id: child.id,
        label: `— ${child.name}`,
      })),
    ];
  });

  function updateTile(position: number, patch: Partial<Tile>) {
    setTiles((current) =>
      current.map((tile) =>
        tile.position === position ? { ...tile, ...patch } : tile,
      ),
    );
  }

  async function handleSave() {
    setError("");

    const selectedIds = tiles
      .filter((tile) => tile.category_id)
      .map((tile) => tile.category_id);

    if (new Set(selectedIds).size !== selectedIds.length) {
      setError("Không được chọn trùng danh mục.");
      return;
    }

    setSaving(true);

    try {
      for (const tile of tiles) {
        if (!tile.category_id) {
          const { error } = await (supabase as any)
            .from("homepage_category_tiles")
            .delete()
            .eq("position", tile.position);

          if (error) throw error;
          continue;
        }

        const { error } = await (supabase as any)
          .from("homepage_category_tiles")
          .upsert(
            {
              position: tile.position,
              category_id: tile.category_id,
              title: tile.title.trim() || null,
              image_url: tile.image_url.trim() || null,
              is_active: tile.is_active,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "position" },
          );

        if (error) throw error;
      }

      alert("Đã lưu cấu hình Homepage Categories.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu cấu hình.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-neutral-500">
        <RefreshCw size={17} className="animate-spin" />
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              INFIBETTER · ADMIN
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Homepage Categories
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Quản lý 3 danh mục hiển thị trên trang chủ.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu cấu hình
          </button>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-3">
          {tiles.map((tile) => {
            const selected = categories.find(
              (category) => category.id === tile.category_id,
            );

            return (
              <article
                key={tile.position}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Homepage tile
                    </p>
                    <h2 className="mt-1 font-semibold text-neutral-900">
                      Vị trí {tile.position}
                    </h2>
                  </div>
                  <Layers3 size={20} className="text-neutral-400" />
                </div>

                <div className="space-y-4 p-5">
                  <div className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    {tile.image_url ? (
                      <img
                        src={tile.image_url}
                        alt={tile.title || selected?.name || "Category"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
                        <ImagePlus size={28} />
                        <span className="text-xs">Chưa có hình ảnh</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-neutral-600">
                      Chọn danh mục
                    </label>
                    <select
                      value={tile.category_id}
                      onChange={(event) =>
                        updateTile(tile.position, {
                          category_id: event.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-emerald-700"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-neutral-600">
                      Tiêu đề hiển thị
                    </label>
                    <input
                      value={tile.title}
                      onChange={(event) =>
                        updateTile(tile.position, {
                          title: event.target.value,
                        })
                      }
                      placeholder={selected?.name || "Tên danh mục"}
                      className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-neutral-600">
                      Image URL
                    </label>
                    <input
                      value={tile.image_url}
                      onChange={(event) =>
                        updateTile(tile.position, {
                          image_url: event.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-700"
                    />
                  </div>

                  <label className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-3">
                    <span className="text-sm font-medium text-neutral-700">
                      Hiển thị trên Homepage
                    </span>
                    <input
                      type="checkbox"
                      checked={tile.is_active}
                      onChange={(event) =>
                        updateTile(tile.position, {
                          is_active: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-emerald-700"
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
