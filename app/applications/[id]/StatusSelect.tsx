"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ApplicationStatus } from "@/lib/types/database";

const STATUSES: ApplicationStatus[] = [
  "interested",
  "researching",
  "preparing",
  "ready_to_apply",
  "submitted",
  "under_review",
  "interview",
  "waitlisted",
  "accepted",
  "rejected",
  "withdrawn",
  "deferred",
];

function label(s: string) {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: ApplicationStatus) {
    setStatus(newStatus);
    setSaving(true);
    await supabase.from("applications").update({ status: newStatus }).eq("id", applicationId);
    await supabase.from("timeline_events").insert({
      application_id: applicationId,
      event_text: `Status changed to ${label(newStatus)}`,
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as ApplicationStatus)}
      className="rounded-sm border border-[var(--color-line)] bg-white px-3 py-2 text-sm font-medium focus:border-[var(--color-brass)] focus:outline-none"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {label(s)}
        </option>
      ))}
    </select>
  );
}
