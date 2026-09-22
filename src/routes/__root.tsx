import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import {
  useEffect,
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
          Trang bạn tìm không tồn tại.
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
          Về trang chủ
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
          Có lỗi xảy ra
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Vui lòng thử lại.
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
          Thử lại
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
          content:
            "width=device-width, initial-scale=1",
        },

        {
          title:
            "OLIVE — Đèn decor tối giản",
        },

        {
          name: "description",
          content:
            "Nội thất tối giản, vật liệu bền vững. Sofa, bàn, ghế, giường, tủ kệ. Giao hàng toàn quốc.",
        },

        {
          property: "og:title",
          content:
            "OLIVE — Đèn decor tối giản",
        },

        {
          property: "og:description",
          content:
            "Nội thất tối giản, vật liệu bền vững.",
        },

        {
          property: "og:type",
          content: "website",
        },

        {
          name: "twitter:card",
          content:
            "summary_large_image",
        },
      ],

      links: [

        /* =================================================
           WEBSITE FAVICON
        ================================================== */

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

        /* =================================================
           MOBILE / APPLE ICON
        ================================================== */

        {
          rel: "apple-touch-icon",
          href: "/favicon.png",
        },

        /* =================================================
           MAIN CSS
        ================================================== */

        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }),

    shellComponent: RootShell,

    component: RootComponent,

    notFoundComponent:
      NotFoundComponent,

    errorComponent:
      ErrorComponent,
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
    <html lang="vi">

      <head>

        <HeadContent />

        {/* =================================================
            OLIVE LIVING — ORGANIZATION SCHEMA
        ================================================== */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context":
                "https://schema.org",

              "@type":
                "Organization",

              name:
                "OLIVE LIVING",

              url:
                "https://olivelivingvn.com",

              logo:
                "https://olivelivingvn.com/favicon.png",
            }),
          }}
        />

        {/* =================================================
            Google Ads
        ================================================== */}

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18304524589"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'AW-18304524589');
`,
          }}
        />

        {/* =================================================
            Meta Pixel
        ================================================== */}

        <script
          id="meta-pixel"
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;
n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;
n.push=n;
n.loaded=!0;
n.version='2.0';
n.queue=[];
t=b.createElement(e);
t.async=!0;
t.src=v;
s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s);
}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '1669719914311117');
fbq('track', 'PageView');
`,
          }}
        />

        {/* =================================================
            Google Tag Manager
        ================================================== */}

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(w,d,s,l,i){
w[l]=w[l]||[];
w[l].push({
  'gtm.start':
  new Date().getTime(),
  event:'gtm.js'
});

var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),
dl=l!='dataLayer'
  ?'&l='+l
  :'';

j.async=true;

j.src=
'https://www.googletagmanager.com/gtm.js?id='
+i+dl;

f.parentNode.insertBefore(j,f);

})(window,document,'script',
'dataLayer','GTM-MPSMWLKS');
`,
          }}
        />

        {/* End Google Tag Manager */}

      </head>


      <body>

        {/* =================================================
            META PIXEL + GOOGLE TAG MANAGER NOSCRIPT
        ================================================== */}

        <noscript>

          <img
            height="1"
            width="1"
            style={{
              display: "none",
            }}
            src="https://www.facebook.com/tr?id=1669719914311117&ev=PageView&noscript=1"
            alt=""
          />

          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MPSMWLKS"
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
          />

        </noscript>

        {/* End Google Tag Manager (noscript) */}


        {children}

        <Scripts />

      </body>

    </html>
  );
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
    } =
      supabase.auth.onAuthStateChange(
        (event) => {

          if (
            event !== "SIGNED_IN" &&
            event !== "SIGNED_OUT" &&
            event !== "USER_UPDATED"
          ) {
            return;
          }

          router.invalidate();

          if (
            event !== "SIGNED_OUT"
          ) {
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

    <QueryClientProvider
      client={queryClient}
    >

      <AuthProvider>

        <CartProvider>

          <>

            {/* <SetagoVoucherPopup /> */}

            <div
              className="
                flex
                min-h-screen
                flex-col
              "
            >

              <SiteHeader />

              <main className="flex-1">
                <Outlet />
              </main>

              <SiteFooter />

            </div>

          </>


          {/* =================================================
              FLOATING CONTACT
          ================================================== */}

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


          <Toaster
            position="top-center"
          />

        </CartProvider>

      </AuthProvider>

    </QueryClientProvider>

  );
}