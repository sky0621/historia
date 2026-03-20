import Link from "next/link";

const navigation = [
  { href: "/events", label: "イベント" },
  { href: "/graph/events", label: "グラフ" },
  { href: "/timeline", label: "タイムライン" },
  { href: "/manage/data", label: "データ運用" },
  { href: "/bootstrap", label: "Bootstrap" },
  { href: "/people", label: "人物" },
  { href: "/polities", label: "国家" },
  { href: "/dynasties", label: "王朝" },
  { href: "/periods", label: "時代区分" },
  { href: "/period-categories", label: "カテゴリ" },
  { href: "/religions", label: "宗教" },
  { href: "/sects", label: "宗派" },
  { href: "/tags", label: "タグ" },
  { href: "/regions", label: "地域" },
  { href: "/sources", label: "出典" }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Link href="/events" className="text-3xl font-semibold tracking-tight">
                historia
              </Link>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                歴史イベントと人物・国家・時代区分を横断管理するローカル年表システム
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-1.5 text-sm transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
