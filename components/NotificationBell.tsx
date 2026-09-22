"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { daysRemaining } from "@/lib/deadlines";

interface Alert {
  id: string;
  applicationId: string;
  title: string;
  daysLeft: number;
}

const ALERT_WINDOW_DAYS = 14;

export function NotificationBell() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: applications }, { data: tasks }] = await Promise.all([
        supabase
          .from("applications")
          .select("id, opportunity:opportunities(name, application_deadline)")
          .eq("user_id", user.id),
        supabase
          .from("tasks")
          .select("id, title, deadline, application_id")
          .eq("user_id", user.id)
          .neq("status", "completed")
          .not("deadline", "is", null),
      ]);

      if (cancelled) return;

      const appAlerts: Alert[] = ((applications ?? []) as unknown as {
        id: string;
        opportunity: { name: string; application_deadline: string | null }[] | { name: string; application_deadline: string | null } | null;
      }[])
        .map((a) => {
          const opp = Array.isArray(a.opportunity) ? a.opportunity[0] : a.opportunity;
          const days = daysRemaining(opp?.application_deadline ?? null);
          if (days === null || days < 0 || days > ALERT_WINDOW_DAYS || !opp) return null;
          return { id: `app-${a.id}`, applicationId: a.id, title: `${opp.name} deadline`, daysLeft: days };
        })
        .filter((a): a is Alert => a !== null);

      const taskAlerts: Alert[] = ((tasks ?? []) as { id: string; title: string; deadline: string; application_id: string }[])
        .map((t) => {
          const days = daysRemaining(t.deadline);
          if (days === null || days < 0 || days > ALERT_WINDOW_DAYS) return null;
          return { id: `task-${t.id}`, applicationId: t.application_id, title: t.title, daysLeft: days };
        })
        .filter((a): a is Alert => a !== null);

      const combined = [...appAlerts, ...taskAlerts].sort((a, b) => a.daysLeft - b.daysLeft);
      setAlerts(combined);
      setLoaded(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (!loaded) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="relative text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5"
        aria-label={`${alerts.length} upcoming deadline${alerts.length === 1 ? "" : "s"}`}
      >
        <Bell size={18} strokeWidth={2} />
        {alerts.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full bg-[var(--color-urgent)] text-white text-[9px] font-medium">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-sm border border-[var(--color-line)] bg-white shadow-lg z-30 py-1.5">
          <p className="px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
            Within {ALERT_WINDOW_DAYS} days
          </p>
          {alerts.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[var(--color-muted)]">Nothing due soon.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {alerts.map((a) => (
                <Link
                  key={a.id}
                  href={`/applications/${a.applicationId}`}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-[var(--color-paper-dim)]"
                >
                  <span className="truncate">{a.title}</span>
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      a.daysLeft <= 3 ? "text-[var(--color-urgent)]" : "text-[var(--color-brass)]"
                    }`}
                  >
                    {a.daysLeft === 0 ? "today" : `${a.daysLeft}d`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
