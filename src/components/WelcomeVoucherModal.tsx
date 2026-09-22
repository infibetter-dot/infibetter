import { useState } from "react";
import { motion } from "framer-motion";
import { X, Gift } from "lucide-react";
import { registerVoucher } from "@/lib/voucher";

export default function WelcomeVoucherModal() {
  const [open, setOpen] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");

 

  const closeModal = () => {
    localStorage.setItem("olive-voucher", "1");
    setOpen(false);
  };

  const submit = async () => {
  if (!name || !phone) {
    alert("Vui lòng nhập Họ tên và Số điện thoại.");
    return;
  }

  const result = await registerVoucher({
    full_name: name,
    phone,
    interest,
  });

  if (!result.success) {
    alert(result.message);
    return;
  }

  alert(`Đăng ký thành công!

Mã Voucher của bạn:

${result.voucher}`);

  localStorage.setItem("olive-voucher", "1");

  setOpen(false);
};

if (!open) return null;

return (

  <>
    {/* Overlay */}

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .35 }}
      className="
fixed
inset-0
z-[999]
bg-black/50
backdrop-blur-md
"
    />

    {/* Popup */}

    <motion.div
      initial={{
        opacity: 0,
        scale: .92,
        y: 30,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
  type:"spring",
  stiffness:120,
  damping:16
}}
      className="
fixed
left-1/2
top-1/2
z-[1000]
w-[92%]
max-w-[500px]
max-h-[88vh]
overflow-y-auto
lg:overflow-hidden
-translate-x-1/2
-translate-y-1/2
rounded-[36px]
border
border-[#ECE3D8]
bg-white
shadow-[0_40px_100px_rgba(0,0,0,.18)]
"
    >

      {/* HEADER */}

      <div className="relative border-b border-[#F2ECE5] px-5 py-4 lg:px-6 lg:py-5">

        <button
          onClick={closeModal}
          className="
absolute
right-5
top-5
flex
h-10
w-10
items-center
justify-center
rounded-full
transition-all
duration-300
hover:bg-[#F7F3EE]
"
        >
          <X size={22} />
        </button>

        <div className="text-center">

          <motion.div
animate={{
  scale:[1,1.08,1],
  boxShadow:[
    "0 0 0 rgba(199,123,85,0)",
    "0 0 35px rgba(199,123,85,.25)",
    "0 0 0 rgba(199,123,85,0)"
  ]
}}

transition={{
  repeat:Infinity,
  duration:4
}}
            className="
mx-auto
mb-3
flex
h-12
w-12
lg:h-14
lg:w-14
items-center
justify-center
rounded-full
bg-[#F8F2EA]
"
          >
            <Gift
              size={24}
              className="text-[#C77B55]"
            />
          </motion.div>

          <div
            className="
inline-flex
rounded-full
bg-[#F8F2EA]
px-4
py-2
text-[10px]
font-semibold
uppercase
tracking-[0.25em]
text-[#C77B55]
"
          >
            Khách hàng mới
          </div>

          <p className="mt-2 text-[10px] uppercase tracking-[0.45em] text-neutral-400">

            OLIVE LIVING

          </p>

          <h2
            className="
mt-3
font-display
text-[24px]
leading-none
text-[#2E2B27]
sm:text-[42px]
"
          >
            Chào mừng bạn
          </h2>

          <p
            className="
mx-auto
mt-2
max-w-[320px]
text-[15px]
leading-6
text-neutral-500
"
          >
            Nhận voucher độc quyền dành riêng cho khách hàng mới khi mua sắm tại Olive Living.
          </p>

        </div>

      </div>

{/* ========================= */}
{/* VOUCHER */}
{/* ========================= */}

<div className="px-6 pt-6 lg:px-8">

  <div className="grid grid-cols-3 gap-2 lg:gap-4">

    {[
      {
        price: "15K",
        order: "399K",
      },
      {
        price: "25K",
        order: "599K",
      },
      {
        price: "35K",
        order: "999K",
      },
    ].map((item, index) => (

      <motion.div
        key={item.price}
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: index * .12,
          duration: .45,
        }}
        whileHover={{
          y: -6,
          scale: 1.03,
        }}
        whileTap={{
          scale: .98,
        }}
      className="
relative
min-h-[115px]
lg:min-h-[120px]
overflow-hidden
rounded-[20px]
border
border-[#EFE4D8]
bg-gradient-to-b
from-white
to-[#FCF9F5]
shadow-sm
transition-all
duration-300
hover:-translate-y-1
hover:border-[#C77B55]
hover:shadow-xl
"
      >

        {/* Ribbon */}

        <div
        className="
absolute
left-1/2
top-0
-z-0
-translate-x-1/2
rounded-b-lg
bg-[#C77B55]
px-3
py-1
text-[8px]
font-semibold
tracking-[.18em]
text-white
"
        >
          Voucher
        </div>

        {/* Value */}
<div className="flex flex-col items-center justify-center pt-5 pb-2">

  <div
    className="
flex
items-center
justify-center
h-[42px]
text-[18px]
sm:text-[20px]
lg:text-[22px]
font-bold
leading-none
tracking-tight
text-[#C77B55]
"
  >
    {item.price}
  </div>

  <p
    className="
mt-2
text-center
text-[12px]
font-medium
leading-none
text-neutral-700
"
  >
    Đơn từ {item.order}
  </p>

</div>

        {/* Divider */}

        <div className="mt-2 border-t border-dashed border-[#E9DDD1]" />

        {/* Footer */}

        <div className="bg-[#FFF8F2] py-2">

        <p
  className="
px-2
text-center
text-[8px]
leading-3
font-medium
text-neutral-500
sm:text-[9px]
lg:text-[11px]
"
>
  Áp dụng toàn bộ sản phẩm
</p>

        </div>

        {/* Shine Effect */}

<motion.div
  animate={{
    x: ["-160%", "220%"],
  }}
  transition={{
    repeat: Infinity,
    duration: 2.8,
    ease: "linear",
  }}
  className="
pointer-events-none
absolute
top-0
left-0
h-full
w-14
rotate-12
bg-gradient-to-r
from-transparent
via-white/80
to-transparent
blur-sm
"
/>

        {/* Ticket hole */}

        <div className="absolute left-0 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />

        <div className="absolute right-0 top-1/2 h-5 w-5 translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />

      </motion.div>

    ))}

  </div>

  <div
    className="
mt-3
rounded-xl
bg-[#FBF7F2]
px-4
py-2
text-center
"
  >

    <p className="text-[12px] leading-6 text-neutral-600">

      🎉 Voucher sẽ được lưu vào tài khoản và tự động áp dụng khi thanh toán.

    </p>

  </div>

</div>

{/* ========================= */}
{/* FORM */}
{/* ========================= */}

<div className="px-5 py-4 lg:px-6 lg:py-5">

  <div className="space-y-2">

    {/* Name */}

    <div>

      <label className="mb-2 block text-sm font-medium text-neutral-700">

        Họ và tên

      </label>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nguyễn Văn A"
        className="
w-full
rounded-2xl
border
border-[#E7DDD3]
bg-[#FCFBF9]
px-5
py-2
text-[15px]
outline-none
transition-all
duration-300
focus:border-[#C77B55]
focus:bg-white
focus:shadow-lg
focus:shadow-[#C77B55]/10
"
      />

    </div>

    {/* Phone */}

    <div>

      <label className="mb-2 block text-sm font-medium text-neutral-700">

        Số điện thoại

      </label>

      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="09xxxxxxxx"
        className="
w-full
rounded-2xl
border
border-[#E7DDD3]
bg-[#FCFBF9]
px-5
py-2
text-[15px]
outline-none
transition-all
duration-300
focus:border-[#C77B55]
focus:bg-white
focus:shadow-lg
focus:shadow-[#C77B55]/10
"
      />

    </div>

    {/* Interest */}

    <div>

      <label className="mb-2 block text-sm font-medium text-neutral-700">

        Bạn quan tâm đến

      </label>

      <select
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
        className="
w-full
rounded-2xl
border
border-[#E7DDD3]
bg-[#FCFBF9]
px-5
py-2
text-[15px]
outline-none
transition-all
duration-300
focus:border-[#C77B55]
focus:bg-white
focus:shadow-lg
focus:shadow-[#C77B55]/10
"
      >

        <option value="">Chọn sản phẩm</option>

        <option>Đèn bàn</option>

        <option>Đèn ngủ</option>

        <option>Đèn decor</option>

        <option>Bàn Decor</option>


        <option>Nội thất khác</option>

      </select>

    </div>

  </div>

</div>

{/* ========================= */}
{/* ACTION */}
{/* ========================= */}

<div className="px-5 pb-4 lg:px-6 lg:pb-5">

  <motion.button
    whileHover={{
      scale: 1.02,
      y: -2,
    }}
    whileTap={{
      scale: 0.98,
    }}
    onClick={submit}
    className="
group
flex
w-full
items-center
justify-center
gap-3
rounded-2xl
bg-[#2E3528]
py-2
text-[15px]
font-semibold
text-white
shadow-lg
transition-all
duration-300
hover:bg-[#C77B55]
hover:shadow-xl
"
  >

    Nhận Voucher Ngay

    <motion.span
      animate={{
        x: [0, 4, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 1.2,
      }}
      className="text-lg"
    >
      →
    </motion.span>

  </motion.button>

  

</div>

</motion.div>

</>
);

}