"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Application, Opportunity } from "@/lib/types/database";

export function ComparisonPicker({
  applications,
  preselected,
}: {
  applications: (Application & { opportunity: Opportunity })[];
  preselected: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(preselected);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleCompare() {
    router.push(`/applications/compare?ids=${selected.join(",")}`);
  }

  if (applications.length < 2) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        You need at least two tracked applications to compare them.
      </p>
    );
  }

  return (
    <div>
      <div className="space-y-2 mb-6">
        {applications.map((a) => (
          <label
            key={a.id}
            className="flex items-center gap-3 rounded-sm border border-[var(--color-line)] bg-white px-4 py-3 cursor-pointer hover:border-[var(--color-brass)] transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(a.id)}
              onChange={() => toggle(a.id)}
              className="size-4 accent-[var(--color-brass)]"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{a.opportunity.name}</p>
              <p className="text-xs text-[var(--color-muted)]">{a.opportunity.country}</p>
            </div>
          </label>
        ))}
      </div>
      <button
        onClick={handleCompare}
        disabled={selected.length < 2}
        className="rounded-sm bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#94430a] disabled:opacity-50 transition-colors active:scale-[0.98]"
      >
        Compare {selected.length > 0 ? `(${selected.length})` : ""}
      </button>
    </div>
  );
}
