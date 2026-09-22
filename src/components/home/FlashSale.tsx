import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FlashSaleCard } from "@/components/flashsale";



export default function FlashSale() {

  const [sale, setSale] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    loadFlashSale();
  }, []);

  useEffect(() => {

  if (!sale?.end_at) return;

  const timer = setInterval(() => {

    const diff =
      new Date(sale.end_at).getTime() -
      Date.now();

    if (diff <= 0) {

      setTimeLeft("Đã kết thúc");

      clearInterval(timer);

      return;

    }

    const days = Math.floor(
      diff / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
      (diff / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
      (diff / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
      (diff / 1000) % 60
    );

    setTimeLeft(
      `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`
    );

  }, 1000);

  return () => clearInterval(timer);

}, [sale]);

 async function loadFlashSale() {

  const now = new Date().toISOString();

  console.log("NOW", now);

 const { data: flashSale, error } = await supabase
  .from("flash_sales")
  .select("*")
  .eq("active", true)
  .order("created_at", {
    ascending: false,
  })
  .limit(1)
  .maybeSingle();

  console.log("FLASH SALE", flashSale);
  console.log("ERROR", error);

  if (!flashSale) return;

  const endTime = new Date(flashSale.end_at).getTime();

if (Date.now() > endTime) {
  return;
}

  setSale(flashSale);

  const { data: saleProducts } = await supabase
  .from("flash_sale_products")
  .select(`
    product_id,
    products(
  id,
  name,
  price,
  slug,
  image_url
)
  `)
  .eq("flash_sale_id", flashSale.id);

console.log("SALE PRODUCTS", saleProducts);

setProducts(saleProducts ?? []);

}

if (!sale) return null;

  return (
    
    <section className="w-full py-14">

  <div className="mx-auto w-full max-w-screen-2xl px-2 sm:px-3 lg:px-6">

      <div
  style={{
    borderColor: sale?.banner_color || "#D97745",
  }}
  className="
    relative
    overflow-hidden

    rounded-[32px]

    border-2
    border-transparent

    bg-gradient-to-br
    from-[#FFF8F2]
    via-white
    to-[#FFF5EC]

    p-6
    lg:p-8

    shadow-[0_0_50px_rgba(217,119,69,.18)]
  "
>

        {/* Glow */}

        <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-orange-300/20 blur-[100px]" />

        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-orange-200/20 blur-[100px]" />

        {/* Shine */}

        <div
          className="
            pointer-events-none

            absolute

            left-[-30%]
            top-0

            h-full
            w-40

            rotate-12

            animate-pulse

            bg-gradient-to-r
            from-transparent
            via-white/70
            to-transparent
          "
        />

        <div className="relative z-10">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

             <span
  style={{
    backgroundColor: sale?.banner_color || "#D97745",
  }}
  className="
    rounded-full
    px-4
    py-1.5
    text-sm
    font-semibold
    uppercase
    tracking-[.25em]
    text-white
  "
>
  🔥 FLASH SALE
</span>

              <h2 className="mt-4 font-display text-3xl lg:text-5xl">

               {sale?.title}

<span className="mx-2 text-[#D97745]">
  {sale?.discount_percent}%
</span>

              </h2>

              <p className="mt-2 text-neutral-600">

                {sale?.description}

              </p>

              {timeLeft && (
  <div
    className="
      mt-5
      inline-flex
      items-center
      gap-2

      rounded-full

      bg-white/80

      px-4
      py-1.5

      text-[15px]
      font-semibold

      text-[#D97745]

      shadow-sm
    "
  >
    ⏰ Kết thúc sau: {timeLeft}
  </div>
)}

            </div>

           <Link
  to="/flashsale"
  style={{
    backgroundColor: sale?.banner_color || "#D97745",
  }}
  className="
    inline-flex
    h-12

    items-center
    justify-center

    rounded-full

    px-8

    font-semibold

    text-white

    transition
  "
>
              Mua ngay →
            </Link>

          </div>

          {/* CARD */}

          <div
 className="
mt-8
grid
grid-cols-[REPEAT(2,MINMAX(170PX,1FR))]
gap-1.5
md:grid-cols-[REPEAT(2,MINMAX(170PX,1FR))]
lg:grid-cols-4
"
>

            {products.slice(0, 4).map((item: any) => {

  const product = item.products;

  if (!product) return null;

 const image = product.image_url;

const oldPrice = Number(product.price);

const salePrice = Math.round(
  oldPrice * (100 - sale.discount_percent) / 100
);

const percent =
  oldPrice > 0
    ? Math.round(
        ((oldPrice - salePrice) / oldPrice) * 100
      )
    : 0;

const saving = oldPrice - salePrice;  

  return (

    <Link
  key={product.id}
  to="/flashsale"
  className="
group
flex
flex-col
overflow-hidden
rounded-2xl
border
border-[#F3E4D7]
bg-white
p-3
transition-all
duration-300
hover:-translate-y-1
hover:shadow-lg
"
    >

      
<div className="-mx-2 -mt-2 relative">

 <div className="absolute left-3 top-3 z-10 rounded-lg bg-red-500 px-3 py-1.5">

  <span className="text-sm font-bold text-white">

    -{percent}%

  </span>

</div>

<img
  src={image}
  className="
      aspect-[1/1]
      w-full
      rounded-t-2xl
      rounded-b-none
      object-cover
    "
/>

</div>

      <h3
  className="
    mt-2
    min-h-[40px]

    line-clamp-2

    text-[15px]
    font-medium

    leading-6

    text-[#2F2F2F]
  "
>
  {product.name}
</h3>
    
<div className="mt-2">

  <p className="text-[11px] text-neutral-400 line-through">

    {oldPrice.toLocaleString("vi-VN")}đ

  </p>

  <p
  className="
    mt-1
   text-[20px]
md:text-[22px]
    font-bold
    leading-none
    tracking-tight
    text-[#F97316]
  "
>
  {salePrice.toLocaleString("vi-VN")}đ
</p>

</div>


<div className="mt-2 rounded-lg bg-orange-50 px-2 py-1.5">

  <p className="text-[10px] text-orange-500">

    Tiết kiệm

  </p>

  <p className="text-[13px] font-semibold text-[#F97316]">

    {saving.toLocaleString("vi-VN")}đ

  </p>

</div>

<div className="mt-2">

  <div
    className="
      rounded-xl
      bg-[#F97316]
      py-1.5
      text-center
      text-[15px]
      font-semibold
      text-white
      transition
      group-hover:bg-[#EA580C]
    "
  >

    Mua ngay →

  </div>

</div>
     
    </Link>

  );

})}

          </div>

        </div>

      </div>

       </div>

    </section>
  );
}