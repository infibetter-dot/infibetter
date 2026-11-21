import { Link } from "@tanstack/react-router";
import heroDesktop from "@/assets/hero/banner02.png";
import heroMobile from "@/assets/hero/heromobile.png";

/**
 * INFIBETTER homepage hero
 * Mobile layout follows the marked reference:
 * - Hero frame uses the red-box proportion (approximately 0.78:1).
 * - Copy stays inside the upper green safe area.
 * - Artwork uses object-contain so the products are never cropped.
 * - Desktop layout remains independent and unchanged in behavior.
 */
export default function Hero() {
  return (
    <section
      aria-label="INFIBETTER Apple Essentials"
      className="relative left-1/2 z-0 w-screen -translate-x-1/2 overflow-hidden border-0 bg-[#080B12] outline-none"
    >
      {/* MOBILE HERO */}
      <div className="relative block aspect-[0.78/1] w-full overflow-hidden bg-[#080B12] sm:hidden">
        <img
          src={heroMobile}
          alt="INFIBETTER smart charging and tech accessories"
          fetchPriority="high"
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain object-center"
        />

        {/* Gentle darkening in the copy area for legibility. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[48%] bg-gradient-to-b from-[#050914]/45 via-[#050914]/20 to-transparent" />

        {/* GREEN SAFE AREA: keep all live copy within this upper region. */}
        <div className="absolute inset-x-[7%] top-[8.5%] z-10 flex justify-center">
          <div className="w-full max-w-[88%] text-center text-white">
            <p className="mb-2 text-[clamp(7px,1.8vw,9px)] font-semibold uppercase tracking-[0.13em] text-white/85">
              INFIBETTER · APPLE ESSENTIALS
            </p>

            <h1 className="text-[clamp(20px,5.8vw,28px)] font-semibold leading-[1.02] tracking-[-0.045em]">
              Power Up.
              <br />
              Stay Connected.
            </h1>

            <p className="mx-auto mt-2 max-w-[260px] text-[clamp(8px,2.15vw,10px)] leading-[1.4] text-white/90">
              Smarter charging. Seamless everyday power.
            </p>

            <div className="mt-3 flex justify-center">
              <Link
                to="/shop"
                className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full border border-white/80 bg-gradient-to-b from-white via-white/95 to-[#E7E7E7] px-3 py-1.5 text-[9px] font-semibold text-[#111827] shadow-[0_4px_14px_rgba(0,0,0,0.18),inset_0_1px_1px_white] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(0,0,0,0.24)] active:scale-[0.97]"
              >
                Explore Accessories
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP / TABLET HERO */}
      <div className="relative hidden w-full overflow-hidden bg-[#080B12] sm:block">
        <img
          src={heroDesktop}
          alt="INFIBETTER smart charging and tech accessories"
          fetchPriority="high"
          draggable={false}
          className="block h-auto w-full object-contain object-center"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

        <div className="absolute inset-0 z-10 flex items-center px-10 lg:px-[8.5%]">
          <div className="w-full max-w-[560px] text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
              INFIBETTER · APPLE ESSENTIALS
            </p>

            <h1 className="text-[clamp(2.25rem,5.2vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
              Power Up.
              <br />
              Stay Connected.
            </h1>

            <p className="mt-5 max-w-[440px] text-base leading-7 text-white/95 lg:text-lg">
              Smarter charging. Seamless everyday power.
            </p>

            <div className="mt-8">
              <Link
                to="/shop"
                className="group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/80 bg-gradient-to-b from-white via-white/95 to-[#E7E7E7] px-6 py-3 text-sm font-semibold text-[#111827] shadow-[0_4px_14px_rgba(0,0,0,0.18),inset_0_1px_1px_white] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.24)] active:translate-y-0 active:scale-[0.97]"
              >
                <span className="pointer-events-none absolute inset-y-0 left-[-45%] w-[38%] -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 transition-all duration-700 group-hover:left-[115%]" />
                <span className="relative z-10">Explore Accessories</span>
                <span aria-hidden="true" className="relative z-10">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
