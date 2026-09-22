export default function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[var(--color-paper)] px-6 py-16" aria-busy="true" aria-live="polite">
      <div className="flex flex-col items-center text-center">
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-white shadow-sm">
          <span className="size-7 animate-spin rounded-full border-[3px] border-[var(--color-brass-soft)] border-t-[var(--color-brass)]" aria-hidden="true" />
        </span>
        <p className="font-serif text-xl text-[var(--color-ink)]">Preparing your Passage</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Loading your workspace…</p>
      </div>
    </main>
  );
}
