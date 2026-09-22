"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, List } from "lucide-react";
import type { CalendarItem } from "./page";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function CalendarView({ items }: { items: CalendarItem[] }) {
  const [view, setView] = useState<"month" | "agenda">("agenda");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    return map;
  }, [items]);

  const upcoming = useMemo(() => {
    const todayKey = toDateKey(new Date());
    return items.filter((i) => i.date >= todayKey);
  }, [items]);

  const monthCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // getDay(): 0=Sun..6=Sat; shift so Monday is column 0
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { date: Date | null; key: string }[] = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push({ date: null, key: `blank-${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, key: toDateKey(date) });
    }
    return cells;
  }, [cursor]);

  const todayKey = toDateKey(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1 rounded-sm border border-[var(--color-line)] p-0.5">
          <button
            onClick={() => setView("agenda")}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "agenda" ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-ink-soft)]"
            }`}
          >
            <List size={13} />
            Agenda
          </button>
          <button
            onClick={() => setView("month")}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "month" ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-ink-soft)]"
            }`}
          >
            <CalendarDays size={13} />
            Month
          </button>
        </div>

        {view === "month" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium min-w-[9rem] text-center">{monthLabel(cursor)}</span>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {view === "agenda" ? (
        upcoming.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] text-center py-12">
            No upcoming deadlines or scheduled tasks.
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-line)] rounded-sm border border-[var(--color-line)] bg-white">
            {upcoming.map((item) => (
              <Link
                key={item.id}
                href={`/applications/${item.applicationId}`}
                className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-[var(--color-paper-dim)] transition-colors"
              >
                <div className="min-w-0">
                  <p className={`text-sm ${item.completed ? "line-through text-[var(--color-muted)]" : "font-medium"}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {item.type === "opportunity_deadline" ? "Application deadline" : `Task · ${item.applicationName}`}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-[var(--color-ink-soft)]">
                  {new Date(item.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div>
          <div className="grid grid-cols-7 gap-px mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wide py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-[var(--color-line)] border border-[var(--color-line)] rounded-sm overflow-hidden">
            {monthCells.map((cell) => {
              const dayItems = cell.date ? itemsByDate.get(cell.key) ?? [] : [];
              const isToday = cell.key === todayKey;
              return (
                <div key={cell.key} className="bg-white min-h-[4.5rem] sm:min-h-[5.5rem] p-1.5">
                  {cell.date && (
                    <>
                      <span
                        className={`text-[11px] inline-flex items-center justify-center size-5 rounded-full ${
                          isToday ? "bg-[var(--color-brass)] text-white font-medium" : "text-[var(--color-muted)]"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayItems.slice(0, 2).map((item) => (
                          <Link
                            key={item.id}
                            href={`/applications/${item.applicationId}`}
                            className={`block text-[9px] sm:text-[10px] leading-tight rounded-sm px-1 py-0.5 truncate ${
                              item.type === "opportunity_deadline"
                                ? "bg-[var(--color-urgent-soft)] text-[var(--color-urgent)]"
                                : "bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                            }`}
                            title={item.title}
                          >
                            {item.title}
                          </Link>
                        ))}
                        {dayItems.length > 2 && (
                          <span className="block text-[9px] text-[var(--color-muted)] px-1">
                            +{dayItems.length - 2} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
