"use client";

import { useState } from "react";
import { Info } from "lucide-react";

const GLOSSARY: Record<string, string> = {
  "fully funded": "Covers tuition and living costs, so you shouldn't need personal or family funds to study.",
  "partially funded": "Covers some costs (often tuition) but you'll likely need to fund the rest yourself.",
  "statement of purpose": "A short essay explaining why you want to study a specific program and what you plan to do afterward.",
  "unconditional offer": "A university admission offer with no remaining conditions — you've met every requirement.",
  "conditional offer": "An admission offer that depends on you still meeting certain conditions, like final grades or a language test score.",
  "cgpa": "Cumulative Grade Point Average — your average academic score across all your courses, usually on a scale like 4.0 or 5.0.",
  "research proposal": "A short document outlining a research question you want to study, why it matters, and roughly how you'd approach it.",
  "assistantship": "A funded position where you work part-time (often teaching or research) at a university in exchange for a stipend and/or tuition waiver.",
};

export function GlossaryTerm({ term, children }: { term: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const definition = GLOSSARY[term.toLowerCase()];
  if (!definition) return <>{children}</>;

  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        aria-label={`What does "${term}" mean?`}
        className="text-[var(--color-brass)] hover:text-[#94430a]"
      >
        <Info size={13} strokeWidth={2.2} />
      </button>
      {open && (
        <span className="absolute left-0 top-full mt-1.5 z-30 w-56 rounded-sm border border-[var(--color-line)] bg-white p-3 text-xs leading-relaxed text-[var(--color-ink-soft)] shadow-lg">
          {definition}
        </span>
      )}
    </span>
  );
}
