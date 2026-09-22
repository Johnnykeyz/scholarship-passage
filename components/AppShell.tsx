"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Compass, FolderKanban, Calculator, LogOut, ShieldCheck, Target, Sparkles, Bookmark, FileStack, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";

// Shown on both the mobile bottom bar and the desktop sidebar.
const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/opportunities", label: "Explore", icon: Compass },
  { href: "/applications", label: "Applications", icon: FolderKanban },
  { href: "/planning", label: "Planning", icon: Target },
  { href: "/tools/cgpa", label: "CGPA Tool", icon: Calculator },
];

// Desktop sidebar only — keeps the mobile bottom bar to 5 comfortable taps.
const SECONDARY_NAV: { href: string; label: string; icon: typeof Bookmark; badge?: string }[] = [
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/documents", label: "Documents", icon: FileStack },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/ai", label: "AI Tools", icon: Sparkles, badge: "Soon" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!cancelled) setIsAdmin(Boolean(data?.is_admin));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[var(--color-paper)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:border-r border-[var(--color-line)] md:min-h-screen">
        <div className="px-6 py-5 flex items-center justify-between">
          <Link href="/dashboard" className="font-serif text-lg font-semibold">
            Passage
          </Link>
          <NotificationBell />
        </div>
        <nav className="flex flex-col px-3 py-4 gap-1">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                    : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
          {SECONDARY_NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                    : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-[9px] font-medium uppercase tracking-wide text-[var(--color-brass)] bg-[var(--color-brass-soft)] px-1.5 py-0.5 rounded-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                pathname?.startsWith("/admin")
                  ? "bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"
              }`}
            >
              <ShieldCheck size={16} strokeWidth={2} />
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-paper-dim)] mt-4"
          >
            <LogOut size={16} strokeWidth={2} />
            Log out
          </button>
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between px-5 py-4 border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur sticky top-0 z-20">
        <Link href="/dashboard" className="font-serif text-lg font-semibold">
          Passage
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)] p-1.5"
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-line)] bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${NAV.length}, minmax(0, 1fr))` }}>
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-medium px-0.5"
              >
                <span
                  className={`flex items-center justify-center size-7 rounded-full transition-all ${
                    active ? "bg-[var(--color-brass-soft)] text-[var(--color-brass)] scale-105" : "text-[var(--color-muted)]"
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className={`truncate max-w-full ${active ? "text-[var(--color-brass)]" : "text-[var(--color-muted)]"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
