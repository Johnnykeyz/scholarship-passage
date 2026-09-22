import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { TrustIndicator } from "@/components/TrustIndicator";
import { formatDeadline } from "@/lib/deadlines";
import { EligibilityChecker } from "./EligibilityChecker";
import { TrackButton } from "./TrackButton";
import { GlossaryTerm } from "@/components/GlossaryTerm";
import { RevealSection } from "@/components/RevealSection";
import { PageViewTracker } from "@/components/PageViewTracker";
import { OfficialLink } from "@/components/OfficialLink";
import { ReportIssueButton } from "./ReportIssueButton";
import { SaveButton } from "./SaveButton";
import type { Opportunity, OpportunityRequirement, Profile, SavedOpportunity } from "@/lib/types/database";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (!opportunity) notFound();
  const opp = opportunity as Opportunity;

  const { data: requirements } = await supabase
    .from("opportunity_requirements")
    .select("*")
    .eq("opportunity_id", id)
    .order("sort_order");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let existingApplicationId: string | null = null;
  let savedOpportunity: SavedOpportunity | null = null;
  if (user) {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = profileData as Profile | null;

    const { data: existingApp } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("opportunity_id", id)
      .maybeSingle();
    existingApplicationId = existingApp?.id ?? null;

    const { data: savedData } = await supabase
      .from("saved_opportunities")
      .select("*")
      .eq("user_id", user.id)
      .eq("opportunity_id", id)
      .maybeSingle();
    savedOpportunity = savedData as SavedOpportunity | null;
  }

  return (
    <div className="flex-1 bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            <ArrowLeft size={15} />
            Back to opportunities
          </Link>
        </div>
      </header>

      <RevealSection className="mx-auto max-w-4xl px-6 py-10">
        <PageViewTracker eventType="opportunity_view" opportunityId={opp.id} metadata={{ name: opp.name }} />
        <div className="flex items-start justify-between gap-4 mb-2">
          <StatusBadge status={opp.status} />
          <TrustIndicator level={opp.trust_level} />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl leading-tight mb-2">{opp.name}</h1>
        <p className="text-[var(--color-muted)] mb-3">
          {opp.provider}
          {opp.institution && opp.institution !== opp.provider ? ` · ${opp.institution}` : ""} · {opp.country}
          {opp.city ? `, ${opp.city}` : ""}
        </p>
        <p className="text-xs text-[var(--color-muted)] bg-[var(--color-paper-dim)] inline-flex items-center rounded-sm px-2.5 py-1 mb-8">
          Always confirm details on the official website before applying — programmes change without notice.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Stat
            label="Funding"
            value={opp.funding_type?.replace(/_/g, " ") ?? "—"}
            glossaryTerm={opp.funding_type?.replace(/_/g, " ")}
          />
          <Stat label="Duration" value={opp.duration ?? "—"} />
          <Stat label="Deadline" value={formatDeadline(opp.application_deadline)} highlight />
        </div>

        <div className="mb-4 flex flex-wrap items-start gap-3">
          {existingApplicationId ? (
            <Link
              href={`/applications/${existingApplicationId}`}
              className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-verified)] px-5 py-2.5 text-sm font-medium text-white"
            >
              Already tracking — view application
            </Link>
          ) : user ? (
            <TrackButton opportunityId={opp.id} />
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#94430a]"
            >
              Log in to track this opportunity
            </Link>
          )}
          {user && !existingApplicationId && <SaveButton opportunityId={opp.id} initial={savedOpportunity} />}
        </div>

        <Section title="Overview">
          <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{opp.description}</p>
        </Section>

        <Section title="Funding">
          <ul className="text-sm text-[var(--color-ink-soft)] space-y-1.5">
            {opp.funding_amount && <li>{opp.funding_amount}</li>}
            <li className="flex gap-2 flex-wrap">
              {opp.tuition_coverage && <Pill>Tuition covered</Pill>}
              {opp.living_allowance && <Pill>Living allowance</Pill>}
              {opp.travel_allowance && <Pill>Travel allowance</Pill>}
              {opp.health_insurance && <Pill>Health insurance</Pill>}
            </li>
          </ul>
        </Section>

        <Section title="Eligibility">
          <dl className="text-sm space-y-3">
            <Row label="Summary" value={opp.eligibility_summary} />
            <Row label="Nationality" value={opp.nationality_requirements} />
            <Row label="Language" value={opp.language_requirements} />
            <Row label="Work experience" value={opp.work_experience_requirements} />
          </dl>
        </Section>

        {user && (
          <Section title="Check my eligibility">
            <EligibilityChecker opportunity={opp} profile={profile} />
          </Section>
        )}

        <Section title="Documents typically required">
          <ul className="divide-y divide-[var(--color-line)] rounded-sm border border-[var(--color-line)] bg-white">
            {(requirements as OpportunityRequirement[] | null)?.map((r) => (
              <li key={r.id} className="px-4 py-3 text-sm flex items-center justify-between">
                <span>{r.requirement_name}</span>
                <span className="text-xs text-[var(--color-muted)] capitalize">{r.category}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Important dates">
          <dl className="text-sm space-y-2">
            <Row label="Applications open" value={formatDeadline(opp.application_opens)} />
            <Row label="Application deadline" value={formatDeadline(opp.application_deadline)} />
            <Row label="Start date" value={formatDeadline(opp.start_date)} />
          </dl>
        </Section>

        <Section title="Official sources">
          <div className="rounded-sm border border-[var(--color-line)] bg-white p-4 text-sm space-y-2">
            <p>
              Source: <span className="font-medium">{opp.source_name}</span>
            </p>
            <p className="text-[var(--color-muted)]">Last verified: {formatDeadline(opp.last_verified_at)}</p>
            <div className="flex flex-col items-start gap-1.5">
              <OfficialLink href={opp.official_website} opportunityId={opp.id}>
                Visit official website
              </OfficialLink>
              {opp.official_application_portal && (
                <OfficialLink href={opp.official_application_portal} opportunityId={opp.id}>
                  Go to application portal
                </OfficialLink>
              )}
            </div>
            <p className="text-xs text-[var(--color-muted)] pt-1 font-medium">
              Details can change. Always confirm on the official website before applying — Passage is a planning tool, not the source of truth.
            </p>
            <div className="pt-2 border-t border-[var(--color-line)] mt-2">
              <ReportIssueButton opportunityId={opp.id} isLoggedIn={Boolean(user)} />
            </div>
          </div>
        </Section>
      </RevealSection>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  glossaryTerm,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  glossaryTerm?: string;
}) {
  const content = (
    <p className={`text-sm font-medium capitalize ${highlight ? "text-[var(--color-brass)]" : ""}`}>{value}</p>
  );
  return (
    <div className="rounded-sm border border-[var(--color-line)] bg-white px-4 py-3">
      <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-1">{label}</p>
      {glossaryTerm ? <GlossaryTerm term={glossaryTerm}>{content}</GlossaryTerm> : content}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 pb-10 border-b border-[var(--color-line)] last:border-b-0">
      <h2 className="font-serif text-xl mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-4">
      <dt className="w-40 shrink-0 text-[var(--color-muted)]">{label}</dt>
      <dd className="text-[var(--color-ink-soft)]">{value}</dd>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-[var(--color-paper-dim)] px-2 py-1 text-xs">
      {children}
    </span>
  );
}
