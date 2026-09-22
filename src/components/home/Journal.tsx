import { ArrowRight } from "lucide-react";

const posts = [
  {
    category: "LIVING",
    title: "5 cách bố trí đèn bàn cho phòng ngủ tối giản",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    time: "5 phút đọc",
  },
  {
    category: "JAPANDI",
    title: "Không gian sống tối giản bắt đầu từ ánh sáng",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop",
    time: "3 phút đọc",
  },
];

export default function Journal() {
  
  return (
    <section className="container-x py-28">

      <div className="mb-14 flex items-end justify-between">

        <div>

          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            JOURNAL
          </p>

          <h2 className="mt-3 font-display text-4xl">
            Cảm hứng không gian sống
          </h2>

        </div>

        <button className="flex items-center gap-2 text-sm hover:underline">

          Xem tất cả

          <ArrowRight size={16} />

        </button>

      </div>

      <div className="grid gap-10 lg:grid-cols-2">

        {posts.map((post) => (

          <article
            key={post.title}
            className="group cursor-pointer"
          >

            <div className="overflow-hidden rounded-2xl">

              <img
                src={post.image}
                alt={post.title}
                className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105"
              />

            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-neutral-500">

              {post.category}

            </p>

            <h3 className="mt-3 text-2xl font-medium leading-snug">

              {post.title}

            </h3>

            <p className="mt-3 text-sm text-neutral-500">

              {post.time}

            </p>

          </article>

        ))}

      </div>

    </section>
  );
}