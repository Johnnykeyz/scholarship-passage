"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ApplicationRequirement, RequirementStatus } from "@/lib/types/database";
import { formatDeadline } from "@/lib/deadlines";

const CATEGORIES = [
  "academic", "identity", "financial", "language", "research",
  "professional", "application", "visa", "other",
];

const STATUSES: RequirementStatus[] = [
  "not_started", "in_progress", "ready", "submitted", "verified", "not_applicable",
];

const STATUS_STYLE: Record<RequirementStatus, string> = {
  not_started: "bg-slate-100 text-slate-500",
  in_progress: "bg-[var(--color-brass-soft)] text-[var(--color-brass)]",
  ready: "bg-[var(--color-verified-soft)] text-[var(--color-verified)]",
  submitted: "bg-[var(--color-verified-soft)] text-[var(--color-verified)]",
  verified: "bg-[var(--color-verified-soft)] text-[var(--color-verified)]",
  not_applicable: "bg-slate-100 text-slate-400",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function RequirementsPanel({
  applicationId,
  requirements,
}: {
  applicationId: string;
  requirements: ApplicationRequirement[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("academic");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [discoveredOfficial, setDiscoveredOfficial] = useState(false);

  async function updateStatus(reqId: string, status: RequirementStatus) {
    await supabase.from("application_requirements").update({ status }).eq("id", reqId);
    router.refresh();
  }

  async function addRequirement(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("application_requirements").insert({
      application_id: applicationId,
      requirement_name: name,
      category,
      deadline: deadline || null,
      priority,
      notes: notes || null,
      source_link: sourceLink || null,
      source: "user_added",
      discovered_on_official_site: discoveredOfficial,
      status: "not_started",
    });
    await supabase.from("timeline_events").insert({
      application_id: applicationId,
      event_text: `Added requirement: ${name}`,
    });
    setSaving(false);
    setShowForm(false);
    setName("");
    setDeadline("");
    setNotes("");
    setSourceLink("");
    setDiscoveredOfficial(false);
    router.refresh();
  }

  async function removeRequirement(reqId: string) {
    await supabase.from("application_requirements").delete().eq("id", reqId);
    router.refresh();
  }

  return (
    <div>
      {requirements.length === 0 && !showForm ? (
        <p className="text-sm text-[var(--color-muted)] mb-4">No requirements yet.</p>
      ) : (
        <div className="divide-y divide-[var(--color-line)] rounded-sm border border-[var(--color-line)] bg-white mb-4">
          {requirements.map((r) => (
            <div key={r.id} className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{r.requirement_name}</p>
                    {r.source === "user_added" && (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-brass)] bg-[var(--color-brass-soft)] px-1.5 py-0.5 rounded-sm">
                        Added by you
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5 capitalize">
                    {r.category}
                    {r.deadline ? ` · Due ${formatDeadline(r.deadline)}` : ""}
                  </p>
                  {r.notes && <p className="text-xs text-[var(--color-ink-soft)] mt-1">{r.notes}</p>}
                  {r.source_link && (
                    <a
                      href={r.source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--color-brass)] hover:underline block mt-1"
                    >
                      Source link
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as RequirementStatus)}
                    className={`text-xs font-medium rounded-sm px-2 py-1 border-0 ${STATUS_STYLE[r.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                  {r.source === "user_added" && (
                    <button
                      onClick={() => removeRequirement(r.id)}
                      className="text-[var(--color-muted)] hover:text-[var(--color-urgent)]"
                      aria-label="Remove requirement"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={addRequirement} className="rounded-sm border border-[var(--color-line)] bg-white p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Requirement name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Portfolio"
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Source link</label>
              <input
                value={sourceLink}
                onChange={(e) => setSourceLink(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <input
              type="checkbox"
              checked={discoveredOfficial}
              onChange={(e) => setDiscoveredOfficial(e.target.checked)}
            />
            I discovered this requirement on the official website
          </label>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-white hover:bg-[#94430a] disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add requirement"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brass)] hover:underline"
        >
          <Plus size={15} />
          Add requirement
        </button>
      )}
    </div>
  );
}
