import {
  Flame,
  Truck,
  Gift,
  CreditCard,
} from "lucide-react";

const items = [
  {
    icon: Flame,
    title: "Flash Sale",
    desc: "Ưu đãi có thời hạn",
    color: "text-orange-500",
  },
  {
    icon: Truck,
    title: "Freeship",
    desc: "Toàn quốc",
    color: "text-green-600",
  },
 {
  icon: Gift,
  title: "Quà tặng",
  desc: "Áp dụng cho nhiều sản phẩm",
  color: "text-pink-600",
},
{
  icon: CreditCard,
  title: "Thanh toán",
  desc: "COD hoặc Chuyển khoản",
  color: "text-sky-600",
},
];

export default function FlashSaleTrust() {
  return (
    <section className="my-8">

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        {items.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="
                rounded-2xl
                border
                bg-white
                p-4
                shadow-sm
                transition-all
                hover:-translate-y-1
                hover:shadow-lg
              "
            >

              <Icon
                className={`mb-3 h-7 w-7 ${item.color}`}
              />

              <h3 className="font-semibold">

                {item.title}

              </h3>

              <p className="mt-1 text-xs text-neutral-500">

                {item.desc}

              </p>

            </div>

          );

        })}

      </div>

    </section>
  );
}