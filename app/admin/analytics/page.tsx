import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

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

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days } = await searchParams;
  const windowDays = Number(days) || 30;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const { data, error } = await supabase.rpc("admin_analytics_summary", { p_days: windowDays });
  const summary = (data ?? null) as AnalyticsSummary | null;

  return (
    <div className="flex-1 bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-4 sm:py-5">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            <ArrowLeft size={15} />
            Back to admin dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl mb-1">Analytics</h1>
            <p className="text-[var(--color-muted)] text-sm">
              User activity, engagement, and catalog performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <Link
                key={d}
                href={`/admin/analytics?days=${d}`}
                className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                  windowDays === d
                    ? "bg-[var(--color-ink)] text-white"
                    : "border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"
                }`}
              >
                {d}d
              </Link>
            ))}
          </div>
        </div>

        {error || !summary ? (
          <p className="text-sm text-[var(--color-urgent)] bg-[var(--color-urgent-soft)] rounded-sm px-4 py-3">
            Couldn&apos;t load analytics{error ? `: ${error.message}` : ""}. Make sure the
            <code className="mx-1 text-xs bg-white px-1.5 py-0.5 rounded-sm">admin_analytics_summary</code>
            function has been created in your Supabase project (see <code className="text-xs bg-white px-1.5 py-0.5 rounded-sm">supabase/schema.sql</code> or the Phase 2 migration).
          </p>
        ) : (
          <AnalyticsCharts summary={summary} windowDays={windowDays} />
        )}
      </div>
    </div>
  );
}
