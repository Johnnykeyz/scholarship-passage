export type DeadlinePhase = "planning" | "preparing" | "active" | "urgent" | "critical" | "closed";

export function daysRemaining(deadline: string | null): number | null {
  if (!deadline) return null;
  const ms = new Date(deadline + "T23:59:59").getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function daysSince(date: string): number {
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function deadlinePhase(daysLeft: number | null): DeadlinePhase {
  if (daysLeft === null) return "planning";
  if (daysLeft < 0) return "closed";
  if (daysLeft <= 14) return "critical";
  if (daysLeft <= 29) return "urgent";
  if (daysLeft <= 59) return "active";
  if (daysLeft <= 89) return "preparing";
  return "planning";
}

export const PHASE_LABEL: Record<DeadlinePhase, string> = {
  planning: "Planning",
  preparing: "Preparing",
  active: "Active",
  urgent: "Urgent",
  critical: "Critical",
  closed: "Closed",
};

export const PHASE_STYLE: Record<DeadlinePhase, string> = {
  planning: "text-[var(--color-muted)]",
  preparing: "text-[var(--color-muted)]",
  active: "text-[var(--color-ink)]",
  urgent: "text-[var(--color-brass)]",
  critical: "text-[var(--color-urgent)]",
  closed: "text-slate-400",
};

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return "No deadline set";
  return new Date(deadline + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
