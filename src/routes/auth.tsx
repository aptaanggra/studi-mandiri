import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Sparkles } from "lucide-react";


export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Masuk · EduMandiri" },
      { name: "description", content: "Masuk ke EduMandiri untuk mulai belajar bersama AI pembimbing." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, bounce to home.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function signInGoogle() {
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" },
      },
    });
    if (err) {
      setError(err.message ?? "Gagal masuk dengan Google");
      setLoading(false);
    }
    // Browser akan redirect ke Google; setelah kembali, session dipulihkan otomatis oleh supabase-js.
  }


  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/15 grid place-items-center mb-3">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display">EduMandiri</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Belajar mandiri didampingi AI pembimbing.
          </p>
        </div>

        <div className="soft-card p-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[11px]">
            <Sparkles className="h-3 w-3" /> Masuk untuk mulai
          </div>
          <p className="text-sm text-muted-foreground">
            Gunakan akun Google-mu. Data belajarmu tersimpan aman dan hanya bisa diakses lewat akun ini.
          </p>

          <button
            onClick={signInGoogle}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-secondary/60 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <GoogleIcon className="h-4 w-4" />
            {loading ? "Menghubungkan…" : "Masuk dengan Google"}
          </button>

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Dengan masuk, kamu setuju penggunaan yang wajar untuk keperluan belajar.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.9 3.5 14.7 2.6 12 2.6 6.94 2.6 2.85 6.68 2.85 12S6.94 21.4 12 21.4c6.93 0 9.15-4.86 9.15-9.1 0-.6-.06-1.08-.14-1.55H12z"/>
    </svg>
  );
}
