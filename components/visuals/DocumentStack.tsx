"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const DOCS = [
  { label: "Transcript", status: "verified" },
  { label: "SOP draft", status: "in_progress" },
  { label: "Passport", status: "ready" },
  { label: "Recommendation", status: "not_started" },
];

const STATUS_DOT: Record<string, string> = {
  verified: "var(--color-verified)",
  ready: "var(--color-verified)",
  in_progress: "var(--color-brass)",
  not_started: "#cbd5e1",
};

export function DocumentStack() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = ref.current.querySelectorAll<HTMLElement>(".doc-card");

    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0, rotate: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 40, rotate: (i) => (i % 2 === 0 ? -3 : 3) });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        rotate: (i: number) => (i % 2 === 0 ? -2 : 2),
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.15,
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative h-64 flex items-center justify-center">
      {DOCS.map((doc, i) => (
        <div
          key={doc.label}
          className="doc-card absolute w-44 rounded-sm border border-[var(--color-line)] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)] px-4 py-3"
          style={{
            transform: `translateX(${(i - 1.5) * 34}px) translateY(${i % 2 === 0 ? -6 : 6}px)`,
            zIndex: i,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ background: STATUS_DOT[doc.status] }}
            />
            <span className="text-xs font-medium truncate">{doc.label}</span>
          </div>
          <div className="mt-2.5 space-y-1">
            <div className="h-1 rounded-full bg-[var(--color-paper-dim)] w-full" />
            <div className="h-1 rounded-full bg-[var(--color-paper-dim)] w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
