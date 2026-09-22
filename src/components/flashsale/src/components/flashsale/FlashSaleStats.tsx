import { Flame, Wallet } from "lucide-react";

interface Props {

  products: any[];

}

export default function FlashSaleStats({

  products,

}: Props) {

  const sold = products.reduce(

    (sum) =>

      sum +

      (Number(
        Math.floor(Math.random() * 180) + 50
      )),

    0

  );

  const saving = products.reduce(

    (sum, item) =>

      sum +

      Math.max(
        0,
        Number(item.product.price) -
          Number(item.sale_price)
      ),

    0

  );

  return (

    <section className="my-10">

      <div className="rounded-3xl border bg-white p-6 shadow-sm">

        <div className="grid gap-5 md:grid-cols-2">

          <div className="flex items-center gap-4">

            <div className="rounded-full bg-orange-100 p-4">

              <Flame className="h-7 w-7 text-orange-500" />

            </div>

            <div>

              <p className="text-sm text-neutral-500">

                Đã bán

              </p>

              <h2 className="text-3xl font-black">

                {sold}

              </h2>

            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="rounded-full bg-emerald-100 p-4">

              <Wallet className="h-7 w-7 text-emerald-600" />

            </div>

            <div>

              <p className="text-sm text-neutral-500">

                Tổng số tiền tiết kiệm

              </p>

              <h2 className="text-3xl font-black text-emerald-600">

                {saving.toLocaleString("vi-VN")}đ

              </h2>

            </div>

          </div>

        </div>

      </div>

    </section>

  );

}