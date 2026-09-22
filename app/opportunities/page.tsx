import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { TrustIndicator } from "@/components/TrustIndicator";
import { RevealSection } from "@/components/RevealSection";
import { formatDeadline } from "@/lib/deadlines";
import type { Opportunity } from "@/lib/types/database";

const TYPE_LABELS: Record<string, string> = {
  scholarship: "Scholarship",
  university_program: "University Program",
  research_position: "Research Position",
  fellowship: "Fellowship",
  assistantship: "Assistantship",
  grant: "Grant",
  exchange_program: "Exchange Program",
};

const DEGREE_LABELS: Record<string, string> = {
  bachelors: "Bachelor's",
  masters: "Master's",
  phd: "PhD",
  postgraduate: "Postgraduate",
  fellowship: "Fellowship",
};

function label(value: string, dict: Record<string, string>) {
  return dict[value] ?? value.replace(/_/g, " ");
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; degree?: string; funding?: string; type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Pull the full catalog once to both derive filter option lists (so they
  // never go stale as opportunities are added/removed) and apply filters
  // client-side-free, in a single round trip.
  const { data: allOpportunities } = await supabase
    .from("opportunities")
    .select("*")
    .order("application_deadline", { ascending: true, nullsFirst: false });

  const all = (allOpportunities ?? []) as Opportunity[];

  const countries = Array.from(new Set(all.map((o) => o.country))).sort();
  const degrees = Array.from(new Set(all.map((o) => o.degree_level).filter(Boolean))) as string[];
  const fundingTypes = Array.from(new Set(all.map((o) => o.funding_type).filter(Boolean))) as string[];
  const types = Array.from(new Set(all.map((o) => o.type))).sort();

  const list = all.filter((o) => {
    if (params.country && o.country !== params.country) return false;
    if (params.degree && o.degree_level !== params.degree) return false;
    if (params.funding && o.funding_type !== params.funding) return false;
    if (params.type && o.type !== params.type) return false;
    if (params.q && !o.name.toLowerCase().includes(params.q.toLowerCase())) return false;
    return true;
  });

  // Log a search event whenever any filter/query is present — fire and
  // forget, never blocks rendering. Only meaningful searches are logged,
  // not the bare "browse all" page load (that's a page_view, not a search).
  const hasActiveSearch = Boolean(params.q || params.country || params.degree || params.funding || params.type);
  if (hasActiveSearch) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    supabase
      .from("analytics_events")
      .insert({
        event_type: "search_performed",
        user_id: user?.id ?? null,
        path: "/opportunities",
        metadata: { ...params, result_count: list.length },
      })
      .then(() => {});
  }

  return (
    <div className="flex-1 bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-semibold">
            Passage
          </Link>
          <Link
            href="/dashboard"
            className="rounded-sm bg-[var(--color-ink)] px-4 py-2 text-sm text-white hover:bg-[var(--color-ink-soft)] transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <RevealSection className="mx-auto max-w-5xl px-5 sm:px-6 py-8 sm:py-10">
        <h1 className="font-serif text-3xl mb-1">Explore opportunities</h1>
        <p className="text-[var(--color-muted)] mb-8">
          {list.length} of {all.length} opportunit{all.length === 1 ? "y" : "ies"} shown
        </p>

        <form className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 mb-8" action="/opportunities">
          <input
            type="text"
            name="q"
            placeholder="Search by name…"
            defaultValue={params.q}
            className="col-span-2 sm:flex-1 sm:min-w-[180px] rounded-sm border border-[var(--color-line)] bg-white px-3 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          />
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className="rounded-sm border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {label(t, TYPE_LABELS)}
              </option>
            ))}
          </select>
          <select
            name="country"
            defaultValue={params.country ?? ""}
            className="rounded-sm border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            name="degree"
            defaultValue={params.degree ?? ""}
            className="rounded-sm border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">All degrees</option>
            {degrees.map((d) => (
              <option key={d} value={d}>
                {label(d, DEGREE_LABELS)}
              </option>
            ))}
          </select>
          <select
            name="funding"
            defaultValue={params.funding ?? ""}
            className="rounded-sm border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
          >
            <option value="">Any funding</option>
            {fundingTypes.map((f) => (
              <option key={f} value={f}>
                {label(f, {})}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-span-2 sm:col-auto rounded-sm bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-soft)] transition-colors active:scale-[0.98]"
          >
            Filter
          </button>
        </form>

        {list.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] py-12 text-center">
            No opportunities match those filters yet.
          </p>
        ) : (
          <div className="space-y-3">
            {list.map((opp) => (
              <Link
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="block rounded-sm border border-[var(--color-line)] bg-white p-4 sm:p-5 hover:border-[var(--color-brass)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--color-brass)] mb-1">
                      {label(opp.type, TYPE_LABELS)} · {opp.country}
                    </p>
                    <h2 className="font-serif text-lg leading-snug">{opp.name}</h2>
                    <p className="text-sm text-[var(--color-muted)] mt-1">
                      {opp.provider}
                    </p>
                  </div>
                  <span className="shrink-0">
                    <StatusBadge status={opp.status} />
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 text-sm text-[var(--color-ink-soft)]">
                  <span className="capitalize">{opp.funding_type?.replace(/_/g, " ")}</span>
                  <span className="text-[var(--color-line)]">·</span>
                  <span>Deadline: {formatDeadline(opp.application_deadline)}</span>
                  <span className="text-[var(--color-line)] hidden sm:inline">·</span>
                  <TrustIndicator level={opp.trust_level} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </RevealSection>
    </div>
  );
}
