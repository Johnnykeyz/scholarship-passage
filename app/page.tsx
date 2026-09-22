"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ArrowUpRight, Compass, ClipboardCheck, FolderKanban, BellRing } from "lucide-react";
import { RouteMap } from "@/components/visuals/RouteMap";
import { DocumentStack } from "@/components/visuals/DocumentStack";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

const JOURNEY = [
  { step: "Discover", detail: "Search scholarships, university programs, fellowships and research positions worldwide.", icon: Compass },
  { step: "Check eligibility", detail: "See where you stand against real requirements — not a guess.", icon: ClipboardCheck },
  { step: "Prepare", detail: "Every application gets its own requirements checklist, tasks, and deadlines.", icon: FolderKanban },
  { step: "Track", detail: "Follow each application from preparing to decision, in one place.", icon: BellRing },
];

const STATS = [
  { value: "Chevening", label: "UK — fully funded master's" },
  { value: "Commonwealth", label: "UK — fully funded PhD" },
  { value: "DAAD EPOS", label: "Germany — development-related master's" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const journeyRef = useScrollReveal<HTMLDivElement>();
  const statsRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!heroRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 10, duration: 0.5 })
        .from(".hero-title-line", { opacity: 0, y: 28, duration: 0.7, stagger: 0.08 }, "-=0.25")
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.6 }, "-=0.35")
        .from(".hero-cta", { opacity: 0, y: 12, duration: 0.5, stagger: 0.08 }, "-=0.3");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex-1 bg-[var(--color-paper)] overflow-x-hidden">
      <header className="border-b border-[var(--color-line)] sticky top-0 bg-[var(--color-paper)]/90 backdrop-blur z-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <span className="font-serif text-lg font-semibold tracking-tight">Passage</span>
          <nav className="flex items-center gap-3 sm:gap-6 text-sm">
            <Link
              href="/opportunities"
              className="hidden sm:inline text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            >
              Explore opportunities
            </Link>
            <Link
              href="/countries"
              className="hidden sm:inline text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            >
              Countries
            </Link>
            <Link href="/login" className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-sm bg-[var(--color-ink)] px-3.5 sm:px-4 py-2 text-white hover:bg-[var(--color-ink-soft)] transition-colors"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <section
        ref={heroRef}
        className="relative mx-auto max-w-6xl px-5 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-16 border-b border-[var(--color-line)] grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-8 items-center"
      >
        <div>
          <p className="hero-eyebrow text-sm font-medium text-[var(--color-brass)] mb-4">
            Scholarships · University programs · Research opportunities
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl leading-[1.08] max-w-3xl">
            <span className="hero-title-line block">Your journey to</span>
            <span className="hero-title-line block">global education,</span>
            <span className="hero-title-line block">organized.</span>
          </h1>
          <p className="hero-sub mt-6 max-w-xl text-base sm:text-lg text-[var(--color-ink-soft)] leading-relaxed">
            Discover fully funded scholarships, university programs and research
            opportunities. See what each one requires, what you already have, and
            what to work on next — without another spreadsheet.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/opportunities"
              className="hero-cta inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-brass)] px-5 py-3 text-white font-medium hover:bg-[#94430a] transition-colors active:scale-[0.98]"
            >
              Explore opportunities
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/signup"
              className="hero-cta inline-flex items-center gap-1.5 rounded-sm border border-[var(--color-ink)] px-5 py-3 font-medium hover:bg-[var(--color-paper-dim)] transition-colors active:scale-[0.98]"
            >
              Start your application plan
            </Link>
          </div>
        </div>

        <div className="relative h-56 sm:h-72 lg:h-80 rounded-sm border border-[var(--color-line)] bg-white overflow-hidden">
          <RouteMap />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] sm:text-xs text-[var(--color-muted)] font-medium">
            <span>8 cities</span>
            <span>Your applications, mapped</span>
          </div>
        </div>
      </section>

      <section ref={journeyRef} className="mx-auto max-w-6xl px-5 sm:px-6 py-14 sm:py-16 border-b border-[var(--color-line)]">
        <h2 data-reveal className="font-serif text-2xl sm:text-3xl mb-10">
          From &ldquo;where do I start&rdquo; to submitted.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {JOURNEY.map((item, i) => (
            <div key={item.step} data-reveal className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center size-9 rounded-sm bg-[var(--color-brass-soft)] text-[var(--color-brass)]">
                  <item.icon size={17} strokeWidth={2} />
                </span>
                <span className="font-serif text-xl text-[var(--color-line)] leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h3 className="font-medium mb-1">{item.step}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-6 py-14 sm:py-16 border-b border-[var(--color-line)] grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl mb-4">
            Every requirement, official or yours, in one checklist.
          </h2>
          <p className="text-[var(--color-muted)] leading-relaxed max-w-md">
            Found a requirement the platform doesn&apos;t know about — a portfolio,
            a recommendation the department asked for specifically? Add it
            yourself. It becomes part of your personal application plan,
            right next to the official requirements.
          </p>
        </div>
        <DocumentStack />
      </section>

      <section ref={statsRef} className="mx-auto max-w-6xl px-5 sm:px-6 py-14 sm:py-16 border-b border-[var(--color-line)]">
        <p data-reveal className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wide mb-6">
          Real opportunities, verified sources
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.value} data-reveal className="rounded-sm border border-[var(--color-line)] bg-white p-5">
              <p className="font-serif text-xl mb-1">{s.value}</p>
              <p className="text-sm text-[var(--color-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={ctaRef} className="mx-auto max-w-6xl px-5 sm:px-6 py-14 sm:py-16">
        <div data-reveal className="rounded-sm border border-[var(--color-line)] bg-white p-7 sm:p-12">
          <p className="font-serif text-xl sm:text-2xl leading-snug max-w-2xl">
            Not &ldquo;here are 500 scholarships.&rdquo; Here are the opportunities relevant
            to you, what each one requires, what you already have, and what
            you&apos;re missing.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-1.5 text-[var(--color-brass)] font-medium hover:underline"
          >
            Create your profile
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--color-line)] py-8">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 text-sm text-[var(--color-muted)]">
          Opportunity information is sourced from official channels where
          possible and marked with a last-verified date. Always confirm
          details on the official website before applying.
        </div>
      </footer>
    </div>
  );
}
