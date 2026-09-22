"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ReportReason } from "@/lib/types/database";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "incorrect_deadline", label: "Incorrect deadline" },
  { value: "broken_link", label: "Broken link" },
  { value: "outdated_requirement", label: "Outdated requirement" },
  { value: "incorrect_funding_info", label: "Incorrect funding info" },
  { value: "duplicate_opportunity", label: "Duplicate opportunity" },
  { value: "suspicious_opportunity", label: "Suspicious opportunity" },
  { value: "other", label: "Other" },
];

export function ReportIssueButton({ opportunityId, isLoggedIn }: { opportunityId: string; isLoggedIn: boolean }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("incorrect_deadline");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isLoggedIn) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("opportunity_reports").insert({
      opportunity_id: opportunityId,
      reported_by: user?.id,
      reason,
      details: details || null,
    });
    setSaving(false);
    setSubmitted(true);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-urgent)]"
      >
        <Flag size={12} />
        Report an issue with this listing
      </button>
    );
  }

  if (submitted) {
    return (
      <p className="text-xs text-[var(--color-verified)]">
        Thanks — your report has been sent to our team for review.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-[var(--color-line)] bg-white p-4 max-w-sm space-y-3">
      <p className="text-xs font-medium">What&apos;s wrong with this listing?</p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        className="w-full rounded-sm border border-[var(--color-line)] px-2.5 py-1.5 text-xs"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Any details that would help us fix it (optional)"
        rows={2}
        className="w-full rounded-sm border border-[var(--color-line)] px-2.5 py-1.5 text-xs"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="text-xs font-medium text-white bg-[var(--color-ink)] rounded-sm px-3 py-1.5 hover:bg-[var(--color-ink-soft)] disabled:opacity-60"
        >
          {saving ? "Sending…" : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
