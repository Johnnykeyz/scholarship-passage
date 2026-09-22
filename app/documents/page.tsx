import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RevealSection } from "@/components/RevealSection";
import { createClient } from "@/lib/supabase/server";
import { DocumentVault } from "./DocumentVault";
import type { AppDocument, DocumentVersion, ApplicationDocument } from "@/lib/types/database";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: documents }, { data: versions }, { data: links }, { data: applications }] = await Promise.all([
    supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("document_versions")
      .select("*, document:documents!inner(user_id)")
      .eq("document.user_id", user.id)
      .order("version_number", { ascending: false }),
    supabase
      .from("application_documents")
      .select("*, application:applications!inner(user_id, opportunity:opportunities(name))")
      .eq("application.user_id", user.id),
    supabase
      .from("applications")
      .select("id, opportunity:opportunities(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AppShell>
      <RevealSection className="px-6 py-8 md:px-10 md:py-10 max-w-3xl">
        <h1 className="font-serif text-3xl mb-1">Document vault</h1>
        <p className="text-[var(--color-muted)] mb-8">
          Upload a document once, then reuse it across applications. Every
          upload keeps its previous versions — nothing is silently replaced.
        </p>
        <DocumentVault
          documents={(documents ?? []) as AppDocument[]}
          versions={(versions ?? []) as DocumentVersion[]}
          links={(links ?? []) as (ApplicationDocument & { application: { opportunity: { name: string } } })[]}
          applications={
            ((applications ?? []) as unknown as { id: string; opportunity: { name: string }[] }[]).map((a) => ({
              id: a.id,
              opportunity: a.opportunity?.[0] ?? null,
            }))
          }
        />
      </RevealSection>
    </AppShell>
  );
}
