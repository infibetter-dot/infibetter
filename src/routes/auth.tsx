import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Đăng nhập — NHÀ" }] }),
  component: AuthPage,
});

function AuthPage() {
  const mode: "login" = "login";
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const sp = Route.useSearch();

  useEffect(() => {
    if (user) navigate({ to: sp.redirect ?? "/account" });
  }, [user, sp.redirect, navigate]);

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();
    setSubmitting(true);
    if (mode === "register") {
  toast.error("Website hiện không hỗ trợ đăng ký tài khoản.");
  setSubmitting(false);
  return;
} else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (error) return toast.error(error.message);
    }
  }

  async function handleGoogle() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Đăng nhập Google thất bại");
  }

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="font-display text-4xl">
  Chào mừng trở lại
</p>
          <p className="mt-2 text-sm text-muted-foreground">
  Tham gia đình OLIVE LIVING
</p>
        </div>

        <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />HOẶC<span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <input name="password" type="password" required minLength={6} placeholder="Mật khẩu" className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <button disabled={submitting} className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {submitting
  ? "Đang xử lý..."
  : "Đăng nhập"}
          </button>
        </form>

       
        <p className="mt-2 text-center text-xs"><Link to="/" className="text-muted-foreground hover:text-foreground">← Về trang chủ</Link></p>
      </div>
    </div>
  );
}
