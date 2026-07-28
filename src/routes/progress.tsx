import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/layout/AppShell";
import { useAuthUser } from "@/lib/user-id";
import { getProgress } from "@/lib/progress.functions";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/progress")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Progres · EduMandiri" },
      { name: "description", content: "Pantau aktivitas belajar, nilai rata-rata, dan perkembangan pemakaian EduMandiri." },
      { property: "og:title", content: "Progres · EduMandiri" },
      { property: "og:description", content: "Pantau aktivitas belajar, nilai rata-rata, dan perkembangan pemakaian EduMandiri." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgressPage,
});

const RANGES = [
  { key: "7", label: "Mingguan" },
  { key: "14", label: "2 Minggu" },
] as const;

function ProgressPage() {
  const { userId } = useAuthUser();
  const fetchFn = useServerFn(getProgress);
  const [range, setRange] = useState<"7" | "14">("14");
  const { data } = useQuery({
    queryKey: ["progress", userId],
    queryFn: () => fetchFn({ data: { userId: userId! } }),
    enabled: !!userId,
  });

  const activity = data ? data.activity.slice(-Number(range)) : [];
  const totalEvents = activity.reduce(
    (s, d: any) => s + (d.threads ?? 0) + (d.essays ?? 0) + (d.analyses ?? 0),
    0,
  );

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl sm:text-[28px] font-extrabold">Aktivitas</h1>
          <div className="pill-toggle">
            {RANGES.map((r) => (
              <button
                key={r.key}
                data-active={range === r.key}
                onClick={() => setRange(r.key)}
                className="pill-toggle-item"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {!data ? (
          <p className="text-sm text-muted-foreground text-center">Memuat…</p>
        ) : (
          <>
            <div className="rounded-[2rem] bg-primary text-primary-foreground p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-lg font-bold">
                  Total aktivitas : {totalEvents}{" "}
                  <span className="font-sans text-sm font-medium opacity-80">kegiatan</span>
                </p>
                <span className="shrink-0 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold">
                  {range === "7" ? "7 hari" : "14 hari"}
                </span>
              </div>
              <div className="h-52 mt-4 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activity} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary-foreground)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--primary-foreground)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      stroke="var(--primary-foreground)"
                      fontSize={11}
                      opacity={0.75}
                    />
                    <Tooltip
                      cursor={{ stroke: "var(--primary-foreground)", strokeOpacity: 0.4 }}
                      contentStyle={{
                        background: "var(--card)",
                        color: "var(--foreground)",
                        border: "none",
                        borderRadius: 14,
                        fontSize: 12,
                        boxShadow: "0 8px 24px -12px oklch(0.3 0.01 60 / 0.5)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="threads"
                      stroke="var(--primary-foreground)"
                      strokeWidth={2}
                      fill="url(#fillA)"
                      dot={{ r: 3, fill: "var(--primary-foreground)", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold mb-3">Progres</h2>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Thread Diskusi" value={data.totals.threads} tone="primary" />
                <Metric label="Pesan" value={data.totals.messages} tone="warning" />
                <Metric label="Esai Dijawab" value={data.totals.essays} tone="success" />
                <Metric label="Tugas Dianalisa" value={data.totals.analyses} tone="danger" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Score label="Rata-rata Skor Esai" value={data.averages.essay ?? "—"} />
              <Score label="Rata-rata Skor Tugas" value={data.averages.analysis ?? "—"} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

const TONES = {
  primary: "var(--primary)",
  warning: "var(--warning)",
  success: "var(--success)",
  danger: "var(--danger)",
} as const;

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="soft-card p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
      </div>
      <span
        className="h-12 w-2 shrink-0 rounded-full opacity-80"
        style={{ background: TONES[tone] }}
      />
    </div>
  );
}

function Score({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="soft-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-primary">{value}</p>
    </div>
  );
}
