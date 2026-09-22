import {
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Headphones,
} from "lucide-react";

const services = [
  {
    icon: Truck,
    title: "Miễn phí giao hàng",
    desc: "Đơn từ 399.000₫",
  },
  {
    icon: ShieldCheck,
    title: "Đóng gói cẩn thận",
    desc: "Bảo vệ sản phẩm an toàn",
  },
  {
    icon: RotateCcw,
    title: "Đổi trả 15 ngày",
    desc: "Nhanh chóng & dễ dàng",
  },
  {
    icon: CreditCard,
    title: "Thanh toán an toàn",
    desc: "Momo • Chuyển khoản",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    desc: "Luôn sẵn sàng hỗ trợ",
  },
];

export default function Services() {
  return (
    <section className="border-y border-neutral-200 bg-[#F8F6F2]">
      <div className="container-x">

        <div className="grid grid-cols-2 md:grid-cols-5">

          {services.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`
                  group
                  flex
                  flex-col
                  items-center
                  justify-center
                  px-6
                  py-10
                  text-center
                  transition-all
                  duration-300
                  hover:bg-white
                  ${index !== services.length - 1 ? "md:border-r md:border-neutral-200" : ""}
                `}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 transition-all duration-300 group-hover:border-black group-hover:scale-105">

                  <Icon size={18} />

                </div>

                <h3 className="text-sm font-medium tracking-wide">

                  {item.title}

                </h3>

                <p className="mt-2 text-xs leading-6 text-neutral-500">

                  {item.desc}

                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}