import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { RevealSection } from "@/components/RevealSection";
import { formatDeadline } from "@/lib/deadlines";
import type { Application, Opportunity } from "@/lib/types/database";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: applications } = await supabase
    .from("applications")
    .select("*, opportunity:opportunities(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const apps = (applications ?? []) as (Application & { opportunity: Opportunity })[];

  return (
    <AppShell>
      <RevealSection className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-serif text-3xl">My Applications</h1>
          <div className="flex items-center gap-3">
            {apps.length >= 2 && (
              <Link
                href="/applications/compare"
                className="inline-flex items-center justify-center rounded-sm border border-[var(--color-line)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)] transition-colors active:scale-[0.98]"
              >
                Compare
              </Link>
            )}
            <Link
              href="/opportunities"
              className="inline-flex items-center justify-center rounded-sm bg-[var(--color-brass)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#94430a] transition-colors active:scale-[0.98] sm:self-auto self-start"
            >
              Find more opportunities
            </Link>
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="rounded-sm border border-[var(--color-line)] bg-white p-10 text-center">
            <p className="font-serif text-xl mb-2">Nothing tracked yet</p>
            <p className="text-sm text-[var(--color-muted)]">
              You haven&apos;t started tracking any applications yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-line)] rounded-sm border border-[var(--color-line)] bg-white">
            {apps.map((a) => (
              <Link
                key={a.id}
                href={`/applications/${a.id}`}
                className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 hover:bg-[var(--color-paper-dim)] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{a.opportunity.name}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5 truncate">
                    {a.opportunity.country} · Deadline: {formatDeadline(a.opportunity.application_deadline)}
                  </p>
                </div>
                <span className="shrink-0">
                  <StatusBadge status={a.status === "preparing" ? "open" : a.status} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </RevealSection>
    </AppShell>
  );
}
