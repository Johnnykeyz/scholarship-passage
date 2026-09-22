const STATUS_STYLES: Record<string, string> = {
  open: "bg-[var(--color-verified-soft)] text-[var(--color-verified)]",
  closing_soon: "bg-[var(--color-urgent-soft)] text-[var(--color-urgent)]",
  upcoming: "bg-[var(--color-brass-soft)] text-[var(--color-brass)]",
  expected: "bg-[var(--color-brass-soft)] text-[var(--color-brass)]",
  closed: "bg-slate-100 text-slate-500",
  archived: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  closing_soon: "Closing soon",
  upcoming: "Upcoming",
  expected: "Expected",
  closed: "Closed",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
