import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, FlaskConical, GraduationCap, LineChart, LogOut, ScanLine } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Beranda", icon: GraduationCap },
  { to: "/chat", label: "Diskusi Sains", icon: FlaskConical },
  { to: "/essay", label: "Soal Esai", icon: BookOpen },
  { to: "/analyze", label: "Analisa Tugas", icon: ScanLine },
  { to: "/progress", label: "Progres", icon: LineChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:flex md:justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="h-9 w-9 shrink-0 rounded-2xl bg-primary grid place-items-center shadow-sm">
              <span className="font-display font-extrabold text-primary-foreground text-base">E</span>
            </div>
            <span className="truncate font-display font-extrabold text-lg text-foreground">EduMandiri</span>
          </Link>
          <nav className="hidden md:flex items-center pill-toggle">
            {links.map((l) => {
              const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
              return (
                <Link key={l.to} to={l.to} data-active={active} className="pill-toggle-item">
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleSignOut}
            title="Keluar"
            className="icon-btn shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-4 pb-28">{children}</main>

      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 h-16 rounded-[2rem] bg-card shadow-[0_10px_30px_-12px_oklch(0.3_0.01_60/0.4)] flex items-center justify-around px-3">
        {links.map((l, i) => {
          const Icon = l.icon;
          const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
          const center = i === 2;
          if (center) {
            return (
              <Link
                key={l.to}
                to={l.to}
                className="-mt-8 h-14 w-14 shrink-0 rounded-full bg-primary grid place-items-center shadow-[0_10px_24px_-8px_oklch(0.63_0.15_38/0.7)]"
                aria-label={l.label}
              >
                <Icon className="h-6 w-6 text-primary-foreground" />
              </Link>
            );
          }
          return (
            <Link
              key={l.to}
              to={l.to}
              aria-label={l.label}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {l.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
