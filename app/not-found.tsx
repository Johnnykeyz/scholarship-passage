import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
      <div className="max-w-sm text-center">
        <p className="font-serif text-5xl text-[var(--color-line)] mb-4">404</p>
        <h1 className="font-serif text-2xl mb-2">Page not found</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist, or may have
          moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-sm bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-soft)] transition-colors"
          >
            Go to dashboard
          </Link>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-paper-dim)] transition-colors"
          >
            <Compass size={15} />
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
