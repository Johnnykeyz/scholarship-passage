"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ArrowRight, ArrowUpRight, CheckCircle2, ClipboardCheck, Compass, FileText, FolderKanban, BellRing, ShieldCheck } from "lucide-react";
import { RouteMap } from "@/components/visuals/RouteMap";
import { DocumentStack } from "@/components/visuals/DocumentStack";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

const JOURNEY = [
  { step: "Discover", detail: "Find scholarships and global opportunities that fit your goals.", icon: Compass },
  { step: "Understand", detail: "See official requirements clearly, with sources you can trust.", icon: ClipboardCheck },
  { step: "Prepare", detail: "Turn every requirement into a practical checklist and next step.", icon: FolderKanban },
  { step: "Move forward", detail: "Keep deadlines, documents, and progress together until you submit.", icon: BellRing },
];

const TRUST_POINTS = ["Official source links", "Personal readiness tracking", "One workspace for every application"];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const journeyRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();
  useEffect(() => {
    if (!heroRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => gsap.from(".hero-item", { opacity: 0, y: 18, duration: .65, stagger: .08, ease: "power3.out" }), heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="flex-1 overflow-x-hidden bg-[var(--color-paper)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" aria-label="Passage home"><Image src="/passage.png" alt="Passage" width={132} height={38} className="h-9 w-auto object-contain" priority /></Link>
          <nav className="flex items-center gap-3 text-sm sm:gap-7">
            <Link href="/opportunities" className="hidden text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-brass)] sm:inline">Explore</Link>
            <Link href="/countries" className="hidden text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-brass)] sm:inline">Countries</Link>
            <Link href="/login" className="font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-brass)]">Log in</Link>
            <Link href="/signup" className="btn-primary px-4 py-2.5">Get started <ArrowUpRight size={15} /></Link>
          </nav>
        </div>
      </header>

      <main>
        <section ref={heroRef} className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
          <div className="hero-item relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-[var(--color-brass)]"><ShieldCheck size={14} /> Prepare with confidence</div>
            <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-[-.03em] sm:text-7xl">Your next opportunity deserves a clear plan.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">Passage helps ambitious students discover global scholarships, understand what each application needs, and make steady progress from idea to submission.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/opportunities" className="btn-primary">Explore opportunities <ArrowRight size={17} /></Link><Link href="/signup" className="btn-secondary">Build my readiness plan</Link></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[var(--color-muted)]">{TRUST_POINTS.map((point) => <span key={point} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[var(--color-verified)]" />{point}</span>)}</div>
          </div>
          <div className="hero-item relative min-h-[350px] overflow-hidden rounded-[1.5rem] border border-[var(--color-line)] bg-white p-3 shadow-[0_24px_70px_rgba(16,35,63,.12)] sm:min-h-[430px]"><div className="h-full overflow-hidden rounded-[1rem] border border-[var(--color-line)] bg-[#f3f7fb]"><RouteMap /></div><div className="absolute bottom-7 left-7 rounded-xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur"><p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">Your journey</p><p className="mt-1 font-semibold">Discover → prepare → submit</p></div></div>
        </section>

        <section ref={journeyRef} className="border-y border-[var(--color-line)] bg-white"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20"><div className="max-w-2xl" data-reveal><p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--color-brass)]">A calmer way to apply</p><h2 className="font-serif text-3xl tracking-tight sm:text-5xl">Less guesswork. More meaningful progress.</h2><p className="mt-4 leading-7 text-[var(--color-muted)]">A scholarship search is only the beginning. Passage gives you the structure to understand each opportunity and keep moving.</p></div><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{JOURNEY.map((item, i) => { const Icon = item.icon; return <div key={item.step} data-reveal className="card-lift rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6"><div className="flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-[var(--color-brass-soft)] text-[var(--color-brass)]"><Icon size={21} /></span><span className="font-serif text-3xl text-[#cbd7e4]">0{i + 1}</span></div><h3 className="mt-7 text-lg font-bold">{item.step}</h3><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.detail}</p></div>; })}</div></div></section>

        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24"><div><p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--color-brass)]">Readiness, made visible</p><h2 className="font-serif text-3xl tracking-tight sm:text-5xl">Know what is done, missing, and next.</h2><p className="mt-5 max-w-lg leading-7 text-[var(--color-muted)]">Keep official requirements and your own tasks in a single application workspace. Upload documents once, track versions, and get a clear view of your readiness before the deadline.</p><div className="mt-7 space-y-4 text-sm font-semibold"><p className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-verified)]" size={19} />Requirements that reflect the real opportunity</p><p className="flex items-center gap-3"><FileText className="text-[var(--color-brass)]" size={19} />A document vault for your application essentials</p><p className="flex items-center gap-3"><BellRing className="text-[var(--color-urgent)]" size={19} />Deadline awareness without the spreadsheet chaos</p></div></div><div className="rounded-[1.5rem] border border-[var(--color-line)] bg-white p-4 shadow-[0_20px_60px_rgba(16,35,63,.08)]"><DocumentStack /></div></section>

        <section ref={ctaRef} className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:pb-28"><div data-reveal className="relative overflow-hidden rounded-[1.5rem] bg-[var(--color-ink)] px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between"><div className="absolute -right-16 -top-24 size-72 rounded-full border-[36px] border-[var(--color-brass)]/20" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#ffb094]">Start with one clear next step</p><h2 className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">Build the application plan you wish you had sooner.</h2></div><Link href="/signup" className="btn-primary relative mt-8 shrink-0 bg-[var(--color-brass)] lg:mt-0">Create my free plan <ArrowRight size={17} /></Link></div></section>
      </main>
      <footer className="border-t border-[var(--color-line)] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[var(--color-muted)] sm:px-8 sm:flex-row sm:items-center sm:justify-between"><Image src="/passage.png" alt="Passage" width={108} height={31} className="h-7 w-auto object-contain" /><p>Always verify opportunity details on the official website before applying.</p></div></footer>
    </div>
  );
}
