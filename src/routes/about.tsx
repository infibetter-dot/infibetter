import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Câu chuyện — OLIVE LIVING" },
      { name: "description", content: "Olive Living được tạo nên từ niềm tin rằng một ngôi nhà đẹp không chỉ để ngắm nhìn, mà còn là nơi mang lại sự bình yên sau mỗi ngày dài." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Câu chuyện</p>
        <h1 className="mt-4 font-display text-5xl">OLIVE LIVING</h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Olive Living mang đến những sản phẩm nội thất và đèn trang trí được tuyển chọn theo phong cách tối giản hiện đại. Chúng tôi tin rằng một không gian sống đẹp không cần quá nhiều chi tiết, mà cần sự cân bằng giữa ánh sáng, chất liệu và cảm xúc. Mỗi sản phẩm đều được lựa chọn để giúp ngôi nhà trở nên ấm áp, tinh tế và đáng sống hơn mỗi ngày.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-12 sm:grid-cols-3">
        {[
          { t: "Tối giản", d: "Thiết kế thanh lịch, đường nét gọn gàng, dễ dàng hòa hợp với nhiều phong cách nội thất mà vẫn giữ được dấu ấn riêng." },
          { t: "Bền vững", d: "Ưu tiên vật liệu bền đẹp, hoàn thiện tỉ mỉ và ánh sáng dễ chịu, mang đến trải nghiệm sử dụng lâu dài mỗi ngày." },
          { t: "Thủ công", d: "Mỗi sản phẩm tại Olive Living đều được tuyển chọn kỹ lưỡng từ những thiết kế mang phong cách Scandinavian, Japandi và Contemporary, đáp ứng tiêu chuẩn về thẩm mỹ và công năng." },
        ].map((b) => (
          <div key={b.t}>
            <p className="font-display text-2xl text-primary">{b.t}</p>
            <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <Link to="/shop" className="inline-flex rounded-full bg-foreground px-6 py-3 text-sm text-background hover:bg-primary">
          Khám phá bộ sưu tập
        </Link>
      </div>
    </div>
  );
}
