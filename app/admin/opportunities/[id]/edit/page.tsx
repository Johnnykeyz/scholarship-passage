import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OpportunityForm } from "@/components/admin/OpportunityForm";
import type { Opportunity } from "@/lib/types/database";

export default async function EditOpportunityPage({
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

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const { data: opportunity } = await supabase.from("opportunities").select("*").eq("id", id).single();
  if (!opportunity) notFound();

  return (
    <div className="flex-1 bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-2xl px-5 sm:px-6 py-4 sm:py-5">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            <ArrowLeft size={15} />
            Back to admin dashboard
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-5 sm:px-6 py-8 sm:py-10">
        <h1 className="font-serif text-3xl mb-8">Edit opportunity</h1>
        <OpportunityForm initial={opportunity as Opportunity} />
      </div>
    </div>
  );
}
