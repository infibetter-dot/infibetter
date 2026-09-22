import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Email không hợp lệ");
      return;
    }

    toast.success("Đăng ký thành công!");
    setEmail("");
  }

  return (
    <section className="container-x !h-auto !min-h-0 !py-0">
      <div className="mx-auto flex min-h-[180px] max-w-3xl flex-col justify-center text-center">

        <p className="text-[8px] uppercase tracking-[0.3em] text-neutral-500">
          NEWSLETTER
        </p>

        <h2 className="mt-1 font-display text-2xl leading-[1.05]">
          Nhận cảm hứng mới
          <br />
          mỗi tuần.
        </h2>

        <p className="mx-auto mt-2 max-w-md text-[11px] leading-4 text-neutral-500">
          Sản phẩm mới, mẹo decor và ưu đãi độc quyền từ Olive Living.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-3 flex h-9 max-w-md overflow-hidden rounded-full border border-neutral-200 bg-white"
        >
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-4 text-[10px] outline-none placeholder:text-neutral-400"
          />

          <button
            type="submit"
            className="flex shrink-0 items-center gap-1 bg-black px-4 text-[9px] font-medium text-white"
          >
            Đăng ký
            <ArrowRight size={12} />
          </button>
        </form>

      </div>
    </section>
  );
}