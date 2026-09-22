import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RevealSection } from "@/components/RevealSection";
import { StatusBadge } from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { formatDeadline } from "@/lib/deadlines";
import type { Opportunity, SavedOpportunity } from "@/lib/types/database";

const TAG_LABELS: Record<string, string> = {
  dream: "Dream",
  reach: "Reach",
  target: "Target",
  backup: "Backup",
};

const TAG_STYLE: Record<string, string> = {
  dream: "bg-[var(--color-brass-soft)] text-[var(--color-brass)]",
  reach: "bg-[var(--color-urgent-soft)] text-[var(--color-urgent)]",
  target: "bg-[var(--color-verified-soft)] text-[var(--color-verified)]",
  backup: "bg-slate-100 text-slate-500",
};

export default async function SavedOpportunitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: saved } = await supabase
    .from("saved_opportunities")
    .select("*, opportunity:opportunities(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = (saved ?? []) as (SavedOpportunity & { opportunity: Opportunity })[];

  return (
    <AppShell>
      <RevealSection className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
        <h1 className="font-serif text-3xl mb-1">Saved opportunities</h1>
        <p className="text-[var(--color-muted)] mb-8">
          Opportunities you&apos;re considering but haven&apos;t started an application for yet.
        </p>

        {list.length === 0 ? (
          <div className="rounded-sm border border-[var(--color-line)] bg-white p-10 text-center">
            <p className="font-serif text-xl mb-2">Nothing saved yet</p>
            <p className="text-sm text-[var(--color-muted)] mb-6 max-w-sm mx-auto">
              While exploring, tap &ldquo;Save for later&rdquo; on any opportunity to keep track
              of it here before you&apos;re ready to start an application.
            </p>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#94430a] transition-colors active:scale-[0.98]"
            >
              Explore opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((s) => (
              <Link
                key={s.id}
                href={`/opportunities/${s.opportunity_id}`}
                className="block rounded-sm border border-[var(--color-line)] bg-white p-4 sm:p-5 hover:border-[var(--color-brass)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg leading-snug truncate">{s.opportunity.name}</h2>
                    <p className="text-sm text-[var(--color-muted)] mt-1">
                      {s.opportunity.country} · Deadline: {formatDeadline(s.opportunity.application_deadline)}
                    </p>
                  </div>
                  <span className="shrink-0">
                    <StatusBadge status={s.opportunity.status} />
                  </span>
                </div>
                {s.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs font-medium rounded-sm px-2 py-0.5 ${TAG_STYLE[tag] ?? "bg-slate-100 text-slate-500"}`}
                      >
                        {TAG_LABELS[tag] ?? tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </RevealSection>
    </AppShell>
  );
}
