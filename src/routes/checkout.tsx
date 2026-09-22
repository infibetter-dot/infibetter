import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
} from "@paypal/react-paypal-js";
import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { getShippingFee } from "@/lib/shipping";
import { WARDS } from "@/data/wards";
import React, {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatVND } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  trackInitiateCheckout,
  trackPurchase,
} from "@/lib/meta";

import CheckoutVoucher from "@/components/checkout/CheckoutVoucher";

import type {
  VoucherSummary,
} from "@/components/checkout/voucher.types";

import { Check, ChevronsUpDown } from "lucide-react";

import { provinces } from "@/lib/address";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { VIETNAM_CITIES } from "@/lib/vietnam-cities";

import {
  getDistricts,
  getWards,
} from "@/lib/address";


export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Thanh toán — NHÀ" }] }),
  component: CheckoutPage,
});



const schema = z.object({
  full_name: z.string().trim().min(2, "Vui lòng nhập họ tên").max(120),
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ").max(20),
  email: z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Email không hợp lệ"
  ),
  address: z.string().trim().min(5, "Vui lòng nhập địa chỉ").max(300),
  city: z.string().trim().min(2).max(120),

district: z.string().trim().min(2, "Vui lòng chọn Quận / Huyện"),

ward: z.string().optional(),

notes: z.string().max(500).optional(),
});

function CheckoutPage() {
  const paypalOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const { items, subtotal, clear, count } = useCart();

  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [phoneValue, setPhoneValue] = useState("");
  const [cityValue, setCityValue] = useState("");

  const [districtValue, setDistrictValue] = useState("");
const [wardValue, setWardValue] = useState("");

const [districtOpen, setDistrictOpen] = useState(false);



const [wardOpen, setWardOpen] = useState(false);

  const [cityOpen, setCityOpen] = useState(false);

  const baseShipping = getShippingFee(cityValue);

  const districts = getDistricts(cityValue);

const wards = districtValue
  ? getWards(cityValue, districtValue).filter(
      (ward) =>
        ward &&
        typeof ward === "object" &&
        ward.Name &&
        ward.Name !== districtValue
    )
  : [];
  const [voucherSummary, setVoucherSummary] =
    useState<VoucherSummary>({
      discountVoucher: null,
      shippingVoucher: null,
      discountAmount: 0,
      shippingDiscount: 0,
      shipping: baseShipping,
      totalDiscount: 0,
    });

  const shipping = baseShipping;

  const discountVoucher = voucherSummary.discountVoucher;
  const shippingVoucher = voucherSummary.shippingVoucher;

  const total =
    subtotal +
    baseShipping -
    voucherSummary.discountAmount -
    voucherSummary.shippingDiscount;

  useEffect(() => {
    if (items.length === 0) return;

    trackInitiateCheckout(
      subtotal,
      items.reduce((sum, item) => sum + item.quantity, 0)
    );
  }, []);

  if (count === 0) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-display text-3xl">
          Giỏ hàng trống
        </p>

        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          Đến cửa hàng
        </Link>
      </div>
    );
  }

  function saveOrderSuccess(order: any) {
  localStorage.setItem(
    "olive_last_order",
    JSON.stringify(order)
  );
}

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);

    console.log({
  cityValue,
  districtValue,
  wardValue,
});
    
const payload = {
  status: "pending",

  // Thông tin khách hàng
  ...parsed.data,

  payment_method: paymentMethod,

  payment_status: paymentMethod === "paypal" ? "paid" : "pending",

  district: districtValue,

   ward: wardValue,

  // Tiền hàng
  subtotal,

  // Ship
  shipping_fee: baseShipping,
  shipping_discount: voucherSummary.shippingDiscount,

// ===== Voucher =====

discount_amount:
  voucherSummary.discountAmount,

discount_voucher_code:
  discountVoucher?.code ?? null,

discount_voucher_name:
  discountVoucher?.title ?? null,

shipping_voucher_code:
  shippingVoucher?.code ?? null,

shipping_voucher_name:
  shippingVoucher?.title ?? null,

shipping_voucher_value:
  voucherSummary.shippingVoucher?.value ?? 0,

  // Tổng tiền
  total,
};

console.log("===== ORDER PAYLOAD =====");
console.log(payload);
console.table(payload);



let result: any = null;
let order: any = null;

try {
  result = await supabase
    .from("orders")
    .insert(payload)
    .select("*");

  console.log("FULL RESULT =", result);

  if (result.error) {
    throw result.error;
  }

  order = result.data?.[0];

  if (!order) {
    throw new Error("Order not created");
  }

  console.log("ORDER =", order);

} catch (e) {
  console.error("CATCH =", e);
  alert(JSON.stringify(e, null, 2));
  setSubmitting(false);
  return;
}


console.log("Items before insert:", items);

console.log("CART ITEMS", JSON.stringify(items, null, 2));

const orderItemsPayload = items.map((i) => ({
  order_id: order.id,
  product_id: i.id,
  product_name: i.name,
  product_image: i.image,

  product_color_id: i.productColorId,
  color_name: i.colorName,
  color_hex: i.colorHex,

  unit_price: i.price,
  quantity: i.quantity,
}));

console.log("ORDER ITEMS PAYLOAD", orderItemsPayload);

const { data: insertedItems, error: itemsError } = await supabase
  .from("order_items")
  .insert(orderItemsPayload)
  .select();

if (itemsError) {
  console.error("ORDER ITEMS ERROR", itemsError);
  alert(itemsError.message);
  setSubmitting(false);
  return;
}

console.log(
  "INSERTED ITEMS",
  JSON.stringify(insertedItems, null, 2)
);

// ===== Background tasks =====
// Đơn đã được tạo thành công nên không bắt khách hàng chờ email/voucher.
void (async () => {
  // ===== Send Order Success Email =====
  try {
    const { data: emailResult, error: emailError } =
      await supabase.functions.invoke("send-order-confirmation", {
        body: {
          order_id: order.id,
        },
      });

    if (emailError) {
      console.error("ORDER SUCCESS EMAIL ERROR:", emailError);
    } else {
      console.log(
        "ORDER SUCCESS EMAIL SENT:",
        emailResult,
      );
    }
  } catch (emailException) {
    console.error(
      "ORDER SUCCESS EMAIL EXCEPTION:",
      emailException,
    );
  }

  // ===== Voucher Usage =====
  const voucherUsages = [];

  if (discountVoucher) {
    voucherUsages.push({
      voucher_id: discountVoucher.id,
      voucher_code: discountVoucher.code,
      order_id: order.id,
      customer_name: parsed.data.full_name,
      phone: parsed.data.phone,
      discount_amount: voucherSummary.discountAmount,
      shipping_discount: 0,
      subtotal,
      status: "used",
      used_at: new Date().toISOString(),
    });
  }

  if (shippingVoucher) {
    voucherUsages.push({
      voucher_id: shippingVoucher.id,
      voucher_code: shippingVoucher.code,
      order_id: order.id,
      customer_name: parsed.data.full_name,
      phone: parsed.data.phone,
      discount_amount: 0,
      shipping_discount: voucherSummary.shippingDiscount,
      subtotal,
      status: "used",
      used_at: new Date().toISOString(),
    });
  }

  if (voucherUsages.length > 0) {
    const { error } = await supabase
      .from("voucher_usage")
      .insert(voucherUsages);

    if (error) {
      console.error("VOUCHER USAGE ERROR", error);
    }
  }

  // ===== Increase Voucher Used =====
  const vouchersToUpdate = [
    discountVoucher,
    shippingVoucher,
  ].filter(Boolean);

  if (vouchersToUpdate.length > 0) {
    await Promise.all(
      vouchersToUpdate.map(async (voucher) => {
        const { error } = await supabase
          .from("vouchers")
          .update({
            used: (voucher!.used ?? 0) + 1,
          })
          .eq("id", voucher!.id);

        if (error) {
          console.error("VOUCHER UPDATE ERROR", error);
        }
      })
    );
  }
})();

const orderSuccess = {
  id: order.id,
  created_at: new Date().toISOString(),

  full_name: parsed.data.full_name,
  phone: parsed.data.phone,
  email: parsed.data.email,

  address: parsed.data.address,

  ward: wardValue,

  district: districtValue,

  city: parsed.data.city,

  payment_method: parsed.data.payment_method,

  subtotal,
  shipping: baseShipping,

  total,

discountVoucher:
  discountVoucher,

shippingVoucher:
  shippingVoucher,

discountAmount:
  voucherSummary.discountAmount,

shippingDiscount:
  voucherSummary.shippingDiscount,

  items: insertedItems ?? [],
};

localStorage.setItem(
  "olive_last_order",
  JSON.stringify(orderSuccess)
);

trackPurchase(
  order.id,
  total
);

clear();

setSubmitting(false);

navigate({
  to: "/order-success",
});

return;

  }

  return (
    
    <div className="min-h-screen bg-neutral-50">

<div className="container-x py-14">

      <div className="mb-12">

<p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">

CHECKOUT

</p>

<h1 className="mt-2 font-display text-5xl">

Thanh toán

</h1>

<p className="mt-3 max-w-xl text-muted-foreground">

Hoàn tất thông tin để Olive Living giao sản phẩm đến bạn nhanh nhất.

</p>

</div>

      <div className="mb-10 mt-6 flex items-center gap-5">

  <div className="flex items-center gap-2">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
      1
    </div>

    <span className="text-sm font-medium">
      Thông tin
    </span>
  </div>

  <div className="h-px w-12 bg-neutral-300" />

  <div className="flex items-center gap-2">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
      2
    </div>

    <span className="text-sm font-medium">
      Giao hàng
    </span>
  </div>

  <div className="h-px w-12 bg-neutral-300" />

  <div className="flex items-center gap-2">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
      3
    </div>

    <span className="text-sm font-semibold">
      Thanh toán
    </span>
  </div>

</div>
      <form onSubmit={onSubmit} className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-white p-8 shadow-sm transition-all
duration-300
hover:shadow-md ">

<div className="mb-6 flex items-center gap-3">

    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">

        👤

    </div>

    <div>

        <p className="font-display text-2xl">
            Thông tin liên hệ
        </p>

        <p className="text-sm text-muted-foreground">
            Chúng tôi sẽ dùng thông tin này để xác nhận đơn hàng.
        </p>

    </div>

</div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="full_name" label="Họ và tên" required defaultValue="" />

              <label className="block">
  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
    Số điện thoại *
  </span>

  <input
    name="phone"
    required
    value={phoneValue}
    onChange={(e) => setPhoneValue(e.target.value)}
    className="
h-12
w-full
rounded-xl
border
border-border
bg-background
px-4
text-sm
transition-all
duration-200
outline-none
focus:border-primary
focus:ring-4
focus:ring-primary/10
focus:ring-primary/20
"
  />
</label>
            <Field
  name="email"
  label="Email (không bắt buộc)"
/>
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-white p-8 shadow-sm transition-all
duration-300
hover:shadow-md">
            
           <div className="mb-6 flex items-center gap-3">

<div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">

📍

</div>

<div>

<p className="font-display text-2xl">
Địa chỉ giao hàng
</p>

<p className="text-sm text-muted-foreground">

Đơn hàng sẽ được giao đến địa chỉ này.

</p>

</div>

</div>

            <div className="mt-4 grid gap-4">

             <Field
  name="address"
  label="Địa chỉ"
  required
/>

<label className="block">

  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
    Tỉnh / Thành phố *
  </span>

<Popover
  open={cityOpen}
  onOpenChange={setCityOpen}
>

  <PopoverTrigger asChild>

    <Button
      type="button"
      variant="outline"
      role="combobox"
      className="
h-12
sm:h-11
w-full
justify-between
rounded-xl
"
    >
      {cityValue || "Chọn Tỉnh / Thành phố"}

      <ChevronsUpDown className="h-4 w-4 opacity-50" />

    </Button>

  </PopoverTrigger>

  <PopoverContent
  align="start"
  className="w-[var(--radix-popover-trigger-width)] p-0"
>

    <Command>

      <CommandInput placeholder="Tìm tỉnh / thành..." />

      <CommandList className="max-h-72">

        <CommandEmpty>
          Không tìm thấy.
        </CommandEmpty>

        <CommandGroup>

          {provinces.map((city) => (

  <CommandItem
    key={city.Id}
    value={city.Name}
    onSelect={() => {

      setCityValue(city.Name);

      setDistrictValue("");

      setWardValue("");

      setCityOpen(false);

    }}
  >

    <Check
      className={cn(
        "mr-2 h-4 w-4",
        cityValue === city.Name
          ? "opacity-100"
          : "opacity-0"
      )}
    />

    {city.Name}

  </CommandItem>

))}

        </CommandGroup>

      </CommandList>

    </Command>

  </PopoverContent>

</Popover>

<input
  type="hidden"
  name="city"
  value={cityValue}
/>

</label>

<label className="block">

  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
    Quận / Huyện *
  </span>

  <Popover
    open={districtOpen}
    onOpenChange={setDistrictOpen}
  >

   <PopoverTrigger asChild>
  <Button
    type="button"
    variant="outline"
    role="combobox"
    className="h-12 w-full justify-between rounded-xl font-normal"
    onClick={() => {
      if (!cityValue) {
        toast.error("Vui lòng chọn Tỉnh / Thành phố trước.");
        return;
      }

      setDistrictOpen(true);
    }}
  >
    {districtValue || "Chọn Quận / Huyện"}

    <ChevronsUpDown className="h-4 w-4 opacity-50" />
  </Button>
</PopoverTrigger>

    <PopoverContent
      align="start"
      className="w-[var(--radix-popover-trigger-width)] p-0"
    >

      <Command>

        <CommandInput placeholder="Tìm Quận / Huyện..." />

        <CommandList className="max-h-72">

          <CommandEmpty>
            Không tìm thấy.
          </CommandEmpty>

          <CommandGroup>

            {districts.map((district) => (

              <CommandItem
                key={district.Name}
                value={district.Name}
                onSelect={() => {

                  setDistrictValue(district.Name);

                  setWardValue("");

                  setDistrictOpen(false);

                }}
              >

                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    districtValue === district.Name
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />

                {district.Name}

              </CommandItem>

            ))}

          </CommandGroup>

        </CommandList>

      </Command>

    </PopoverContent>

  </Popover>

  <input
  type="hidden"
  name="district"
  value={districtValue}
/>

</label>

<label className="block">
  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
    Phường / Xã
  </span>

  <Popover
    open={wardOpen}
    onOpenChange={setWardOpen}
  >
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        disabled={!districtValue}
        className="h-12 w-full justify-between rounded-xl font-normal"
      >
        {wardValue || "Chọn Phường / Xã"}

        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent
      align="start"
      className="w-[var(--radix-popover-trigger-width)] p-0"
    >
      <Command>
        <CommandInput placeholder="Tìm phường..." />

        <CommandList className="max-h-72">
          <CommandEmpty>
            Không tìm thấy.
          </CommandEmpty>

          <CommandGroup>
            {wards.map((ward) => (
              <CommandItem
                key={ward.Id}
                value={ward.Name}
                onSelect={() => {
                  setWardValue(ward.Name);
                  setWardOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    wardValue === ward.Name
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />

                {ward.Name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>

  <input
    type="hidden"
    name="ward"
    value={wardValue}
  />
</label>

              <Field name="notes" label="Ghi chú đơn hàng (tuỳ chọn)" textarea />
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-white p-8 shadow-sm transition-all
duration-300
hover:shadow-md">
            <div className="mb-6 flex items-center gap-3">

<div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">

💳

</div>

<div>

<p className="font-display text-2xl">
Phương thức thanh toán
</p>

<p className="text-sm text-muted-foreground">

Lựa chọn phương thức phù hợp nhất.

</p>

</div>

</div>
            <div className="mt-4 space-y-2">

              {[
  {
    v: "cod",
    t: "Thanh toán khi nhận hàng (COD)",
    d: "Nhân viên giao hàng sẽ thu tiền.",
  },
  {
    v: "transfer",
    t: "Chuyển khoản ngân hàng",
    d: "Chúng tôi sẽ gửi thông tin sau khi đặt.",
  },
  {
    v: "paypal",
    t: "Thanh toán bằng PayPal",
    d: "Thanh toán an toàn bằng PayPal hoặc thẻ ngân hàng.",
  },
].map((p) => (

               <label
  key={p.v}
  className={`
    flex cursor-pointer items-start gap-4 rounded-2xl border p-5
    transition-all duration-300
    ${
      paymentMethod === p.v
        ? "border-primary bg-primary/5 shadow-md"
        : "border-border hover:border-primary/50 hover:bg-neutral-50"
    }
  `}
>

                <input
  type="radio"
  name="payment_method"
  value={p.v}
  defaultChecked={p.v === "cod"}
  onChange={() => setPaymentMethod(p.v)}
  className="mt-1 h-5 w-5 accent-[var(--primary)]"
/>
                  <div>
              
                    <p className="text-base font-semibold">{p.t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
                  </div>
                </label>
              ))}

              {paymentMethod === "transfer" && (
  <div className="mt-4 rounded-lg border border-border bg-background p-5">
    <p className="font-medium">Thông tin chuyển khoản</p>

    <div className="mt-3 space-y-2 text-sm">
      <p><strong>Ngân hàng:</strong> ACB Bank</p>
      <p><strong>Chủ tài khoản:</strong> NGUYEN THI BICH HUYEN</p>
      <p><strong>Số tài khoản:</strong> 27775487</p>
      <p><strong>Nội dung:</strong> OLIVE-${Math.floor(total)}</p>
    </div>

    <div className="mt-6 rounded-2xl bg-neutral-50 p-6">
      <img
        src="/qr-bank.png"
        alt="QR chuyển khoản"
        className="
mx-auto
w-56
rounded-xl
border
bg-white
p-2
shadow
transition-transform
duration-300
hover:scale-105
"

      />
    </div>
  </div>
)}

            </div>
          </section>
        
        {paymentMethod === "paypal" && (
  <div className="mt-4 rounded-2xl border border-border bg-background p-5">
    <p className="mb-4 font-medium">
      Thanh toán với PayPal
    </p>

    <PayPalScriptProvider options={paypalOptions}>

  <PayPalButtons
  fundingSource={FUNDING.PAYPAL}
  style={{
    layout: "vertical",
    shape: "rect",
    label: "paypal",
  }}
  
  disabled={submitting}
  createOrder={async () => {
    const { data, error } = await supabase.functions.invoke(
      "paypal-create-order",
      {
        body: {
          amount: 1,
          currency: "USD",
        },
      },
    );

    if (error) {
      console.error("PAYPAL CREATE ORDER ERROR:", error);
      throw new Error("Không thể tạo đơn PayPal.");
    }

    if (!data?.success || !data?.orderId) {
      console.error("PAYPAL CREATE ORDER RESPONSE:", data);
      throw new Error("PayPal không thể tạo đơn.");
    }

return data.orderId;
  }}

  onApprove={async (data) => {
    try {
      setSubmitting(true);

      const { data: captureData, error } =
        await supabase.functions.invoke(
          "paypal-capture-order",
          {
            body: {
              orderId: data.orderID,
            },
          },
        );

      if (error) {
        console.error("PAYPAL CAPTURE ERROR:", error);
        throw new Error("Không thể xác nhận thanh toán PayPal.");
      }

      console.log("PAYPAL CAPTURE RESULT:", captureData);

      if (
        !captureData?.success ||
        captureData?.status !== "COMPLETED"
      ) {
        throw new Error("Thanh toán PayPal chưa hoàn tất.");
      }

     const form = document.querySelector("form");

if (form) {
  form.requestSubmit();
}

    } catch (error) {
      console.error("PAYPAL PAYMENT ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Thanh toán PayPal thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  }}
/>

    </PayPalScriptProvider>
  </div>
)}

        </div>

        <aside className="
sticky
top-24
h-fit
space-y-6
rounded-2xl
border
border-border
bg-white
p-7
shadow-lg
transition-all
duration-300
">
          <div className="border-b border-border pb-4">
    <p className="font-display text-2xl">
        Đơn hàng của bạn
    </p>

    <p className="mt-1 text-sm text-muted-foreground">
        Kiểm tra lại sản phẩm trước khi thanh toán
    </p>
</div>
          <ul className="space-y-5 border-b border-border pb-6">
            {items.map((i) => (
             <li
  key={i.id}
  className="
    flex
    items-start
    gap-3
    overflow-hidden
    rounded-xl
    p-2
    transition-all
    duration-300
    hover:bg-neutral-50
  "
>
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background">
                  {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 items-start justify-between gap-3 overflow-hidden text-sm">
                  <div>
                    <p className="line-clamp-2 pr-2 text-[15px] font-semibold">{i.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">x{i.quantity}</p>
                  </div>
                  <p className="shrink-0 whitespace-nowrap text-lg font-bold text-primary">{formatVND(i.price * i.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>

    <dl className="space-y-3 text-sm">

    <div className="flex justify-between">
        <dt className="text-muted-foreground">
            Tạm tính
        </dt>

        <dd className="font-medium">
            {formatVND(subtotal)}
        </dd>
    </div>

    <div className="flex justify-between">
    <dt className="text-muted-foreground">
        Phí vận chuyển
    </dt>

    <dd className="font-medium">
        {cityValue.trim()
            ? formatVND(baseShipping)
            : "Chưa tính"}
    </dd>
</div>

   

            
   

</dl>
          
         

<div className="border-t border-border pt-4">

  

<CheckoutVoucher
  subtotal={subtotal}
  shippingFee={baseShipping}
  phone={phoneValue}
  cartItems={items}
  onChange={setVoucherSummary}
/>

</div>

<div className="mt-6 space-y-2 rounded-xl bg-neutral-50 p-4 text-sm">

    <div className="flex items-center gap-2">

        ✅

        <span>Thanh toán sau khi nhận hàng</span>

    </div>

    <div className="flex items-center gap-2">

        ✅

        <span>Đổi mới trong 15 ngày miễn phí</span>

    </div>

    <div className="flex items-center gap-2">

        ✅

        <span>Kiểm tra hàng trước khi thanh toán</span>

    </div>

</div>

{paymentMethod !== "paypal" && (
  <button
    type="submit"
    disabled={submitting}
    className="
      w-full
      rounded-2xl
      bg-primary
      px-6
      py-4
      text-base
      font-semibold
      text-primary-foreground
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:scale-[1.01]
      hover:shadow-xl
      active:scale-[0.98]
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
  >
    {submitting ? (
      "Đang xử lý..."
    ) : (
      <div className="flex items-center justify-center gap-2">
        <span>Hoàn tất đơn hàng</span>
        <span>→</span>
      </div>
    )}
  </button>
)}

</aside>
      </form>

     
</div>
    </div>
  );
}


function Field({ name, label, required, defaultValue, textarea }: {
  name: string; label: string; required?: boolean; defaultValue?: string; textarea?: boolean;
}) {

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}{required && " *"}</span>
      {textarea ? (
       
<textarea
  name={name}
  defaultValue={defaultValue}
  rows={4}
  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all duration-200 outline-none focus:border-primary focus:ring-4
focus:ring-primary/10 focus:ring-primary/20"
/>

      ) : (
       
    <input
  name={name}
  required={required ?? false}
  defaultValue={defaultValue}
  onChange={(e) => {
    if (name === "full_name") {
      e.target.value = e.target.value.toUpperCase();
    }
  }}
  className="
h-12
w-full
rounded-xl
border
border-border
bg-background
px-4
text-sm
transition-all
duration-200
outline-none
focus:border-primary
focus:ring-4
focus:ring-primary/10
focus:ring-primary/20
"
/>

      )}
    </label>
  );
}
