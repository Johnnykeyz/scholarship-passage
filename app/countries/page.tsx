import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RevealSection } from "@/components/RevealSection";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDeadline } from "@/lib/deadlines";
import type { Opportunity } from "@/lib/types/database";

export default async function CountriesPage() {
  const supabase = await createClient();
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .neq("status", "archived")
    .order("country");

  const list = (opportunities ?? []) as Opportunity[];

  const byCountry = new Map<string, Opportunity[]>();
  for (const opp of list) {
    const existing = byCountry.get(opp.country) ?? [];
    existing.push(opp);
    byCountry.set(opp.country, existing);
  }

  const countries = Array.from(byCountry.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex-1 bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-semibold">
            Passage
          </Link>
          <Link
            href="/opportunities"
            className="rounded-sm bg-[var(--color-ink)] px-4 py-2 text-sm text-white hover:bg-[var(--color-ink-soft)] transition-colors"
          >
            Explore all opportunities
          </Link>
        </div>
      </header>

      <RevealSection className="mx-auto max-w-5xl px-5 sm:px-6 py-8 sm:py-10">
        <h1 className="font-serif text-3xl mb-1">Countries</h1>
        <p className="text-[var(--color-muted)] max-w-2xl mb-3">
          Every country with a live opportunity in the catalog, grouped for
          browsing.
        </p>
        <p className="text-xs text-[var(--color-muted)] bg-[var(--color-paper-dim)] inline-block rounded-sm px-3 py-2 mb-8">
          This page only reflects opportunities actually in the catalog —
          it isn&apos;t an editorial guide to visas, application processes,
          or living costs. For that kind of country-specific guidance,
          consult each country&apos;s official immigration and education
          authority.
        </p>

        <div className="space-y-8">
          {countries.map(([country, opps]) => (
            <div key={country}>
              <h2 className="font-serif text-xl mb-3">{country}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {opps.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="rounded-sm border border-[var(--color-line)] bg-white p-4 hover:border-[var(--color-brass)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-sm font-medium leading-snug">{opp.name}</p>
                      <span className="shrink-0">
                        <StatusBadge status={opp.status} />
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-muted)]">
                      Deadline: {formatDeadline(opp.application_deadline)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </RevealSection>
    </div>
  );
}
