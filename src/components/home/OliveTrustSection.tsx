import { useEffect, useRef, useState } from "react";

const STATS = {
  orders: 1000,
  rating: 5.0,
  satisfaction: 98,
};

function CountUp({
  target,
  duration = 1600,
  decimals = 0,
  active,
}: {
  target: number;
  duration?: number;
  decimals?: number;
  active: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = target * eased;

      setValue(
        decimals
          ? Number(next.toFixed(decimals))
          : Math.floor(next),
      );

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [active, decimals, duration, target]);

  return (
    <>
      {decimals
        ? value.toFixed(decimals)
        : value.toLocaleString("vi-VN")}
    </>
  );
}

export default function OliveTrustSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      number: (
        <>
          <CountUp target={STATS.orders} active={visible} />+
        </>
      ),
      label: "Đơn hàng đã được đặt",
    },
    {
      number: (
        <>
          <CountUp
            target={STATS.rating}
            decimals={1}
            active={visible}
          />{" "}
          <span className="text-[#C77B55]">★</span>
        </>
      ),
      label: "Đánh giá trung bình",
    },
    {
      number: (
        <>
          <CountUp
            target={STATS.satisfaction}
            active={visible}
          />%
        </>
      ),
      label: "Khách hàng hài lòng",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`px-4 py-8 sm:px-6 lg:px-8 lg:py-12 transition-all duration-700 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1760px] overflow-hidden rounded-[22px] border border-[#E5DDD2] bg-white shadow-[0_10px_30px_rgba(50,40,30,0.08)] sm:rounded-[28px]">
        <div className="px-4 py-5 sm:px-10 sm:py-9 lg:px-12 lg:py-10">

          {/* HEADER */}
          <div className="mb-5 flex flex-col gap-2 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 sm:mb-3">
                <span className="h-2 w-2 rounded-full bg-[#4D5745]" />

                <p className="text-[9px] uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.22em] text-[#4D5745]">
                  Olive Living Community
                </p>
              </div>

              <h2 className="font-display text-[26px] leading-tight tracking-[-0.025em] sm:text-4xl lg:text-5xl text-[#252525] sm:text-4xl lg:text-5xl">
                Được khách hàng lựa chọn
              </h2>

              <p className="mt-2 max-w-[700px] text-xs leading-5 sm:mt-3 sm:text-base sm:leading-6 text-[#77716B] sm:text-base">
                Cảm ơn bạn đã đồng hành cùng Olive Living.
                Những con số nhỏ tạo nên niềm tin lớn.
              </p>
            </div>

            <p className="hidden text-xs uppercase tracking-[0.18em] text-[#A39B93] lg:block">
              Trusted by our community
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`group relative overflow-hidden rounded-xl border border-[#E8E0D6] bg-[#FCFBF9] px-4 py-4 sm:rounded-2xl sm:px-6 sm:py-7 shadow-[0_8px_24px_rgba(50,40,30,0.06)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(50,40,30,0.12)] ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }`}
                style={{
                  transitionDelay: `${150 + index * 120}ms`,
                }}
              >
                {/* subtle moving light */}
                <span
                  className="
                    pointer-events-none
                    absolute -left-1/2 top-0
                    h-full w-1/3
                    -skew-x-12
                    bg-white/50
                    opacity-0
                    transition-all duration-700
                    group-hover:left-[130%]
                    group-hover:opacity-100
                  "
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <span className="text-[8px] tracking-[0.18em] sm:text-[10px] sm:tracking-[0.2em] text-[#A39B93]">
                      0{index + 1}
                    </span>

                    <span className="flex h-7 w-7 items-center sm:h-9 sm:w-9 justify-center rounded-full bg-[#F3EEE7] text-sm text-[#4D5745] transition-transform duration-300 group-hover:scale-110">
                      ✓
                    </span>
                  </div>

                  <div className="mt-2 text-[34px] font-medium sm:mt-4 sm:text-[44px] leading-none tracking-[-0.05em] text-[#252525] sm:text-[48px]">
                    {stat.number}
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#77716B] sm:mt-3 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* BENEFITS */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Ưu đãi dành riêng cho thành viên",
              "Đóng gói cẩn thận",
              "Sản phẩm được chọn lọc",
              "Hỗ trợ tận tâm",
            ].map((text, index) => (
              <div
                key={text}
                className={`rounded-lg border border-transparent bg-[#F8F5F0] px-2.5 py-2 text-[10px] text-[#625C56] sm:text-sm transition-all duration-500 hover:border-[#DED4C8] hover:bg-white hover:shadow-[0_8px_20px_rgba(50,40,30,0.07)] ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                }`}
                style={{
                  transitionDelay: `${550 + index * 80}ms`,
                }}
              >
                <span className="mr-2 text-[#4D5745]">✓</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
