"use client";

import { ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/**
 * An outbound link to an opportunity's official site/portal that logs a
 * click event before navigating. Also the one place styling this specific
 * link type — used across the detail page, dashboard, and anywhere else
 * that points someone at an official source.
 */
export function OfficialLink({
  href,
  opportunityId,
  children,
  className,
  variant = "inline",
}: {
  href: string;
  opportunityId?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "inline" | "button";
}) {
  const base =
    variant === "button"
      ? "inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-soft)] transition-colors"
      : "inline-flex items-center gap-1.5 text-[var(--color-brass)] font-medium hover:underline";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("opportunity_official_link_click", { opportunityId, metadata: { href } })}
      className={className ?? base}
    >
      {children}
      <ExternalLink size={14} />
    </a>
  );
}
