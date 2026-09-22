import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { daysRemaining, daysSince, deadlinePhase, formatDeadline, PHASE_LABEL, PHASE_STYLE } from "./deadlines";

describe("daysRemaining", () => {
  beforeEach(() => {
    // Fix "now" so day-math is deterministic regardless of when tests run.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when there is no deadline", () => {
    expect(daysRemaining(null)).toBeNull();
  });

  it("returns a positive count for a future deadline", () => {
    expect(daysRemaining("2026-10-06")).toBe(17);
  });

  it("returns 0 for a deadline that is today", () => {
    expect(daysRemaining("2026-09-20")).toBe(1);
  });

  it("returns a negative count for a deadline that has already passed", () => {
    expect(daysRemaining("2026-09-01")).toBeLessThan(0);
  });
});

describe("daysSince", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for a date verified today", () => {
    expect(daysSince("2026-09-20")).toBe(0);
  });

  it("returns a positive count for a past date", () => {
    // admin dashboard flags opportunities unverified for 60+ days off this
    expect(daysSince("2026-07-01")).toBeGreaterThan(60);
  });
});

describe("deadlinePhase", () => {
  it("classifies no deadline as planning", () => {
    expect(deadlinePhase(null)).toBe("planning");
  });

  it("classifies a passed deadline as closed", () => {
    expect(deadlinePhase(-1)).toBe("closed");
  });

  it("classifies the boundary and interior of each phase correctly", () => {
    // These thresholds are the exact contract other components (dashboard
    // urgency coloring, admin warnings) rely on — a regression here would
    // silently mislabel how urgent a deadline looks to a real applicant.
    expect(deadlinePhase(0)).toBe("critical");
    expect(deadlinePhase(14)).toBe("critical");
    expect(deadlinePhase(15)).toBe("urgent");
    expect(deadlinePhase(29)).toBe("urgent");
    expect(deadlinePhase(30)).toBe("active");
    expect(deadlinePhase(59)).toBe("active");
    expect(deadlinePhase(60)).toBe("preparing");
    expect(deadlinePhase(89)).toBe("preparing");
    expect(deadlinePhase(90)).toBe("planning");
  });

  it("has a label and a style for every possible phase", () => {
    const phases = ["planning", "preparing", "active", "urgent", "critical", "closed"] as const;
    for (const phase of phases) {
      expect(PHASE_LABEL[phase]).toBeTruthy();
      expect(PHASE_STYLE[phase]).toBeTruthy();
    }
  });
});

describe("formatDeadline", () => {
  it("returns a fallback string when there is no deadline", () => {
    expect(formatDeadline(null)).toBe("No deadline set");
  });

  it("formats a date as day, full month, year", () => {
    expect(formatDeadline("2026-10-06")).toBe("6 October 2026");
  });

  it("does not shift the date across a UTC day boundary", () => {
    // Regression guard: naive `new Date("2026-01-01")` parsing (without a
    // time component) can render as 31 December in negative-UTC-offset
    // timezones. formatDeadline pins the time to local midnight to avoid
    // showing an opportunity's deadline as a day earlier than it really is.
    expect(formatDeadline("2026-01-01")).toBe("1 January 2026");
  });
});
