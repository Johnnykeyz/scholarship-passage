import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RevealSection } from "@/components/RevealSection";
import { createClient } from "@/lib/supabase/server";
import { formatDeadline } from "@/lib/deadlines";
import { ComparisonPicker } from "./ComparisonPicker";
import type { Application, Opportunity } from "@/lib/types/database";

function row(label: string, values: (string | number | null)[]) {
  if (values.every((v) => v === null || v === "")) return null;
  return { label, values };
}

export default async function CompareApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
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

  const selectedIds = ids ? ids.split(",").filter(Boolean) : [];
  const selected = apps.filter((a) => selectedIds.includes(a.id));

  return (
    <AppShell>
      <RevealSection className="px-6 py-8 md:px-10 md:py-10 max-w-5xl">
        <Link href="/applications" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] mb-6">
          <ArrowLeft size={15} />
          All applications
        </Link>

        <h1 className="font-serif text-3xl mb-1">Compare applications</h1>
        <p className="text-[var(--color-muted)] mb-8">
          Pick two or more applications to see them side by side. This is a
          factual comparison of what&apos;s on file — always confirm current
          details on each opportunity&apos;s official page.
        </p>

        {selected.length < 2 ? (
          <ComparisonPicker applications={apps} preselected={selectedIds} />
        ) : (
          <>
            <div className="mb-6">
              <Link href="/applications/compare" className="text-sm text-[var(--color-brass)] hover:underline">
                Change selection
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide py-2 pr-4 w-32">
                      &nbsp;
                    </th>
                    {selected.map((a) => (
                      <th key={a.id} className="text-left py-2 px-4 border-b border-[var(--color-line)] min-w-[200px]">
                        <Link href={`/applications/${a.id}`} className="font-serif text-base hover:underline">
                          {a.opportunity.name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    row("Country", selected.map((a) => a.opportunity.country)),
                    row("Degree level", selected.map((a) => a.opportunity.degree_level)),
                    row("Funding type", selected.map((a) => a.opportunity.funding_type?.replace(/_/g, " ") ?? null)),
                    row("Duration", selected.map((a) => a.opportunity.duration)),
                    row("Deadline", selected.map((a) => formatDeadline(a.opportunity.application_deadline))),
                    row("Application fee", selected.map((a) => a.opportunity.application_fee)),
                    row("Language requirement", selected.map((a) => a.opportunity.language_requirements)),
                    row("Work experience", selected.map((a) => a.opportunity.work_experience_requirements)),
                    row("Your status", selected.map((a) => a.status.replace(/_/g, " "))),
                  ]
                    .filter((r): r is { label: string; values: (string | number | null)[] } => r !== null)
                    .map((r) => (
                      <tr key={r.label} className="border-b border-[var(--color-line)]">
                        <td className="text-xs font-medium text-[var(--color-muted)] py-3 pr-4 align-top">{r.label}</td>
                        {r.values.map((v, i) => (
                          <td key={i} className="text-sm py-3 px-4 align-top capitalize">
                            {v ?? <span className="text-[var(--color-muted)] normal-case">Not specified</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-6">
              Details shown here were last verified on the dates noted on each
              opportunity&apos;s own page — check there for anything that might
              have changed since.
            </p>
          </>
        )}
      </RevealSection>
    </AppShell>
  );
}
