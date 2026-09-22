"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

const DEGREE_OPTIONS = ["Bachelor's", "Master's", "PhD", "Fellowship", "Research opportunity", "Exchange"];
const COUNTRY_OPTIONS = ["UK", "USA", "Germany", "Canada", "Netherlands", "Finland", "Sweden", "Other"];
const FUNDING_OPTIONS = [
  { value: "fully_funded", label: "Fully funded" },
  { value: "partially_funded", label: "Partially funded" },
  { value: "any", label: "Any" },
];

export function PlanningForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const [targetDegree, setTargetDegree] = useState(initial?.target_degree ?? "");
  const [targetIntake, setTargetIntake] = useState(initial?.target_intake ?? "");
  const [countries, setCountries] = useState<string[]>(initial?.preferred_countries ?? []);
  const [funding, setFunding] = useState(initial?.funding_preference ?? "");
  const [notes, setNotes] = useState(initial?.planning_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleCountry(c: string) {
    setCountries((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          target_degree: targetDegree || null,
          target_intake: targetIntake || null,
          preferred_countries: countries,
          funding_preference: funding || null,
          planning_notes: notes || null,
        })
        .eq("id", user.id);
    }
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div>
        <label className="block text-sm font-medium mb-2">Target degree</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEGREE_OPTIONS.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => {
                setTargetDegree(d);
                setSaved(false);
              }}
              className={`rounded-sm border px-3 py-2.5 text-sm text-left transition-all active:scale-[0.97] ${
                targetDegree === d
                  ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                  : "border-[var(--color-line)] hover:border-[var(--color-ink-soft)]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="intake" className="block text-sm font-medium mb-2">
          Target intake
        </label>
        <input
          id="intake"
          value={targetIntake}
          onChange={(e) => {
            setTargetIntake(e.target.value);
            setSaved(false);
          }}
          placeholder="e.g. Fall 2027, September 2027"
          className="w-full sm:w-64 rounded-sm border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-brass)] focus:outline-none"
        />
        <p className="text-xs text-[var(--color-muted)] mt-1.5">
          Free text — write it however makes sense to you.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Countries you&apos;re interested in</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COUNTRY_OPTIONS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => toggleCountry(c)}
              className={`rounded-sm border px-3 py-2.5 text-sm text-left transition-all active:scale-[0.97] ${
                countries.includes(c)
                  ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                  : "border-[var(--color-line)] hover:border-[var(--color-ink-soft)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Funding preference</label>
        <div className="grid gap-2 sm:grid-cols-3">
          {FUNDING_OPTIONS.map((f) => (
            <button
              type="button"
              key={f.value}
              onClick={() => {
                setFunding(f.value);
                setSaved(false);
              }}
              className={`rounded-sm border px-3 py-2.5 text-sm text-left transition-all active:scale-[0.97] ${
                funding === f.value
                  ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                  : "border-[var(--color-line)] hover:border-[var(--color-ink-soft)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          What are you preparing for, in your own words?
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          placeholder="e.g. Applying to AI/ML master's programmes in the UK and Germany, aiming for fully funded options. Need to sit IELTS by December."
          className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2.5 text-sm focus:border-[var(--color-brass)] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#94430a] disabled:opacity-60 transition-colors active:scale-[0.98]"
        >
          {saving ? "Saving…" : "Save plan"}
        </button>
        {saved && <span className="text-sm text-[var(--color-verified)]">Saved</span>}
      </div>
    </form>
  );
}
