"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

export function TrackButton({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTrack() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc("start_application", {
      p_opportunity_id: opportunityId,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    trackEvent("opportunity_tracked", { opportunityId });
    router.push(`/applications/${data}`);
  }

  return (
    <div>
      <button
        onClick={handleTrack}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-brass)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#94430a] disabled:opacity-60"
      >
        {loading ? "Creating application…" : "Track this opportunity"}
      </button>
      {error && <p className="text-sm text-[var(--color-urgent)] mt-2">{error}</p>}
    </div>
  );
}
