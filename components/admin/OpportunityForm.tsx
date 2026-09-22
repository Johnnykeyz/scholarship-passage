"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Opportunity, OpportunityType, OpportunityStatus, TrustLevel } from "@/lib/types/database";

const TYPES: OpportunityType[] = [
  "scholarship", "university_program", "research_position",
  "fellowship", "assistantship", "grant", "exchange_program",
];

const STATUSES: OpportunityStatus[] = ["upcoming", "open", "closing_soon", "closed", "expected", "archived"];
const TRUST_LEVELS: TrustLevel[] = ["officially_verified", "needs_verification", "user_reported"];

type FormState = Partial<Opportunity>;

function label(s: string) {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function toDateInput(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function OpportunityForm({ initial }: { initial?: Opportunity }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<FormState>(
    initial ?? {
      type: "scholarship",
      status: "open",
      trust_level: "needs_verification",
      country: "",
      name: "",
      tuition_coverage: false,
      living_allowance: false,
      travel_allowance: false,
      accommodation_coverage: false,
      health_insurance: false,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      last_verified_at: form.last_verified_at || new Date().toISOString().slice(0, 10),
    };

    if (initial) {
      const { error } = await supabase.from("opportunities").update(payload).eq("id", initial.id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("opportunities").insert(payload);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    router.push("/admin");
    router.refresh();
  }

  async function handleArchive() {
    if (!initial) return;
    if (!confirm("Archive this opportunity? It will be hidden from the public catalog but not deleted.")) return;
    setSaving(true);
    await supabase.from("opportunities").update({ status: "archived" }).eq("id", initial.id);
    setSaving(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="text-sm text-[var(--color-urgent)] bg-[var(--color-urgent-soft)] rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <Section title="Basics">
        <Field label="Name" required>
          <input
            required
            value={form.name ?? ""}
            onChange={(e) => set("name", e.target.value)}
            className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Type" required>
            <select
              value={form.type ?? "scholarship"}
              onChange={(e) => set("type", e.target.value as OpportunityType)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {label(t)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Provider">
            <input
              value={form.provider ?? ""}
              onChange={(e) => set("provider", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Country" required>
            <input
              required
              value={form.country ?? ""}
              onChange={(e) => set("country", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="City">
            <input
              value={form.city ?? ""}
              onChange={(e) => set("city", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Institution">
            <input
              value={form.institution ?? ""}
              onChange={(e) => set("institution", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Degree level">
            <select
              value={form.degree_level ?? ""}
              onChange={(e) => set("degree_level", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            >
              <option value="">—</option>
              <option value="bachelors">Bachelor&apos;s</option>
              <option value="masters">Master&apos;s</option>
              <option value="phd">PhD</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="fellowship">Fellowship</option>
            </select>
          </Field>
          <Field label="Field of study">
            <input
              value={form.field ?? ""}
              onChange={(e) => set("field", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
          />
        </Field>
      </Section>

      <Section title="Funding">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Funding type">
            <select
              value={form.funding_type ?? ""}
              onChange={(e) => set("funding_type", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            >
              <option value="">—</option>
              <option value="fully_funded">Fully funded</option>
              <option value="partially_funded">Partially funded</option>
              <option value="tuition_only">Tuition only</option>
              <option value="stipend">Stipend</option>
              <option value="self_funded">Self-funded</option>
            </select>
          </Field>
          <Field label="Duration">
            <input
              value={form.duration ?? ""}
              onChange={(e) => set("duration", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <Field label="Funding amount / detail">
          <input
            value={form.funding_amount ?? ""}
            onChange={(e) => set("funding_amount", e.target.value)}
            className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
          />
        </Field>
        <div className="flex flex-wrap gap-4">
          {(
            [
              ["tuition_coverage", "Tuition covered"],
              ["living_allowance", "Living allowance"],
              ["travel_allowance", "Travel allowance"],
              ["accommodation_coverage", "Accommodation"],
              ["health_insurance", "Health insurance"],
            ] as const
          ).map(([key, lbl]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form[key])}
                onChange={(e) => set(key, e.target.checked)}
              />
              {lbl}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Eligibility">
        <Field label="Eligibility summary">
          <textarea
            rows={3}
            value={form.eligibility_summary ?? ""}
            onChange={(e) => set("eligibility_summary", e.target.value)}
            className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Nationality requirements">
          <input
            value={form.nationality_requirements ?? ""}
            onChange={(e) => set("nationality_requirements", e.target.value)}
            className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Language requirements">
            <input
              value={form.language_requirements ?? ""}
              onChange={(e) => set("language_requirements", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Work experience requirements">
            <input
              value={form.work_experience_requirements ?? ""}
              onChange={(e) => set("work_experience_requirements", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </Section>

      <Section title="Dates">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Applications open">
            <input
              type="date"
              value={toDateInput(form.application_opens)}
              onChange={(e) => set("application_opens", e.target.value || null)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Application deadline">
            <input
              type="date"
              value={toDateInput(form.application_deadline)}
              onChange={(e) => set("application_deadline", e.target.value || null)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Start date">
            <input
              type="date"
              value={toDateInput(form.start_date)}
              onChange={(e) => set("start_date", e.target.value || null)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </Section>

      <Section title="Sourcing & trust">
        <p className="text-xs text-[var(--color-muted)] -mt-2">
          Accurate sourcing is what makes the catalog trustworthy. Never
          publish a scholarship without a real official source link.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Official website" required>
            <input
              required
              type="url"
              value={form.official_website ?? ""}
              onChange={(e) => set("official_website", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Official application portal">
            <input
              type="url"
              value={form.official_application_portal ?? ""}
              onChange={(e) => set("official_application_portal", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Source name" required>
            <input
              required
              value={form.source_name ?? ""}
              onChange={(e) => set("source_name", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Source URL" required>
            <input
              required
              type="url"
              value={form.source_url ?? ""}
              onChange={(e) => set("source_url", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Last verified">
            <input
              type="date"
              value={toDateInput(form.last_verified_at) || new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("last_verified_at", e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status ?? "open"}
              onChange={(e) => set("status", e.target.value as OpportunityStatus)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trust level">
            <select
              value={form.trust_level ?? "needs_verification"}
              onChange={(e) => set("trust_level", e.target.value as TrustLevel)}
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
            >
              {TRUST_LEVELS.map((t) => (
                <option key={t} value={t}>
                  {label(t)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-between pt-2 pb-8">
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#94430a] disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Create opportunity"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Cancel
          </button>
        </div>
        {initial && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={saving}
            className="text-sm text-[var(--color-urgent)] hover:underline"
          >
            Archive
          </button>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pb-8 border-b border-[var(--color-line)] last:border-b-0">
      <h2 className="font-serif text-lg mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">
        {label}
        {required && <span className="text-[var(--color-urgent)]"> *</span>}
      </label>
      {children}
    </div>
  );
}
