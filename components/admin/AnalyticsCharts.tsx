"use client";

import Link from "next/link";
import { Users, FileText, Compass, TrendingUp } from "lucide-react";

interface AnalyticsSummary {
  window_days: number;
  totals: {
    users: number;
    new_users: number;
    applications: number;
    new_applications: number;
    opportunities: number;
  };
  events_by_type: Record<string, number>;
  events_by_day: { date: string; count: number }[];
  top_opportunities_by_views: { opportunity_id: string; name: string; views: number }[];
  top_opportunities_by_official_clicks: { opportunity_id: string; name: string; clicks: number }[];
  applications_by_status: Record<string, number>;
}

const EVENT_LABELS: Record<string, string> = {
  page_view: "Page views",
  opportunity_view: "Opportunity views",
  opportunity_official_link_click: "Official link clicks",
  opportunity_tracked: "Applications started",
  search_performed: "Searches",
  signup: "Signups",
  login: "Logins",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function AnalyticsCharts({ summary, windowDays }: { summary: AnalyticsSummary; windowDays: number }) {
  const { totals, events_by_type, events_by_day, top_opportunities_by_views, top_opportunities_by_official_clicks, applications_by_status } = summary;

  const maxDayCount = Math.max(1, ...events_by_day.map((d) => d.count));
  const maxEventCount = Math.max(1, ...Object.values(events_by_type));
  const totalStatusCount = Object.values(applications_by_status).reduce((a, b) => a + b, 0) || 1;

  const STATUS_COLORS: Record<string, string> = {
    interested: "#cbd5e1",
    researching: "#94a3b8",
    preparing: "var(--color-brass)",
    ready_to_apply: "var(--color-brass)",
    submitted: "var(--color-verified)",
    under_review: "var(--color-verified)",
    interview: "var(--color-verified)",
    waitlisted: "#f59e0b",
    accepted: "var(--color-verified)",
    rejected: "var(--color-urgent)",
    withdrawn: "#94a3b8",
    deferred: "#94a3b8",
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Metric icon={Users} label="Total users" value={totals.users} sublabel={`+${totals.new_users} in ${windowDays}d`} />
        <Metric icon={FileText} label="Applications tracked" value={totals.applications} sublabel={`+${totals.new_applications} in ${windowDays}d`} />
        <Metric icon={Compass} label="Live opportunities" value={totals.opportunities} />
        <Metric
          icon={TrendingUp}
          label="Events logged"
          value={Object.values(events_by_type).reduce((a, b) => a + b, 0)}
          sublabel={`last ${windowDays}d`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card title="Activity over time">
          {events_by_day.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex items-end gap-0.5 h-40">
              {events_by_day.map((d) => (
                <div key={d.date} className="flex-1 group relative" title={`${d.date}: ${d.count}`}>
                  <div
                    className="bg-[var(--color-brass)] rounded-t-sm w-full transition-all hover:opacity-80"
                    style={{ height: `${Math.max(4, (d.count / maxDayCount) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-2 text-[10px] text-[var(--color-muted)]">
            {events_by_day.length > 0 && (
              <>
                <span>{new Date(events_by_day[0].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                <span>{new Date(events_by_day[events_by_day.length - 1].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
              </>
            )}
          </div>
        </Card>

        <Card title="Events by type">
          {Object.keys(events_by_type).length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2.5">
              {Object.entries(events_by_type)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--color-ink-soft)]">{EVENT_LABELS[type] ?? type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-paper-dim)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-brass)] rounded-full"
                        style={{ width: `${(count / maxEventCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card title="Most viewed opportunities" className="lg:col-span-1">
          {top_opportunities_by_views.length === 0 ? (
            <EmptyState />
          ) : (
            <ol className="space-y-2.5">
              {top_opportunities_by_views.map((o, i) => (
                <li key={o.opportunity_id} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/opportunities/${o.opportunity_id}`} className="min-w-0 truncate hover:underline" title={o.name}>
                    <span className="text-[var(--color-muted)] mr-1.5">{i + 1}.</span>
                    {o.name}
                  </Link>
                  <span className="shrink-0 text-xs font-medium text-[var(--color-brass)]">{o.views}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Most-clicked official links" className="lg:col-span-1">
          {top_opportunities_by_official_clicks.length === 0 ? (
            <EmptyState />
          ) : (
            <ol className="space-y-2.5">
              {top_opportunities_by_official_clicks.map((o, i) => (
                <li key={o.opportunity_id} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/opportunities/${o.opportunity_id}`} className="min-w-0 truncate hover:underline" title={o.name}>
                    <span className="text-[var(--color-muted)] mr-1.5">{i + 1}.</span>
                    {o.name}
                  </Link>
                  <span className="shrink-0 text-xs font-medium text-[var(--color-verified)]">{o.clicks}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="text-[10px] text-[var(--color-muted)] mt-3 pt-3 border-t border-[var(--color-line)]">
            Tracks how often users are directed to verify details on official
            sites — the platform&apos;s core behavior of always pointing back
            to the source.
          </p>
        </Card>

        <Card title="Applications by status" className="lg:col-span-1">
          {Object.keys(applications_by_status).length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex h-3 rounded-full overflow-hidden mb-4">
                {Object.entries(applications_by_status).map(([status, count]) => (
                  <div
                    key={status}
                    style={{
                      width: `${(count / totalStatusCount) * 100}%`,
                      background: STATUS_COLORS[status] ?? "#cbd5e1",
                    }}
                    title={`${statusLabel(status)}: ${count}`}
                  />
                ))}
              </div>
              <ul className="space-y-1.5">
                {Object.entries(applications_by_status)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <li key={status} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-[var(--color-ink-soft)]">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ background: STATUS_COLORS[status] ?? "#cbd5e1" }}
                        />
                        {statusLabel(status)}
                      </span>
                      <span className="font-medium">{count}</span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  sublabel?: string;
}) {
  return (
    <div className="rounded-sm border border-[var(--color-line)] bg-white px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[var(--color-muted)] mb-1.5">
        <Icon size={13} strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-serif text-2xl">{value.toLocaleString()}</p>
      {sublabel && <p className="text-xs text-[var(--color-muted)] mt-0.5">{sublabel}</p>}
    </div>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-sm border border-[var(--color-line)] bg-white p-5 ${className ?? ""}`}>
      <h2 className="text-sm font-medium mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState() {
  return <p className="text-xs text-[var(--color-muted)] py-8 text-center">No data yet for this window.</p>;
}
