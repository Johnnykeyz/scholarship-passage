"use client";

import { Check, AlertTriangle, HelpCircle } from "lucide-react";
import type { Opportunity, Profile } from "@/lib/types/database";

export type CheckStatus = "meets" | "unknown" | "needs_verification";

export interface CheckItem {
  label: string;
  status: CheckStatus;
  explanation: string;
}

export function evaluate(opp: Opportunity, profile: Profile | null): CheckItem[] {
  const items: CheckItem[] = [];

  // Degree level
  if (opp.degree_level) {
    if (profile?.target_degree) {
      const matches = profile.target_degree.toLowerCase().includes(opp.degree_level.slice(0, 4));
      items.push({
        label: "Degree level",
        status: matches ? "meets" : "needs_verification",
        explanation: matches
          ? `Your target degree matches this opportunity's ${opp.degree_level} level.`
          : `This opportunity is for ${opp.degree_level}, but your profile lists a different target degree — double check it fits.`,
      });
    } else {
      items.push({
        label: "Degree level",
        status: "unknown",
        explanation: "Add your target degree to your profile to check this automatically.",
      });
    }
  }

  // CGPA — only if the opportunity states a summary mentioning academic standard
  if (profile?.cgpa != null) {
    items.push({
      label: "Academic standing",
      status: "needs_verification",
      explanation: `Your profile lists a CGPA of ${profile.cgpa}/${profile.cgpa_scale ?? 5}. This opportunity doesn't publish a strict minimum — check the eligibility summary above for the exact academic bar.`,
    });
  } else {
    items.push({
      label: "Academic standing",
      status: "unknown",
      explanation: "Add your CGPA to your profile for a more useful check here.",
    });
  }

  // Work experience — text-based, can't be verified numerically without structured profile data
  if (opp.work_experience_requirements) {
    items.push({
      label: "Work experience",
      status: "needs_verification",
      explanation: `This opportunity requires: "${opp.work_experience_requirements}". Confirm your experience meets this against the official page.`,
    });
  }

  // Nationality — can't verify without asking, always flagged
  if (opp.nationality_requirements) {
    items.push({
      label: "Nationality",
      status: "needs_verification",
      explanation: `Stated requirement: "${opp.nationality_requirements}". Confirm your country of citizenship qualifies.`,
    });
  }

  return items;
}

const STATUS_CONFIG: Record<CheckStatus, { icon: typeof Check; className: string; label: string }> = {
  meets: { icon: Check, className: "text-[var(--color-verified)]", label: "Likely meets" },
  needs_verification: { icon: AlertTriangle, className: "text-[var(--color-brass)]", label: "Needs verification" },
  unknown: { icon: HelpCircle, className: "text-[var(--color-muted)]", label: "Unknown" },
};

export function EligibilityChecker({ opportunity, profile }: { opportunity: Opportunity; profile: Profile | null }) {
  const items = evaluate(opportunity, profile);

  return (
    <div>
      <div className="rounded-sm border border-[var(--color-line)] bg-white divide-y divide-[var(--color-line)]">
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const Icon = config.icon;
          return (
            <div key={item.label} className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.label}</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.className}`}>
                  <Icon size={14} />
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">{item.explanation}</p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[var(--color-muted)] mt-3">
        This is a profile match based on what you&apos;ve told us — not an official
        eligibility decision. The institution or scholarship provider determines
        final eligibility.
      </p>
    </div>
  );
}
