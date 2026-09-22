import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

const CONFIG: Record<string, { label: string; icon: typeof ShieldCheck; className: string }> = {
  officially_verified: {
    label: "Officially verified",
    icon: ShieldCheck,
    className: "text-[var(--color-verified)]",
  },
  needs_verification: {
    label: "Needs verification",
    icon: ShieldQuestion,
    className: "text-[var(--color-brass)]",
  },
  user_reported: {
    label: "User reported",
    icon: ShieldAlert,
    className: "text-[var(--color-urgent)]",
  },
};

export function TrustIndicator({ level }: { level: string }) {
  const config = CONFIG[level] ?? CONFIG.needs_verification;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.className}`}>
      <Icon size={14} strokeWidth={2} />
      {config.label}
    </span>
  );
}
