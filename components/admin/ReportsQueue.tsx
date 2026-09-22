"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Opportunity, OpportunityReport, ReportStatus } from "@/lib/types/database";

const REASON_LABEL: Record<string, string> = {
  incorrect_deadline: "Incorrect deadline",
  broken_link: "Broken link",
  outdated_requirement: "Outdated requirement",
  incorrect_funding_info: "Incorrect funding info",
  duplicate_opportunity: "Duplicate opportunity",
  suspicious_opportunity: "Suspicious opportunity",
  other: "Other",
};

const STATUS_STYLE: Record<ReportStatus, string> = {
  open: "bg-[var(--color-urgent-soft)] text-[var(--color-urgent)]",
  reviewed: "bg-[var(--color-verified-soft)] text-[var(--color-verified)]",
  dismissed: "bg-slate-100 text-slate-500",
};

export function ReportsQueue({ reports }: { reports: (OpportunityReport & { opportunity: Opportunity })[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: ReportStatus) {
    setUpdating(id);
    await supabase.from("opportunity_reports").update({ status }).eq("id", id);
    setUpdating(null);
    router.refresh();
  }

  if (reports.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">No reports yet.</p>;
  }

  return (
    <div className="divide-y divide-[var(--color-line)] rounded-sm border border-[var(--color-line)] bg-white">
      {reports.map((r) => (
        <div key={r.id} className="px-4 sm:px-5 py-4">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="min-w-0">
              <Link href={`/opportunities/${r.opportunity_id}`} className="font-medium text-sm hover:underline">
                {r.opportunity?.name ?? "Opportunity"}
              </Link>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                {REASON_LABEL[r.reason] ?? r.reason} · {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              {r.details && <p className="text-sm text-[var(--color-ink-soft)] mt-2">{r.details}</p>}
            </div>
            <span className={`shrink-0 text-xs font-medium rounded-sm px-2 py-0.5 ${STATUS_STYLE[r.status]}`}>
              {r.status}
            </span>
          </div>
          {r.status === "open" && (
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => updateStatus(r.id, "reviewed")}
                disabled={updating === r.id}
                className="text-xs font-medium text-[var(--color-verified)] hover:underline disabled:opacity-60"
              >
                Mark reviewed
              </button>
              <button
                onClick={() => updateStatus(r.id, "dismissed")}
                disabled={updating === r.id}
                className="text-xs font-medium text-[var(--color-muted)] hover:underline disabled:opacity-60"
              >
                Dismiss
              </button>
              <Link
                href={`/admin/opportunities/${r.opportunity_id}/edit`}
                className="text-xs font-medium text-[var(--color-brass)] hover:underline"
              >
                Edit opportunity
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
