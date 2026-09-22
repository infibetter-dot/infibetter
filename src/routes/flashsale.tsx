import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";


import {
  FlashSaleHero,
  FlashSaleTrust,
  FlashSaleVoucher,
  FlashSaleCard,
} from "@/components/flashsale";

import { ProductCard } from "@/components/product-card";
import {
  getActiveFlashSale,
  getFlashSaleProducts,
} from "@/services/flashsale.service";

export const Route = createFileRoute("/flashsale")({
  component: FlashSalePage,
});

function FlashSalePage() {

  const flashSale = useQuery({
  queryKey: ["flash-sale-info"],
  queryFn: getActiveFlashSale,
});


  const { data, isLoading } = useQuery({
    queryKey: ["flash-sale"],
    queryFn: getFlashSaleProducts,
  });

  if (isLoading || flashSale.isLoading) {
    return (
      <div className="container mx-auto py-20">
        Đang tải Flash Sale...
      </div>
    );
  }

  return (

    <div className="container mx-auto py-20">

<FlashSaleHero
  endAt={flashSale.data?.end_at ?? ""}
/>

<FlashSaleTrust />

<FlashSaleVoucher />



      <div className="my-12" />

      <div className="mb-10">

        <h2 className="text-3xl font-bold">

          Sản phẩm Flash Sale

        </h2>

        <p className="mt-2 text-neutral-500">

          Giá ưu đãi chỉ áp dụng trong thời gian diễn ra chương trình.

        </p>

      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

 

  <div className="rounded-full bg-orange-50 px-4 py-2">

    <span className="text-sm font-medium text-orange-600">

      🎁 Voucher áp dụng tự động khi thanh toán

    </span>

  </div>

</div>

      <div
  id="flash-products"
  className="
    grid
    grid-cols-2
    gap-4
    md:grid-cols-3
    lg:grid-cols-4
    xl:grid-cols-5
  "
>

       {data?.map((item: any) => {

  console.log(item);

  return (

    <FlashSaleCard
      key={item.id}
      product={{
        ...item.product,
        discount_percent:
          item.flash_sale?.discount_percent,
      }}
    />

  );

})}

      </div>

    </div>

  );

}