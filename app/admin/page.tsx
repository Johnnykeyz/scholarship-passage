import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ExternalLink, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { TrustIndicator } from "@/components/TrustIndicator";
import { StalenessCheckButton } from "@/components/admin/StalenessCheckButton";
import { formatDeadline, daysRemaining, daysSince } from "@/lib/deadlines";
import type { Opportunity } from "@/lib/types/database";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const [{ data: opportunities }, { count: userCount }, { count: applicationCount }, { count: openReportCount }] =
    await Promise.all([
      supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("applications").select("*", { count: "exact", head: true }),
      supabase.from("opportunity_reports").select("*", { count: "exact", head: true }).eq("status", "open"),
    ]);

  const list = (opportunities ?? []) as Opportunity[];
  const openCount = list.filter((o) => o.status === "open" || o.status === "closing_soon").length;
  const needsVerification = list.filter((o) => o.trust_level === "needs_verification").length;
  const staleCount = list.filter((o) => daysSince(o.last_verified_at) > 60).length;

  return (
    <div className="flex-1 bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-serif text-lg font-semibold">
              Passage
            </Link>
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-brass)] bg-[var(--color-brass-soft)] px-2 py-0.5 rounded-sm">
              Admin
            </span>
          </div>
          <Link href="/dashboard" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            Back to app
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-serif text-3xl">Admin dashboard</h1>
          <div className="flex flex-wrap items-center gap-3">
            <StalenessCheckButton />
            <Link
              href="/admin/analytics"
              className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-[var(--color-line)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)] transition-colors active:scale-[0.98]"
            >
              View analytics
            </Link>
            <Link
              href="/admin/opportunities/new"
              className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[var(--color-brass)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#94430a] transition-colors active:scale-[0.98]"
            >
              <Plus size={15} />
              Add opportunity
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <Metric label="Opportunities" value={list.length} />
          <Metric label="Open now" value={openCount} />
          <Metric label="Total users" value={userCount ?? 0} />
          <Metric label="Applications tracked" value={applicationCount ?? 0} />
        </div>

        {(needsVerification > 0 || staleCount > 0 || (openReportCount ?? 0) > 0) && (
          <div className="rounded-sm border border-[var(--color-brass)] bg-[var(--color-brass-soft)] p-4 mb-8 flex flex-wrap items-start gap-x-6 gap-y-2">
            <AlertTriangle size={16} className="text-[var(--color-brass)] mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--color-brass)]">
              {needsVerification > 0 && <span>{needsVerification} opportunit{needsVerification === 1 ? "y needs" : "ies need"} verification</span>}
              {staleCount > 0 && <span>{staleCount} opportunit{staleCount === 1 ? "y" : "ies"} unverified for 60+ days</span>}
              {(openReportCount ?? 0) > 0 && (
                <Link href="/admin/reports" className="underline">
                  {openReportCount} open user report{openReportCount === 1 ? "" : "s"}
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="rounded-sm border border-[var(--color-line)] bg-white divide-y divide-[var(--color-line)]">
          {list.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--color-muted)]">
              No opportunities yet. Add your first one.
            </p>
          ) : (
            list.map((opp) => {
              const days = daysRemaining(opp.application_deadline);
              return (
                <div key={opp.id} className="flex items-center justify-between gap-4 px-4 sm:px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-sm truncate">{opp.name}</p>
                      <StatusBadge status={opp.status} />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--color-muted)]">
                      <span>{opp.country}</span>
                      <span>Deadline: {formatDeadline(opp.application_deadline)}{days !== null && days >= 0 ? ` (${days}d)` : ""}</span>
                      <TrustIndicator level={opp.trust_level} />
                      <span>Verified {formatDeadline(opp.last_verified_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={opp.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      aria-label="Open official website"
                    >
                      <ExternalLink size={15} />
                    </a>
                    <Link
                      href={`/admin/opportunities/${opp.id}/edit`}
                      className="text-sm font-medium text-[var(--color-brass)] hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-[var(--color-line)] bg-white px-4 py-3.5">
      <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-1">{label}</p>
      <p className="font-serif text-2xl">{value}</p>
    </div>
  );
}
