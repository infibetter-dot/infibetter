
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import appCss from "../styles.css?url";

import {
  reportLovableError,
} from "../lib/lovable-error-reporting";

import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

import FloatingContact from "@/components/FloatingContact";
import FloatingShipping from "@/components/FloatingShipping";
import SetagoVoucherPopup from "@/components/SetagoVoucherPopup";

/* =========================================================
   INFIBETTER — META PIXEL CONFIGURATION
========================================================= */

const META_PIXEL_ID = "3789534267871189";

/* =========================================================
   404
========================================================= */

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-7xl">
          404
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Page not found.
        </p>

        <a
          href="/"
          className="
            mt-6
            inline-flex
            rounded-full
            bg-primary
            px-5
            py-2.5
            text-sm
            text-primary-foreground
            hover:opacity-90
          "
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "root",
    });
  }, [error]);

  return (
    <div
      className="
        flex
        min-h-[70vh]
        items-center
        justify-center
        px-4
        text-center
      "
    >
      <div>
        <p className="font-display text-3xl">
          Something went wrong
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Please try again.
        </p>

        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="
            mt-6
            inline-flex
            rounded-full
            bg-primary
            px-5
            py-2.5
            text-sm
            text-primary-foreground
          "
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   ROOT ROUTE
========================================================= */

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "INFIBETTER | Smart Tech Essentials",
        },
        {
          name: "description",
          content:
            "Discover smart tech essentials and everyday accessories designed for convenience, simplicity, and modern living.",
        },
        {
          property: "og:title",
          content: "INFIBETTER | Smart Tech Essentials",
        },
        {
          property: "og:description",
          content:
            "Smart technology and everyday accessories designed for modern living.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:url",
          content: "https://infibetter.com/",
        },
        {
          property: "og:site_name",
          content: "INFIBETTER",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],

      links: [
        /* INFIBETTER FAVICON */

        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
        },
        {
          rel: "shortcut icon",
          type: "image/png",
          href: "/favicon.png",
        },
        {
          rel: "apple-touch-icon",
          href: "/favicon.png",
        },

        /* MAIN CSS */

        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }),

    shellComponent: RootShell,

    component: RootComponent,

    notFoundComponent: NotFoundComponent,

    errorComponent: ErrorComponent,
  });

/* =========================================================
   ROOT SHELL
========================================================= */

function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <HeadContent />

        {/* INFIBETTER ORGANIZATION SCHEMA */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "INFIBETTER",
              url: "https://infibetter.com/",
              logo: "https://infibetter.com/favicon.png",
            }),
          }}
        />
      </head>

      <body>
        {/* META PIXEL NOSCRIPT FALLBACK */}

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        {children}

        <Scripts />
      </body>
    </html>
  );
}

/* =========================================================
   INFIBETTER — META PIXEL TRACKER
   Initializes once and tracks SPA page navigation.
========================================================= */

function MetaPixelTracker() {
  const location = useLocation();
  const lastTrackedUrl = useRef<string | null>(null);

  const pathname = location.pathname;
  const searchStr = location.searchStr;
  const currentUrl = pathname + searchStr;

  useEffect(() => {
    // Prevent duplicate PageView for the same URL.
    if (lastTrackedUrl.current === currentUrl) {
      return;
    }

    lastTrackedUrl.current = currentUrl;

    const win = window as Window & {
      fbq?: (...args: any[]) => void;
      _fbq?: (...args: any[]) => void;
    };

    // Initialize the standard Meta Pixel queue once.
    if (!win.fbq) {
      const fbq: any = function (...args: any[]) {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, args);
        } else {
          fbq.queue.push(args);
        }
      };

      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];

      win.fbq = fbq;
      win._fbq = fbq;

      const script = document.createElement("script");

      script.async = true;
      script.src =
        "https://connect.facebook.net/en_US/fbevents.js";

      document.head.appendChild(script);

      fbq("init", META_PIXEL_ID);
    }

    // Track the initial page and subsequent route changes.
    win.fbq("track", "PageView");
  }, [currentUrl]);

  return null;
}

/* =========================================================
   ROOT COMPONENT
========================================================= */

function RootComponent() {
  const {
    queryClient,
  } = Route.useRouteContext();

  const router = useRouter();

  const [
    hideFloating,
    setHideFloating,
  ] = useState(false);

  /* =================================================
     AUTH STATE
  ================================================== */

  useEffect(() => {
    const {
      data: sub,
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (
          event !== "SIGNED_IN" &&
          event !== "SIGNED_OUT" &&
          event !== "USER_UPDATED"
        ) {
          return;
        }

        router.invalidate();

        if (event !== "SIGNED_OUT") {
          queryClient.invalidateQueries();
        }
      },
    );

    return () =>
      sub.subscription.unsubscribe();
  }, [
    router,
    queryClient,
  ]);

  /* =================================================
     RENDER
  ================================================== */

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <>
            {/* META PIXEL */}

            <MetaPixelTracker />

            {/* VOUCHER POPUP — kept disabled as before */}

            {/* <SetagoVoucherPopup /> */}

            <div className="flex min-h-screen flex-col">
              <SiteHeader />

              <main className="flex-1">
                <Outlet />
              </main>

              <SiteFooter />
            </div>
          </>

          {/* FLOATING CONTACT */}

          {!hideFloating && (
            <>
              <FloatingContact
                onClose={() =>
                  setHideFloating(true)
                }
              />

              {/* <FloatingShipping /> */}
            </>
          )}

          <Toaster position="top-center" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
