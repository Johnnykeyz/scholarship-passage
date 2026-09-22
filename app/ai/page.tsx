import { redirect } from "next/navigation";
import { Sparkles, MessageSquareText, FileSearch, ListChecks, GitCompareArrows, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RevealSection } from "@/components/RevealSection";
import { createClient } from "@/lib/supabase/server";

const TOOLS = [
  {
    icon: MessageSquareText,
    title: "Application assistant",
    description: "Ask \"what am I missing?\" or \"what should I do this week?\" and get answers grounded in your own requirements and tasks — never invented deadlines or eligibility rules.",
  },
  {
    icon: FileSearch,
    title: "Document review",
    description: "Get feedback on your statement of purpose or CV before you submit it.",
  },
  {
    icon: ListChecks,
    title: "Preparation plans",
    description: "A personalized, week-by-week plan built from your saved opportunities and their real deadlines.",
  },
  {
    icon: GitCompareArrows,
    title: "Program comparison",
    description: "Ask the assistant to compare two programs you're tracking, side by side, using only what's on file for each.",
  },
];

export default async function AiToolsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <AppShell>
      <RevealSection className="px-6 py-8 md:px-10 md:py-10 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-brass-soft)] text-[var(--color-brass)] px-2.5 py-1 text-xs font-medium mb-4">
          <Sparkles size={13} />
          Coming soon · Premium
        </div>
        <h1 className="font-serif text-3xl mb-3">AI application tools</h1>
        <p className="text-[var(--color-muted)] max-w-xl mb-4 leading-relaxed">
          A set of AI-assisted tools is in development for premium accounts.
          They&apos;ll help you prepare faster — without ever inventing a
          deadline, requirement, or eligibility rule that isn&apos;t
          genuinely on file.
        </p>
        <p className="text-xs text-[var(--color-muted)] bg-[var(--color-paper-dim)] inline-block rounded-sm px-3 py-2 mb-10">
          As with everything on Passage: even once these tools launch, always
          confirm final details on the official scholarship or university
          website before making decisions.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {TOOLS.map((tool) => (
            <div
              key={tool.title}
              className="relative rounded-sm border border-[var(--color-line)] bg-white p-5 overflow-hidden"
            >
              <div className="absolute top-3 right-3 text-[var(--color-line)]">
                <Lock size={14} />
              </div>
              <span className="flex items-center justify-center size-9 rounded-sm bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)] mb-3">
                <tool.icon size={17} strokeWidth={2} />
              </span>
              <h2 className="font-medium text-sm mb-1.5">{tool.title}</h2>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">{tool.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-sm border border-[var(--color-line)] bg-white p-6">
          <p className="text-sm font-medium mb-1.5">Want early access?</p>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            Keep using the free planning tools in the meantime — your
            requirements, tasks and progress will carry straight over once AI
            tools launch.
          </p>
          <a
            href="mailto:hello@example.com?subject=Passage%20AI%20tools%20early%20access"
            className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-ink-soft)] transition-colors"
          >
            Get notified
          </a>
        </div>
      </RevealSection>
    </AppShell>
  );
}
