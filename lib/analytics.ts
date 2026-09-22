"use client";

import { createClient } from "@/lib/supabase/client";
import type { AnalyticsEventType } from "@/lib/types/database";

/**
 * Fire-and-forget analytics event logger. Never awaited by callers, never
 * throws into the UI — a failed analytics write should never break the
 * person's actual task. Captures the minimum needed to power the admin
 * analytics dashboard (page views, opportunity views, outbound official-
 * link clicks, track actions, searches, signups/logins).
 */
export function trackEvent(
  eventType: AnalyticsEventType,
  options: { opportunityId?: string; path?: string; metadata?: Record<string, unknown> } = {}
) {
  try {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase
        .from("analytics_events")
        .insert({
          event_type: eventType,
          user_id: user?.id ?? null,
          opportunity_id: options.opportunityId ?? null,
          path: options.path ?? (typeof window !== "undefined" ? window.location.pathname : null),
          metadata: options.metadata ?? {},
        })
        .then(() => {
          // no-op: fire and forget
        });
    });
  } catch {
    // Analytics must never break the app. Swallow silently.
  }
}
