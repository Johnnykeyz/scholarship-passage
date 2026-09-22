import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OpportunityForm } from "@/components/admin/OpportunityForm";

export default async function NewOpportunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

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
        <h1 className="font-serif text-3xl mb-8">Add opportunity</h1>
        <OpportunityForm />
      </div>
    </div>
  );
}
