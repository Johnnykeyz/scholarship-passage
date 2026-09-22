import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ReportsQueue } from "@/components/admin/ReportsQueue";
import type { OpportunityReport, Opportunity } from "@/lib/types/database";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const { data: reports } = await supabase
    .from("opportunity_reports")
    .select("*, opportunity:opportunities(*)")
    .order("created_at", { ascending: false });

  const list = (reports ?? []) as (OpportunityReport & { opportunity: Opportunity })[];

  return (
    <div className="flex-1 bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 py-4 sm:py-5">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            <ArrowLeft size={15} />
            Back to admin dashboard
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-10">
        <h1 className="font-serif text-3xl mb-1">User reports</h1>
        <p className="text-[var(--color-muted)] mb-8">
          Issues flagged by users about opportunities — incorrect deadlines, broken links, and more.
        </p>
        <ReportsQueue reports={list} />
      </div>
    </div>
  );
}
