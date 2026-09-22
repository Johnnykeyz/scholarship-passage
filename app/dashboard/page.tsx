import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { RevealSection } from "@/components/RevealSection";
import { PlanSummaryCard } from "@/components/PlanSummaryCard";
import { daysRemaining, formatDeadline } from "@/lib/deadlines";
import type { Application, Opportunity, Profile } from "@/lib/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { data: applications, error: applicationsError } = await supabase
    .from("applications")
    .select("*, opportunity:opportunities(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const apps = (applications ?? []) as (Application & { opportunity: Opportunity })[];

  const { count: savedCount } = await supabase
    .from("saved_opportunities")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const upcoming = apps
    .filter((a) => a.opportunity?.application_deadline)
    .map((a) => ({ ...a, days: daysRemaining(a.opportunity.application_deadline) }))
    .filter((a) => a.days !== null && a.days >= 0)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
    .slice(0, 4);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <AppShell>
      <RevealSection className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="font-serif text-3xl">
            {apps.length === 0 ? `Welcome, ${firstName}.` : `Welcome back, ${firstName}.`}
          </h1>
          {Boolean(savedCount) && (
            <Link
              href="/saved"
              className="shrink-0 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-brass)] mt-1.5 whitespace-nowrap"
            >
              {savedCount} saved
            </Link>
          )}
        </div>
        <p className="text-[var(--color-muted)] mb-6">
          {apps.length === 0
            ? "Let's find your first opportunity."
            : `You're tracking ${apps.length} application${apps.length === 1 ? "" : "s"}.`}
        </p>

        <PlanSummaryCard profile={profile as Profile | null} />

        {applicationsError && (
          <div className="rounded-sm border border-[var(--color-urgent)] bg-[var(--color-urgent-soft)] px-4 py-3 mb-6 text-sm text-[var(--color-urgent)]">
            We couldn&apos;t load your applications just now. This is
            usually temporary — try refreshing the page.
          </div>
        )}

        {apps.length === 0 ? (
          <div className="rounded-sm border border-[var(--color-line)] bg-white p-10 text-center">
            <p className="font-serif text-xl mb-2">No applications yet</p>
            <p className="text-sm text-[var(--color-muted)] mb-6 max-w-sm mx-auto">
              Explore scholarships, university programs, and fellowships, then
              start tracking the ones you want to pursue.
            </p>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#94430a]"
            >
              Explore opportunities
              <ArrowUpRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wide mb-3">
                Upcoming deadlines
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">No upcoming deadlines to show.</p>
              ) : (
                <div className="divide-y divide-[var(--color-line)] rounded-sm border border-[var(--color-line)] bg-white">
                  {upcoming.map((a) => (
                    <Link
                      key={a.id}
                      href={`/applications/${a.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-paper-dim)]"
                    >
                      <div>
                        <p className="font-medium text-sm">{a.opportunity.name}</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {formatDeadline(a.opportunity.application_deadline)}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          (a.days ?? 999) <= 14 ? "text-[var(--color-urgent)]" : "text-[var(--color-ink)]"
                        }`}
                      >
                        {a.days} day{a.days === 1 ? "" : "s"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wide">
                  Your applications
                </h2>
                <Link href="/applications" className="text-sm text-[var(--color-brass)] hover:underline">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-[var(--color-line)] rounded-sm border border-[var(--color-line)] bg-white">
                {apps.slice(0, 5).map((a) => (
                  <Link
                    key={a.id}
                    href={`/applications/${a.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-paper-dim)]"
                  >
                    <div>
                      <p className="font-medium text-sm">{a.opportunity.name}</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">{a.opportunity.country}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        <Link
          href="/ai"
          className="mt-10 flex items-center justify-between gap-3 rounded-sm border border-dashed border-[var(--color-line)] px-4 py-3.5 hover:border-[var(--color-brass)] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles size={15} className="text-[var(--color-brass)] shrink-0" />
            <p className="text-sm">
              <span className="font-medium">AI application tools</span>{" "}
              <span className="text-[var(--color-muted)]">— coming soon for premium accounts</span>
            </p>
          </div>
        </Link>
      </RevealSection>
    </AppShell>
  );
}
