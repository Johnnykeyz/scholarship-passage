"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SavedOpportunity } from "@/lib/types/database";

const TAGS = [
  { value: "dream", label: "Dream" },
  { value: "reach", label: "Reach" },
  { value: "target", label: "Target" },
  { value: "backup", label: "Backup" },
];

export function SaveButton({
  opportunityId,
  initial,
}: {
  opportunityId: string;
  initial: SavedOpportunity | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saved, setSaved] = useState(Boolean(initial));
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [showTags, setShowTags] = useState(false);
  const [saving, setSaving] = useState(false);

  async function toggleSave() {
    setSaving(true);
    if (saved) {
      await supabase
        .from("saved_opportunities")
        .delete()
        .eq("opportunity_id", opportunityId);
      setSaved(false);
      setTags([]);
      setShowTags(false);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("saved_opportunities").insert({
        user_id: user?.id,
        opportunity_id: opportunityId,
        tags: [],
      });
      setSaved(true);
      setShowTags(true);
    }
    setSaving(false);
    router.refresh();
  }

  async function toggleTag(tag: string) {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setTags(next);
    await supabase.from("saved_opportunities").update({ tags: next }).eq("opportunity_id", opportunityId);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={toggleSave}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors active:scale-[0.98] disabled:opacity-60 ${
          saved
            ? "border-[var(--color-brass)] bg-[var(--color-brass-soft)] text-[var(--color-brass)]"
            : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"
        }`}
      >
        {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        {saved ? "Saved" : "Save for later"}
      </button>

      {saved && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {showTags || tags.length > 0 ? (
            TAGS.map((t) => (
              <button
                key={t.value}
                onClick={() => toggleTag(t.value)}
                className={`text-xs rounded-sm px-2 py-1 font-medium transition-colors ${
                  tags.includes(t.value)
                    ? "bg-[var(--color-ink)] text-white"
                    : "bg-[var(--color-paper-dim)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                {t.label}
              </button>
            ))
          ) : (
            <button
              onClick={() => setShowTags(true)}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              + Add a tag
            </button>
          )}
        </div>
      )}
    </div>
  );
}
