import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RevealSection } from "@/components/RevealSection";
import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "./CalendarView";
import type { Application, Opportunity, Task } from "@/lib/types/database";

export interface CalendarItem {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  title: string;
  type: "opportunity_deadline" | "task";
  applicationId: string;
  applicationName: string;
  completed?: boolean;
}

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: applications }, { data: tasks }] = await Promise.all([
    supabase
      .from("applications")
      .select("*, opportunity:opportunities(*)")
      .eq("user_id", user.id),
    supabase.from("tasks").select("*, application:applications!inner(user_id, opportunity:opportunities(name))").eq("user_id", user.id),
  ]);

  const apps = (applications ?? []) as (Application & { opportunity: Opportunity })[];
  const taskList = (tasks ?? []) as (Task & { application: { opportunity: { name: string } } })[];

  const items: CalendarItem[] = [
    ...apps
      .filter((a) => a.opportunity?.application_deadline)
      .map((a) => ({
        id: `deadline-${a.id}`,
        date: a.opportunity.application_deadline as string,
        title: `${a.opportunity.name} — application deadline`,
        type: "opportunity_deadline" as const,
        applicationId: a.id,
        applicationName: a.opportunity.name,
      })),
    ...taskList
      .filter((t) => t.deadline)
      .map((t) => ({
        id: `task-${t.id}`,
        date: t.deadline as string,
        title: t.title,
        type: "task" as const,
        applicationId: t.application_id,
        applicationName: t.application?.opportunity?.name ?? "Application",
        completed: t.status === "completed",
      })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppShell>
      <RevealSection className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
        <h1 className="font-serif text-3xl mb-1">Calendar</h1>
        <p className="text-[var(--color-muted)] mb-8">
          Every application deadline and task with a due date, in one place.
        </p>
        <CalendarView items={items} />
      </RevealSection>
    </AppShell>
  );
}
