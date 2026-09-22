"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function ReadinessBar({
  requirementsTotal,
  requirementsDone,
  tasksTotal,
  tasksDone,
}: {
  requirementsTotal: number;
  requirementsDone: number;
  tasksTotal: number;
  tasksDone: number;
}) {
  const reqPct = requirementsTotal === 0 ? 0 : Math.round((requirementsDone / requirementsTotal) * 100);
  const taskPct = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);
  const overall =
    requirementsTotal + tasksTotal === 0
      ? 0
      : Math.round(((requirementsDone + tasksDone) / (requirementsTotal + tasksTotal)) * 100);

  const circleRef = useRef<SVGCircleElement>(null);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!circleRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offset = circumference - (overall / 100) * circumference;

    if (prefersReducedMotion) {
      gsap.set(circleRef.current, { strokeDashoffset: offset });
      return;
    }

    gsap.set(circleRef.current, { strokeDashoffset: circumference });
    gsap.to(circleRef.current, {
      strokeDashoffset: offset,
      duration: 1,
      ease: "power2.out",
      delay: 0.2,
    });
  }, [overall, circumference]);

  return (
    <div className="rounded-sm border border-[var(--color-line)] bg-white p-5 flex items-center gap-6">
      <div className="relative shrink-0 size-[72px]">
        <svg viewBox="0 0 72 72" className="size-full -rotate-90">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--color-paper-dim)" strokeWidth="6" />
          <circle
            ref={circleRef}
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--color-brass)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-serif text-lg">
          {overall}%
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-2">Application readiness</p>
        <div className="grid grid-cols-2 gap-4 text-xs text-[var(--color-muted)]">
          <span>
            Requirements: {requirementsDone}/{requirementsTotal} ({reqPct}%)
          </span>
          <span>
            Tasks: {tasksDone}/{tasksTotal} ({taskPct}%)
          </span>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-2">
          This tracks your progress, not your odds of admission or a scholarship award.
        </p>
      </div>
    </div>
  );
}
