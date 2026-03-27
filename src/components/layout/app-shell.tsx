"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationGroups = [
  {
    title: "Narrative",
    items: [
      { href: "/events", label: "イベント" },
      { href: "/timeline", label: "タイムライン" },
      { href: "/graph/events", label: "グラフ" }
    ]
  },
  {
    title: "Entities",
    items: [
      { href: "/person", label: "人物" },
      { href: "/polities", label: "国家" },
      { href: "/dynasties", label: "王朝" },
      { href: "/periods", label: "時代区分" },
      { href: "/religions", label: "宗教" },
      { href: "/sects", label: "宗派" },
      { href: "/regions", label: "地域" },
      { href: "/tags", label: "タグ" },
      { href: "/sources", label: "出典" }
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/manage/data", label: "データ運用" },
      { href: "/period-categories", label: "カテゴリ" },
      { href: "/bootstrap", label: "Bootstrap" }
    ]
  }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="historia-shell">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="historia-panel overflow-hidden rounded-[14px]">
            <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1.2fr,0.8fr] lg:px-10 lg:py-9">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="historia-label">Historical Knowledge Ledger</span>
                  <span className="rounded-[14px] border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--muted-strong)]">
                    Local archive
                  </span>
                </div>
                <div className="max-w-3xl">
                  <Link href="/events" className="historia-title text-4xl font-semibold tracking-[0.03em] sm:text-5xl">
                    historia
                  </Link>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-strong)] sm:text-base">
                    歴史イベント、人物、国家、王朝、時代区分をひとつの資料室のように横断管理するローカル年表システム。
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Primary domain" value="Events" note="叙述の中核" />
                  <StatCard label="Knowledge graph" value="Linked" note="関連主体を横断" />
                  <StatCard label="Editorial mode" value="Curated" note="入力と参照を両立" />
                </div>
              </div>

              <div className="historia-inset rounded-[14px] p-4 sm:p-5">
                <p className="historia-label">Navigation atlas</p>
                <div className="mt-4 space-y-4">
                  {navigationGroups.map((group) => (
                    <div key={group.title} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                      <div className="px-2 pb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{group.title}</div>
                      <nav className="flex flex-wrap gap-2">
                        {group.items.map((item) => {
                          const active = isActivePath(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={[
                                "rounded-[14px] border px-3 py-2 text-sm",
                                active
                                  ? "border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--foreground-strong)] shadow-[inset_0_0_0_1px_rgba(222,179,111,0.18)]"
                                  : "border-[var(--border)] bg-black/10 text-[var(--muted-strong)] hover:border-[var(--border-strong)] hover:bg-white/6 hover:text-[var(--foreground)]"
                              ].join(" ")}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/events") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-4">
      <div className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</div>
      <div className="mt-2 text-xl font-semibold text-[var(--foreground-strong)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted-strong)]">{note}</div>
    </div>
  );
}
