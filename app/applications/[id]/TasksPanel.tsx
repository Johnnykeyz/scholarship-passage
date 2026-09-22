"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import gsap from "gsap";
import { createClient } from "@/lib/supabase/client";
import type { ApplicationRequirement, Task, TaskStatus } from "@/lib/types/database";
import { formatDeadline } from "@/lib/deadlines";

export function TasksPanel({
  applicationId,
  tasks,
  requirements,
}: {
  applicationId: string;
  tasks: Task[];
  requirements: ApplicationRequirement[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [relatedReq, setRelatedReq] = useState("");

  async function toggleTask(task: Task, rowEl: HTMLLabelElement | null) {
    const newStatus: TaskStatus = task.status === "completed" ? "to_do" : "completed";

    if (newStatus === "completed" && rowEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        rowEl,
        { backgroundColor: "rgba(22, 101, 52, 0.12)" },
        { backgroundColor: "rgba(22, 101, 52, 0)", duration: 0.9, ease: "power1.out" }
      );
    }

    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    if (newStatus === "completed") {
      await supabase.from("timeline_events").insert({
        application_id: applicationId,
        event_text: `Completed task: ${task.title}`,
      });
    }
    router.refresh();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("tasks").insert({
      application_id: applicationId,
      user_id: user?.id,
      title,
      deadline: deadline || null,
      related_requirement_id: relatedReq || null,
      status: "to_do",
    });
    setSaving(false);
    setShowForm(false);
    setTitle("");
    setDeadline("");
    setRelatedReq("");
    router.refresh();
  }

  return (
    <div>
      {tasks.length === 0 && !showForm ? (
        <p className="text-sm text-[var(--color-muted)] mb-4">No tasks yet.</p>
      ) : (
        <div className="divide-y divide-[var(--color-line)] rounded-sm border border-[var(--color-line)] bg-white mb-4">
          {tasks.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-paper-dim)] transition-colors"
            >
              <input
                type="checkbox"
                checked={t.status === "completed"}
                onChange={(e) => toggleTask(t, e.currentTarget.closest("label"))}
                className="size-4 accent-[var(--color-brass)]"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${t.status === "completed" ? "line-through text-[var(--color-muted)]" : ""}`}>
                  {t.title}
                </p>
                {t.deadline && (
                  <p className="text-xs text-[var(--color-muted)]">Due {formatDeadline(t.deadline)}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={addTask} className="rounded-sm border border-[var(--color-line)] bg-white p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Task</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Request transcript"
              className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Related requirement</label>
              <select
                value={relatedReq}
                onChange={(e) => setRelatedReq(e.target.value)}
                className="w-full rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {requirements.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.requirement_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-white hover:bg-[#94430a] disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add task"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brass)] hover:underline"
        >
          <Plus size={15} />
          Add task
        </button>
      )}
    </div>
  );
}
