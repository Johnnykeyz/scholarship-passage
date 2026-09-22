"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import type { AnalyticsEventType } from "@/lib/types/database";

/**
 * Drop this anywhere in a page tree to log a view event once on mount.
 * Renders nothing. Uses a ref guard so React StrictMode's double-invoke
 * in development doesn't double-log.
 */
export function PageViewTracker({
  eventType = "page_view",
  opportunityId,
  metadata,
}: {
  eventType?: AnalyticsEventType;
  opportunityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(eventType, { opportunityId, metadata });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
