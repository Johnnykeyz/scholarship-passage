import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { formatDeadline } from "@/lib/deadlines";
import { StatusSelect } from "./StatusSelect";
import { RequirementsPanel } from "./RequirementsPanel";
import { TasksPanel } from "./TasksPanel";
import { ReadinessBar } from "./ReadinessBar";
import type {
  Application,
  ApplicationRequirement,
  Opportunity,
  Task,
  TimelineEvent,
} from "@/lib/types/database";

export default async function ApplicationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: application } = await supabase
    .from("applications")
    .select("*, opportunity:opportunities(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!application) notFound();
  const app = application as Application & { opportunity: Opportunity };

  const { data: requirements } = await supabase
    .from("application_requirements")
    .select("*")
    .eq("application_id", id)
    .order("created_at");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("application_id", id)
    .order("created_at");

  const { data: timeline } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("application_id", id)
    .order("occurred_at", { ascending: false });

  const reqs = (requirements ?? []) as ApplicationRequirement[];
  const taskList = (tasks ?? []) as Task[];
  const events = (timeline ?? []) as TimelineEvent[];

  const reqsDone = reqs.filter((r) => r.status === "ready" || r.status === "submitted" || r.status === "verified").length;
  const tasksDone = taskList.filter((t) => t.status === "completed").length;

  return (
    <AppShell>
      <div className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
        <Link href="/applications" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] mb-6">
          <ArrowLeft size={15} />
          All applications
        </Link>

        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="font-serif text-3xl leading-tight">{app.opportunity.name}</h1>
        </div>
        <p className="text-[var(--color-muted)] mb-6">
          {app.opportunity.country} · Deadline: {formatDeadline(app.opportunity.application_deadline)}
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <StatusSelect applicationId={app.id} currentStatus={app.status} />
          <a
            href={app.opportunity.official_website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-brass)] hover:underline"
          >
            Official website
            <ExternalLink size={14} />
          </a>
        </div>

        <ReadinessBar
          requirementsTotal={reqs.length}
          requirementsDone={reqsDone}
          tasksTotal={taskList.length}
          tasksDone={tasksDone}
        />

        <section className="mt-10 mb-10 pb-10 border-b border-[var(--color-line)]">
          <h2 className="font-serif text-xl mb-4">Requirements</h2>
          <RequirementsPanel applicationId={app.id} requirements={reqs} />
        </section>

        <section className="mb-10 pb-10 border-b border-[var(--color-line)]">
          <h2 className="font-serif text-xl mb-4">Tasks</h2>
          <TasksPanel applicationId={app.id} tasks={taskList} requirements={reqs} />
        </section>

        <section>
          <h2 className="font-serif text-xl mb-4">Timeline</h2>
          {events.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No activity yet.</p>
          ) : (
            <ol className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="flex gap-4 text-sm">
                  <span className="w-28 shrink-0 text-[var(--color-muted)]">
                    {new Date(e.occurred_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  <span>{e.event_text}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </AppShell>
  );
}
