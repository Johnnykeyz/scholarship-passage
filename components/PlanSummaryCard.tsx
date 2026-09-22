import Link from "next/link";
import { Target, Pencil } from "lucide-react";
import type { Profile } from "@/lib/types/database";

export function PlanSummaryCard({ profile }: { profile: Profile | null }) {
  const hasPlan = Boolean(
    profile?.target_degree || profile?.target_intake || profile?.planning_notes || profile?.preferred_countries?.length
  );

  if (!hasPlan) {
    return (
      <Link
        href="/planning"
        className="mb-10 flex items-center justify-between gap-3 rounded-sm border border-dashed border-[var(--color-line)] bg-white px-4 py-3.5 hover:border-[var(--color-brass)] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Target size={16} className="text-[var(--color-brass)] shrink-0" />
          <p className="text-sm">
            <span className="font-medium">Set your plan</span>{" "}
            <span className="text-[var(--color-muted)]">— tell us what you&apos;re preparing for</span>
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/planning"
      className="mb-10 block rounded-sm border border-[var(--color-line)] bg-white px-4 py-3.5 hover:border-[var(--color-brass)] transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <Target size={16} className="text-[var(--color-brass)] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {profile?.target_degree || "Preparing"}
              {profile?.target_intake ? ` · ${profile.target_intake}` : ""}
            </p>
            {profile?.preferred_countries && profile.preferred_countries.length > 0 && (
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                {profile.preferred_countries.join(", ")}
              </p>
            )}
            {profile?.planning_notes && (
              <p className="text-xs text-[var(--color-ink-soft)] mt-1.5 line-clamp-2">{profile.planning_notes}</p>
            )}
          </div>
        </div>
        <Pencil size={13} className="text-[var(--color-muted)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      </div>
    </Link>
  );
}
