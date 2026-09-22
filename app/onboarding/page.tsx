"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { createClient } from "@/lib/supabase/client";

const DEGREE_OPTIONS = ["Bachelor's", "Master's", "PhD", "Fellowship", "Research opportunity", "Exchange"];
const COUNTRY_OPTIONS = ["UK", "USA", "Germany", "Canada", "Netherlands", "Finland", "Sweden", "Other"];
const FUNDING_OPTIONS = [
  { value: "fully_funded", label: "Fully funded" },
  { value: "partially_funded", label: "Partially funded" },
  { value: "any", label: "Any" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [targetDegree, setTargetDegree] = useState<string>("");
  const [countries, setCountries] = useState<string[]>([]);
  const [funding, setFunding] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const stepBodyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!stepBodyRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    gsap.fromTo(
      stepBodyRef.current,
      { opacity: 0, x: 14 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [step]);

  function toggleCountry(c: string) {
    setCountries((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function finish() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          target_degree: targetDegree || null,
          preferred_countries: countries,
          funding_preference: funding || null,
          onboarding_completed: true,
        })
        .eq("id", user.id);
    }
    setSaving(false);
    router.push("/dashboard");
    router.refresh();
  }

  const steps = [
    {
      title: "What are you looking for?",
      body: (
        <div className="grid grid-cols-2 gap-2">
          {DEGREE_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setTargetDegree(d)}
              className={`rounded-sm border px-4 py-3 text-sm text-left transition-all active:scale-[0.97] ${
                targetDegree === d
                  ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                  : "border-[var(--color-line)] hover:border-[var(--color-ink-soft)]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Where are you interested in?",
      body: (
        <div className="grid grid-cols-2 gap-2">
          {COUNTRY_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => toggleCountry(c)}
              className={`rounded-sm border px-4 py-3 text-sm text-left transition-all active:scale-[0.97] ${
                countries.includes(c)
                  ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                  : "border-[var(--color-line)] hover:border-[var(--color-ink-soft)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Funding preference?",
      body: (
        <div className="grid gap-2">
          {FUNDING_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFunding(f.value)}
              className={`rounded-sm border px-4 py-3 text-sm text-left transition-all active:scale-[0.97] ${
                funding === f.value
                  ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
                  : "border-[var(--color-line)] hover:border-[var(--color-ink-soft)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-[var(--color-brass)]" : "bg-[var(--color-line)]"
              }`}
            />
          ))}
        </div>

        <div ref={stepBodyRef}>
          <h1 className="font-serif text-2xl mb-6">{steps[step].title}</h1>
          {steps[step].body}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={finish}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Skip for now
          </button>
          <button
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            disabled={saving}
            className="rounded-sm bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-soft)] disabled:opacity-60"
          >
            {saving ? "Saving…" : isLast ? "Finish" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
