"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side visibility into what broke, without exposing internals
    // to the person looking at the page.
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
      <div className="max-w-sm text-center">
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-[var(--color-urgent-soft)] text-[var(--color-urgent)] mb-5">
          <AlertTriangle size={22} strokeWidth={2} />
        </div>
        <h1 className="font-serif text-2xl mb-2">Something went wrong</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8 leading-relaxed">
          That&apos;s on us, not you. Your data is safe — nothing you&apos;ve
          saved was affected. Try again, or head back to your dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-sm bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-soft)] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-sm border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-paper-dim)] transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-[var(--color-muted)] mt-6">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
