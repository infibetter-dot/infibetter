import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatVND } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/admin/orders/$id"
)({
  component: OrderDetailPage,
});

function OrderDetailPage() {

  const { id } = Route.useParams();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: async () => {

      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      return {
        order,
        items: items ?? [],
      };
    },
  });

  const [saving, setSaving] = useState(false);

  async function updateStatus(status: string) {

    setSaving(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Đã cập nhật trạng thái");

    refetch();
  }

  if (isLoading) {
    return (
      <div className="container-x py-10">
        Đang tải...
      </div>
    );
  }

  const order = data!.order;

  return (

    <div className="container-x space-y-8 py-10">

      <div>

        <h1 className="text-4xl font-bold">

          Đơn hàng

        </h1>

        <p className="mt-2 text-muted-foreground">

          #{order.id.slice(0,8)}

        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        <div className="rounded-xl border p-6">

          <h3 className="mb-5 text-xl font-semibold">

            Khách hàng

          </h3>

          <div className="space-y-3">

            <p><strong>Tên:</strong> {order.full_name}</p>

            <p><strong>SĐT:</strong> {order.phone}</p>

            <p><strong>Email:</strong> {order.email || "-"}</p>

            <p><strong>Địa chỉ:</strong> {order.address}</p>

            <p><strong>Thành phố:</strong> {order.city}</p>

            <p><strong>Ghi chú:</strong> {order.notes || "-"}</p>

            <p><strong>Thanh toán:</strong> {order.payment_method}</p>

          </div>

        </div>

        <div className="rounded-xl border p-6">

          <h3 className="mb-5 text-xl font-semibold">

            Trạng thái

          </h3>

          <select
            defaultValue={order.status}
            onChange={(e)=>
              updateStatus(e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
          >

            <option value="pending">
              Chờ xác nhận
            </option>

            <option value="confirmed">
              Đã xác nhận
            </option>

            <option value="packing">
              Đang đóng gói
            </option>

            <option value="shipping">
              Đang giao
            </option>

            <option value="completed">
              Hoàn thành
            </option>

            <option value="cancelled">
              Đã hủy
            </option>

          </select>

        </div>

      </div>

      <div className="rounded-xl border overflow-hidden">

        <table className="w-full">

          <thead className="sticky top-0 bg-neutral-50">

            <tr>

              <th className="px-5 py-4 text-left">

                Ảnh

              </th>

              <th className="px-5 py-4 text-left">

                Sản phẩm

              </th>

              <th className="px-3 py-2 text-sm">

                SL

              </th>

              <th className="px-3 py-2 text-sm">

                Đơn giá

              </th>

              <th className="px-3 py-2 text-sm">

                Thành tiền

              </th>

            </tr>

          </thead>

          <tbody>

            {data!.items.map((item)=>{

              const total =
                Number(item.unit_price) *
                item.quantity;

              return(

                <tr
  key={item.id}
  className="border-t align-middle"
>

                  <td className="px-3 py-2">

                    <img
  src={item.product_image}
  className="h-12 w-12 rounded-lg object-cover border"
/>

                  </td>

                  <td className="px-3 py-2">

  <div className="space-y-1">

    <div className="line-clamp-2 text-sm font-medium leading-5">
  {item.product_name}
</div>

    {item.color_name && (
      <div className="flex items-center gap-1 text-xs text-neutral-500">

        {item.color_hex && (
          <span
             className="h-3 w-3 rounded-full border"
            style={{
              backgroundColor: item.color_hex,
            }}
          />
        )}

        <span>
          {item.color_name}
        </span>

      </div>
    )}

  </div>

</td>
                  <td className="px-3 py-2 text-center text-sm">

                    {item.quantity}

                  </td>

                  <td className="px-3 py-2 text-center text-sm">

                    {formatVND(Number(item.unit_price))}

                  </td>

                  <td className="text-center font-semibold">

                    {formatVND(total)}

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

      <div className="flex justify-end">

        <div className="rounded-xl border bg-neutral-50 p-6">

         

        </div>

      </div>

    </div>

  );

}