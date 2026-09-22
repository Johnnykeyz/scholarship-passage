import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RevealSection } from "@/components/RevealSection";
import { createClient } from "@/lib/supabase/server";
import { PlanningForm } from "./PlanningForm";
import type { Profile } from "@/lib/types/database";

export default async function PlanningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <AppShell>
      <RevealSection className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
        <h1 className="font-serif text-3xl mb-1">What are you preparing for?</h1>
        <p className="text-[var(--color-muted)] mb-8">
          This shapes your dashboard and eligibility checks — think of it as
          your standing plan, separate from any one application.
        </p>
        <PlanningForm initial={profile as Profile} />
      </RevealSection>
    </AppShell>
  );
}
