"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function StalenessCheckButton() {
  const router = useRouter();
  const supabase = createClient();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    const { data, error } = await supabase.rpc("flag_stale_opportunities", { p_threshold_days: 60 });
    setRunning(false);
    if (error) {
      setResult(`Couldn't run: ${error.message}`);
      return;
    }
    setResult(data === 0 ? "No stale opportunities found." : `Flagged ${data} opportunit${data === 1 ? "y" : "ies"} for re-verification.`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRun}
        disabled={running}
        className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-[var(--color-line)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)] transition-colors active:scale-[0.98] disabled:opacity-60"
        title="Downgrades trust level for opportunities not verified in 60+ days. Runs automatically if pg_cron is enabled on your Supabase project."
      >
        <RefreshCw size={14} className={running ? "animate-spin" : ""} />
        {running ? "Checking…" : "Run staleness check"}
      </button>
      {result && <span className="text-xs text-[var(--color-muted)]">{result}</span>}
    </div>
  );
}
