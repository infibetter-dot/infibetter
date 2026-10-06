import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";

import {

  Plus,

  Palette,

  Trash2,

  X,

  Check,

} from "lucide-react";



interface Props {

  productId: string;

  onSaved?: () => void;

}



interface ColorRow {

  image_url: string;

  id?: string;

  name: string;

  hex: string;

  sku: string;

  price: number | null;

  stock: number;

  sort_order: number;

  material: string;

}



interface VariantOption {

  id: string;

  name: string;

  hex?: string | null;

  sort_order?: number | null;

}



const DEFAULT_COLOR = { name: "Trắng", hex: "#FFFFFF" };

const DEFAULT_MATERIAL = "Thép sơn đen";



const USD_TO_VND = 25500;



function formatVND(value: number | null | undefined) {

  const amount = Number(value ?? 0);



  if (!Number.isFinite(amount)) return "0 ₫";



  return `${Math.round(amount * USD_TO_VND).toLocaleString("vi-VN")} ₫`;

}



export default function ProductColors({

  productId,

  onSaved,

}: Props) {



  const [loading, setLoading] = useState(false);



  const [colors, setColors] = useState<ColorRow[]>([]);

  const [colorOptions, setColorOptions] = useState<VariantOption[]>([]);

  const [materialOptions, setMaterialOptions] = useState<VariantOption[]>([]);

  const [optionModal, setOptionModal] = useState<"color" | "material" | null>(null);

  const [optionName, setOptionName] = useState("");

  const [optionHex, setOptionHex] = useState("#FFFFFF");

  const [savingOption, setSavingOption] = useState(false);



  useEffect(() => {

    loadColors();

    loadVariantOptions();

  }, [productId]);



 async function loadColors() {

  const { data, error } = await supabase

    .from("product_colors")

    .select("*")

    .eq("product_id", productId)

    .order("sort_order");



  if (error) {

    toast.error(error.message);

    return;

  }



  setColors(data ?? []);

}



  async function loadVariantOptions() {

    const [colorResult, materialResult] = await Promise.all([

      supabase

        .from("variant_color_options")

        .select("id,name,hex,sort_order")

        .order("sort_order")

        .order("name"),

      supabase

        .from("variant_material_options")

        .select("id,name,sort_order")

        .order("sort_order")

        .order("name"),

    ]);



    if (colorResult.error) {

      toast.error(`Không thể tải danh sách màu: ${colorResult.error.message}`);

      return;

    }



    if (materialResult.error) {

      toast.error(`Không thể tải danh sách chất liệu: ${materialResult.error.message}`);

      return;

    }



    setColorOptions((colorResult.data ?? []) as VariantOption[]);

    setMaterialOptions((materialResult.data ?? []) as VariantOption[]);

  }



  function openOptionModal(type: "color" | "material") {

    setOptionModal(type);

    setOptionName("");

    setOptionHex("#FFFFFF");

  }



  function closeOptionModal() {

    if (savingOption) return;

    setOptionModal(null);

    setOptionName("");

  }



  async function createVariantOption() {

    const name = optionName.trim();



    if (!name) {

      toast.error(

        optionModal === "color"

          ? "Vui lòng nhập tên màu."

          : "Vui lòng nhập tên chất liệu."

      );

      return;

    }



    try {

      setSavingOption(true);



      if (optionModal === "color") {

        const { data: existing } = await supabase

          .from("variant_color_options")

          .select("id")

          .ilike("name", name)

          .maybeSingle();



        if (existing) {

          toast.error("Màu này đã tồn tại.");

          return;

        }



        const { data, error } = await supabase

          .from("variant_color_options")

          .insert({

            name,

            hex: optionHex || "#FFFFFF",

            sort_order: colorOptions.length,

          })

          .select("id,name,hex,sort_order")

          .single();



        if (error) throw error;



        setColorOptions((current) => [...current, data as VariantOption]);

        toast.success(`Đã thêm màu "${name}".`);

      } else {

        const { data: existing } = await supabase

          .from("variant_material_options")

          .select("id")

          .ilike("name", name)

          .maybeSingle();



        if (existing) {

          toast.error("Chất liệu này đã tồn tại.");

          return;

        }



        const { data, error } = await supabase

          .from("variant_material_options")

          .insert({

            name,

            sort_order: materialOptions.length,

          })

          .select("id,name,sort_order")

          .single();



        if (error) throw error;



        setMaterialOptions((current) => [...current, data as VariantOption]);

        toast.success(`Đã thêm chất liệu "${name}".`);

      }



      closeOptionModal();

    } catch (error: any) {

      toast.error(error?.message || "Không thể thêm lựa chọn.");

    } finally {

      setSavingOption(false);

    }

  }



  async function deleteVariantOption(

    type: "color" | "material",

    option: VariantOption

  ) {

    const table =

      type === "color"

        ? "variant_color_options"

        : "variant_material_options";



    const label = type === "color" ? "màu" : "chất liệu";



    if (!window.confirm(`Xóa ${label} "${option.name}" khỏi danh sách lựa chọn?`)) {

      return;

    }



    const { error } = await supabase

      .from(table)

      .delete()

      .eq("id", option.id);



    if (error) {

      toast.error(error.message);

      return;

    }



    if (type === "color") {

      setColorOptions((current) => current.filter((item) => item.id !== option.id));

    } else {

      setMaterialOptions((current) =>

        current.filter((item) => item.id !== option.id)

      );

    }



    toast.success(`Đã xóa ${label} "${option.name}".`);

  }



function addColor() {

  const firstColor = colorOptions[0] ?? {

    id: "",

    ...DEFAULT_COLOR,

  };



  const firstMaterial = materialOptions[0]?.name ?? DEFAULT_MATERIAL;



  setColors([

    ...colors,

    {

      name: firstColor.name,

      hex: firstColor.hex || DEFAULT_COLOR.hex,

      material: firstMaterial,

      image_url: "",

      sku: "",

      price: null,

      stock: 0,

      sort_order: colors.length,

    },

  ]);

}



  function update(index: number, field: keyof ColorRow, value: any) {

    const clone = [...colors];

    clone[index] = {

      ...clone[index],

      [field]: value,

    };

    setColors(clone);

  }



  async function uploadVariantImage(

  index: number,

  file: File

) {

  const MAX_SIZE = 5 * 1024 * 1024;



  if (!file.type.startsWith("image/")) {

    toast.error("Vui lòng chọn file hình ảnh.");

    return;

  }



  if (file.size > MAX_SIZE) {

    toast.error("Ảnh không được vượt quá 5MB.");

    return;

  }



  const R2_WORKER_URL =

    "https://nova-deal-spot-upload.97protech-work.workers.dev";



  const ext =

    file.name.split(".").pop()?.toLowerCase() || "jpg";



  const safeFileName = file.name

    .replace(/[^\w.\-() ]/g, "_")

    .replace(/\s+/g, "-");



  const fileName =

    `${Date.now()}-${Math.random()

      .toString(36)

      .slice(2)}-${safeFileName}`;



  // INFIBETTER dùng Cloudflare R2.

  // Worker này được bind với bucket: infibetter-assets.

  const filePath =

    `${productId}/variants/${fileName}`;



  const uploadUrl =

    `${R2_WORKER_URL}/${filePath

      .split("/")

      .map(encodeURIComponent)

      .join("/")}`;



  try {

    const response = await fetch(uploadUrl, {

      method: "PUT",

      body: file,

      headers: {

        "Content-Type":

          file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,

      },

    });



    if (!response.ok) {

      const errorText = await response.text();



      throw new Error(

        `R2 upload failed: ${response.status} ${errorText}`

      );

    }



    update(index, "image_url", uploadUrl);



    toast.success("Đã tải ảnh Variant lên R2.");

  } catch (error: any) {

    console.error("UPLOAD VARIANT IMAGE ERROR:", error);



    toast.error(

      error?.message || "Upload ảnh Variant thất bại."

    );

  }

}



  async function remove(index: number) {

  const color = colors[index];



  // Xóa trên giao diện

  setColors(colors.filter((_, i) => i !== index));



  // Nếu là màu mới thì thôi

  if (!color.id) return;



  const { error } = await supabase

    .from("product_colors")

    .delete()

    .eq("id", color.id);



  if (error) {

    toast.error(error.message);

    loadColors();

  }

}



  async function save() {

    try {

      setLoading(true);

      console.log("Before save:", colors);



      for (let i = 0; i < colors.length; i++) {

  const c = colors[i];



const payload = {



  image_url: c.image_url,

  product_id: productId,



  name: c.name,



  hex: c.hex,



  material: c.material,



  sku: String(c.sku ?? "").trim(),



  price: c.price,



  stock: c.stock,



  sort_order: i,

};



  if (c.id) {

    const { error } = await supabase

      .from("product_colors")

      .update(payload)

      .eq("id", c.id);



    if (error) throw error;

  } else {

    const { error } = await supabase

      .from("product_colors")

      .insert(payload);



    if (error) throw error;

  }

}



await loadColors();



onSaved?.();



toast.success("Đã lưu màu sắc");



} catch (err: any) {

  console.error(err);

  toast.error(err.message ?? "Lưu màu sắc thất bại");

} finally {

  setLoading(false);

}

}





  return (

    <section className="h-full rounded-2xl border border-stone-200 bg-white p-4 shadow-sm flex flex-col">



      <div className="mb-4 flex items-center justify-between gap-3 border-b border-stone-100 pb-3">

        <div className="min-w-0">

          <h3 className="text-sm font-semibold text-stone-900">

            Màu sắc & biến thể

          </h3>

          <p className="mt-0.5 text-[10px] text-stone-400">

            Quản lý màu, chất liệu, ảnh, SKU, giá và tồn kho.

          </p>

        </div>



        <button

          type="button"

          onClick={addColor}

          className="h-8 shrink-0 rounded-lg border border-stone-200 bg-white px-3 text-[11px] font-medium text-stone-700 transition hover:bg-stone-50"

        >

          + Thêm màu

        </button>

      </div>



      <div className="space-y-3">



        {colors.map((color, index) => (



          <div

  key={color.id ?? `new-${index}`}

  className="

rounded-xl

border

border-stone-200

bg-stone-50/30

p-3

shadow-none

space-y-2.5

"

>



  <div className="flex items-center justify-between">



<h4 className="text-sm font-semibold text-stone-900">



Variant #{index + 1}



</h4>



<button

type="button"

onClick={()=>remove(index)}

className="

h-7

rounded-lg

border

border-red-200

bg-white

px-2.5

text-[10px]

font-medium

text-red-500

hover:bg-red-50

"

>



 Xóa



</button>



</div>



 <div

className="

grid

min-w-0

grid-cols-1

gap-2

lg:grid-cols-3

items-stretch

"



>



{/* MÀU */}

<div className="min-w-0 h-full">

<label className="mb-1.5 block h-4 text-[10px] font-semibold leading-4 text-stone-700">

 Màu sắc

</label>



<select

  value={color.name}

  onChange={(e) => {

    const selected = colorOptions.find(

      (item) => item.name === e.target.value

    );



    if (!selected) return;



    // Cập nhật name + hex trong cùng một state update.

    // Gọi update() 2 lần liên tiếp có thể dùng state cũ và

    // khiến lần cập nhật name bị ghi đè.

    const clone = [...colors];

    clone[index] = {

      ...clone[index],

      name: selected.name,

      hex: selected.hex || "#FFFFFF",

    };

    setColors(clone);

  }}

  className="

    h-8

    w-full

    min-w-0

    rounded-lg

    border

    border-[#D8D8D8]

    bg-white

    px-2.5

    text-[10px]

    font-medium

    outline-none

    focus:border-[#2D6A4F]

    focus:ring-2

    focus:ring-[#DCEFE4]

  "

>

  <option value="">

    Chọn màu

  </option>

  {colorOptions.map((item) => (

    <option key={item.id} value={item.name}>

      {item.name}

    </option>

  ))}

</select>



<div className="mt-1.5 flex items-center justify-between gap-2">

  <div className="flex min-w-0 items-center gap-1.5">

    <span

      className="h-5 w-5 shrink-0 rounded-full border border-white shadow-sm ring-1 ring-stone-200"

      style={{ background: color.hex }}

    />

    <span className="truncate text-[9px] text-stone-600">

      {color.name || "Chưa chọn"}

    </span>

  </div>



  <div className="flex shrink-0 items-center gap-1">

    <button

      type="button"

      onClick={() => openOptionModal("color")}

      className="inline-flex h-7 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 text-[9px] font-medium text-stone-600 hover:bg-stone-50"

    >

      <Plus size={11} />

      Thêm màu

    </button>

  </div>

</div>

</div>



{/* CHẤT LIỆU */}

<div className="min-w-0 h-full">

<label className="mb-1.5 block h-4 text-[10px] font-semibold leading-4 text-stone-700">

 Chất liệu

</label>



<select

  value={color.material}

  onChange={(e) => update(index, "material", e.target.value)}

  className="

    h-8

    w-full

    min-w-0

    rounded-lg

    border

    border-[#D8D8D8]

    bg-white

    px-2.5

    text-[10px]

    font-medium

    outline-none

    focus:border-[#2D6A4F]

    focus:ring-2

    focus:ring-[#DCEFE4]

  "

>

  <option value="">

    Chọn chất liệu

  </option>

  {materialOptions.map((item) => (

    <option key={item.id} value={item.name}>

      {item.name}

    </option>

  ))}

</select>



<div className="mt-1.5 flex items-center justify-between gap-2">

  <span className="truncate text-[9px] text-stone-600">

    {color.material || "Chưa chọn"}

  </span>



  <button

    type="button"

    onClick={() => openOptionModal("material")}

    className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 text-[9px] font-medium text-stone-600 hover:bg-stone-50"

  >

    <Plus size={11} />

    Thêm chất liệu

  </button>

</div>

</div>



{/* ẢNH VARIANT */}

<div className="min-w-0 h-full">

<label className="mb-1.5 block h-4 text-[10px] font-semibold leading-4 text-stone-700">

 Ảnh Variant

</label>



<div className="flex items-center gap-2">

<div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">

<img

src={color.image_url || "/placeholder.svg"}

alt={color.name || "Ảnh Variant"}

className="h-full w-full object-cover"

/>

</div>



<div className="min-w-0 flex-1">

<label

className="

flex

h-8

w-full

cursor-pointer

items-center

justify-center

rounded-lg

border

border-[#D8D8D8]

bg-white

px-2

text-[10px]

font-medium

whitespace-nowrap

transition

hover:bg-neutral-50

"

>

Chọn ảnh

<input

hidden

type="file"

accept="image/*"

onChange={(e)=>{

const file=e.target.files?.[0];



if(file){

uploadVariantImage(index,file);

}

}}

/>

</label>



<p className="mt-0.5 text-[8px] leading-3 text-stone-400">

JPG, PNG · tối đa 5MB

</p>

</div>

</div>

</div>



</div>



            <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3 items-stretch">



  {/* SKU */}



  <div

    className="

    rounded-lg

    border

    border-stone-200

    bg-white

    p-2.5

    min-h-[94px]

    flex flex-col

    "

  >



    <label

      className="

      mb-2

      block

      text-[10px]

      font-semibold

      text-stone-700

      "

    >



       SKU



    </label>



    <input

      value={color.sku}

      placeholder="VD: BF-WAL-GOLD"

      onChange={(e)=>update(index,"sku",e.target.value)}

      className="

      h-8

      w-full

      rounded-lg

      border

      border-[#DDD]

      bg-white

      px-3

      text-xs

      font-medium

      outline-none

      focus:border-[#2D6A4F]

      "

    />



  </div>



  {/* GIÁ */}



  <div

    className="

    rounded-lg

    border

    border-stone-200

    bg-white

    p-2.5

    min-h-[94px]

    flex flex-col

    "

  >



    <label

      className="

      mb-2

      block

      text-[10px]

      font-semibold

      text-stone-700

      "

    >



       Giá bán (USD)



    </label>



    <div className="relative">

      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500">

        $

      </span>



      <input

      type="number"

      step="0.01"

      min="0"

      value={color.price ?? ""}

      onChange={(e)=>update(index,"price",Number(e.target.value))}

      className="

      h-8

      w-full

      rounded-lg

      border

      border-[#DDD]

      bg-white

      px-3

      text-xs

      font-semibold

      outline-none

      pl-7

      focus:border-[#2D6A4F]

      "

      />

    </div>



    <p className="mt-1 min-h-[10px] text-[8px] leading-3 text-neutral-400">

      Tham khảo: {formatVND(color.price)}

    </p>



  </div>



  {/* KHO */}



  <div

    className="

    rounded-lg

    border

    border-stone-200

    bg-white

    p-2.5

    min-h-[94px]

    flex flex-col

    "

  >



    <label

      className="

      mb-2

      block

      text-[10px]

      font-semibold

      text-stone-700

      "

    >



       Tồn kho



    </label>



    <input

      type="number"

      value={color.stock}

      onChange={(e)=>update(index,"stock",Number(e.target.value))}

      className="

      h-8

      w-full

      rounded-lg

      border

      border-[#DDD]

      bg-white

      px-3

      text-xs

      font-semibold

      outline-none

      focus:border-[#2D6A4F]

      "

    />



    <p className="mt-1 min-h-[10px] text-[8px] leading-3 text-neutral-500">



      {color.stock > 0

        ? `Còn ${color.stock} sản phẩm`

        : "Hết hàng"}



    </p>



  </div>



</div>



          </div>







        ))}



      </div>







      {optionModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-sm font-semibold text-stone-900">

                  {optionModal === "color" ? "Thêm màu sắc" : "Thêm chất liệu"}

                </h3>

                <p className="mt-0.5 text-[10px] text-stone-400">

                  Lựa chọn này sẽ được lưu và dùng lại cho các sản phẩm sau.

                </p>

              </div>



              <button

                type="button"

                onClick={closeOptionModal}

                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700"

              >

                <X size={15} />

              </button>

            </div>



            <div className="mt-4 space-y-3">

              <div>

                <label className="mb-1 block text-[10px] font-semibold text-stone-700">

                  {optionModal === "color" ? "Tên màu" : "Tên chất liệu"}

                </label>

                <input

                  autoFocus

                  value={optionName}

                  onChange={(e) => setOptionName(e.target.value)}

                  onKeyDown={(e) => {

                    if (e.key === "Enter") createVariantOption();

                  }}

                  placeholder={

                    optionModal === "color"

                      ? "Ví dụ: Xanh Sage"

                      : "Ví dụ: Gỗ Óc Chó"

                  }

                  className="h-9 w-full rounded-lg border border-stone-200 px-3 text-xs outline-none focus:border-[#2D6A4F]"

                />

              </div>



              {optionModal === "color" && (

                <div>

                  <label className="mb-1 block text-[10px] font-semibold text-stone-700">

                    Mã màu

                  </label>

                  <div className="flex items-center gap-2">

                    <input

                      type="color"

                      value={optionHex}

                      onChange={(e) => setOptionHex(e.target.value)}

                      className="h-9 w-11 cursor-pointer rounded-lg border border-stone-200 bg-white p-1"

                    />

                    <input

                      value={optionHex}

                      onChange={(e) => setOptionHex(e.target.value)}

                      className="h-9 flex-1 rounded-lg border border-stone-200 px-3 text-xs uppercase outline-none focus:border-[#2D6A4F]"

                    />

                  </div>

                </div>

              )}



              <div className="flex justify-end gap-2 pt-1">

                <button

                  type="button"

                  onClick={closeOptionModal}

                  className="h-8 rounded-lg border border-stone-200 px-3 text-[10px] font-medium text-stone-600"

                >

                  Hủy

                </button>

                <button

                  type="button"

                  onClick={createVariantOption}

                  disabled={savingOption}

                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#2D6A4F] px-3 text-[10px] font-semibold text-white disabled:opacity-50"

                >

                  <Check size={12} />

                  {savingOption ? "Đang lưu..." : "Thêm"}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}



      <button

        type="button"

        onClick={save}

        disabled={loading}

        className="mt-3 self-end h-8 rounded-lg bg-primary px-4 text-[10px] font-semibold text-white"

      >

        {loading ? "Đang lưu..." : "Lưu màu sắc"}

      </button>



    </section>

  );

}