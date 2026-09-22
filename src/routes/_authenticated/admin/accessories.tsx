import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AccessoryEditor, {
  type AccessoryForm,
} from "@/components/admin/AccessoryEditor";

export const Route = createFileRoute(
  "/_authenticated/admin/accessories"
)({
  component: AccessoriesPage,
});

type Accessory = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  stock: number;
  badge: string | null;
  badge_color: string | null;
  icon: string | null;
  active: boolean;
};

function AccessoriesPage() {
  const [items, setItems] = useState<Accessory[]>([]);

  const emptyAccessory: AccessoryForm = {
  name: "",
  description: "",
  image_url: "",
  price: 0,
  stock: 0,
  active: true,
  badge: "",
  badge_color: "",
  icon: "",
};

const [editorOpen, setEditorOpen] =
  useState(false);

const [accessory, setAccessory] =
  useState<AccessoryForm>(emptyAccessory);

  useEffect(() => {
    loadAccessories();
  }, []);

  async function loadAccessories() {
    const { data, error } = await supabase
      .from("accessories")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setItems((data ?? []) as Accessory[]);
  }

  return (
    <div className="container-x py-10">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Quản lý Phụ kiện
          </h1>

          <p className="mt-2 text-neutral-500">
            Quản lý phụ kiện mua kèm.
          </p>

        </div>

       <button
  onClick={() => {
    setAccessory(emptyAccessory);
    setEditorOpen(true);
  }}
  className="rounded-lg bg-black px-5 py-3 text-white"
>
  + Thêm phụ kiện
</button>

      </div>

     <div className="space-y-4">

  {items.length === 0 && (
    <div className="rounded-xl border bg-white p-12 text-center text-neutral-500">
      Chưa có phụ kiện nào.
    </div>
  )}

  {items.map((item) => (

    <div
      key={item.id}
      className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
    >

      <div className="flex items-center gap-5">

        {item.image_url ? (
          <img
            src={item.image_url}
            className="h-20 w-20 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-neutral-100 text-xs">
            No Image
          </div>
        )}

        <div>

          <h3 className="text-lg font-semibold">
            {item.name}
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            {item.description}
          </p>

          <div className="mt-3 flex gap-4 text-sm">

            <span>
              💰 {Number(item.price).toLocaleString("vi-VN")}₫
            </span>

            <span>
              📦 {item.stock}
            </span>

            <span
              className={
                item.active
                  ? "text-green-600"
                  : "text-red-500"
              }
            >
              {item.active
                ? "● Hoạt động"
                : "● Đã ẩn"}
            </span>

          </div>

        </div>

      </div>

      <div className="flex gap-2">

        <button
  onClick={() => {
    setAccessory({
      id: item.id,
      name: item.name,
      description: item.description || "",
      image_url: item.image_url || "",
      price: item.price,
      stock: item.stock,
      active: item.active,
      badge: item.badge || "",
      badge_color: item.badge_color || "",
      icon: item.icon || "",
    });

    setEditorOpen(true);
  }}
  className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-100"
>
  Sửa
</button>

       <button
  onClick={async () => {

    const ok = window.confirm(
      `Xóa "${item.name}" ?`
    );

    if (!ok) return;

    const { error } = await supabase
      .from("accessories")
      .delete()
      .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadAccessories();

  }}
  className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
>
  Xóa
</button>

      </div>

    </div>

  ))}

</div>

<AccessoryEditor
  open={editorOpen}
  accessory={accessory}
  onChange={setAccessory}
  onClose={() => setEditorOpen(false)}

  onSave={async () => {

  let error = null;

  if (accessory.id) {

    const result = await supabase
      .from("accessories")
      .update({
        name: accessory.name,
        description: accessory.description,
        image_url: accessory.image_url,
        price: accessory.price,
        stock: accessory.stock,
        active: accessory.active,
        badge: accessory.badge,
        badge_color: accessory.badge_color,
        icon: accessory.icon,
      })
      .eq("id", accessory.id);

    error = result.error;

  } else {

    const result = await supabase
      .from("accessories")
      .insert({
        name: accessory.name,
        description: accessory.description,
        image_url: accessory.image_url,
        price: accessory.price,
        stock: accessory.stock,
        active: accessory.active,
        badge: accessory.badge,
        badge_color: accessory.badge_color,
        icon: accessory.icon,
      });

    error = result.error;

  }

  if (error) {
    alert(error.message);
    return;
  }

  await loadAccessories();

  setAccessory(emptyAccessory);

  setEditorOpen(false);

}}
/>

    </div>
  );
}