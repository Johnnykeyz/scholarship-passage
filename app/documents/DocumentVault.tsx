"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, ChevronDown, ChevronUp, Trash2, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AppDocument, DocumentVersion, ApplicationDocument, DocumentCategory } from "@/lib/types/database";

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "identity", label: "Identity" },
  { value: "application", label: "Application" },
  { value: "supporting", label: "Supporting" },
  { value: "other", label: "Other" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB — generous for CVs/SOPs/scans, keeps the free storage tier sane

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type LinkWithApp = ApplicationDocument & { application: { opportunity: { name: string } } };

export function DocumentVault({
  documents,
  versions,
  links,
  applications,
}: {
  documents: AppDocument[];
  versions: DocumentVersion[];
  links: LinkWithApp[];
  applications: { id: string; opportunity: { name: string } | null }[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("application");
  const [file, setFile] = useState<File | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [linkingDoc, setLinkingDoc] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim()) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large — the limit is 10MB.");
      return;
    }
    setError(null);
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({ user_id: user.id, name, category })
      .select()
      .single();

    if (docError || !doc) {
      setError(docError?.message ?? "Couldn't create the document.");
      setUploading(false);
      return;
    }

    const storagePath = `${user.id}/${doc.id}/1-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, file);

    if (uploadError) {
      setError(uploadError.message);
      // Clean up the orphaned document row rather than leaving a document with no versions.
      await supabase.from("documents").delete().eq("id", doc.id);
      setUploading(false);
      return;
    }

    const { data: version, error: versionError } = await supabase
      .from("document_versions")
      .insert({
        document_id: doc.id,
        version_number: 1,
        storage_path: storagePath,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type || null,
      })
      .select()
      .single();

    if (versionError || !version) {
      setError(versionError?.message ?? "Couldn't record the upload.");
      setUploading(false);
      return;
    }

    await supabase.from("documents").update({ current_version_id: version.id }).eq("id", doc.id);

    setUploading(false);
    setName("");
    setFile(null);
    router.refresh();
  }

  async function handleNewVersion(docId: string, uploadedFile: File) {
    if (uploadedFile.size > MAX_FILE_SIZE) {
      setError("File is too large — the limit is 10MB.");
      return;
    }
    setError(null);
    const existingVersions = versions.filter((v) => v.document_id === docId);
    const nextVersionNumber = Math.max(0, ...existingVersions.map((v) => v.version_number)) + 1;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const storagePath = `${user.id}/${docId}/${nextVersionNumber}-${uploadedFile.name}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(storagePath, uploadedFile);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data: version } = await supabase
      .from("document_versions")
      .insert({
        document_id: docId,
        version_number: nextVersionNumber,
        storage_path: storagePath,
        file_name: uploadedFile.name,
        file_size_bytes: uploadedFile.size,
        mime_type: uploadedFile.type || null,
      })
      .select()
      .single();

    if (version) {
      await supabase.from("documents").update({ current_version_id: version.id }).eq("id", docId);
    }
    router.refresh();
  }

  async function setCurrentVersion(docId: string, versionId: string) {
    await supabase.from("documents").update({ current_version_id: versionId }).eq("id", docId);
    router.refresh();
  }

  async function handleDownload(storagePath: string, fileName: string) {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(storagePath, 60);
    if (error || !data) {
      setError("Couldn't generate a download link.");
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = fileName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm("Delete this document and all its versions? This can't be undone.")) return;
    const docVersions = versions.filter((v) => v.document_id === docId);
    for (const v of docVersions) {
      await supabase.storage.from("documents").remove([v.storage_path]);
    }
    await supabase.from("documents").delete().eq("id", docId);
    router.refresh();
  }

  async function toggleLink(docId: string, applicationId: string, isLinked: boolean) {
    if (isLinked) {
      await supabase
        .from("application_documents")
        .delete()
        .eq("document_id", docId)
        .eq("application_id", applicationId);
    } else {
      await supabase.from("application_documents").insert({ document_id: docId, application_id: applicationId });
    }
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleUpload} className="rounded-sm border border-[var(--color-line)] bg-white p-4 sm:p-5 mb-8 space-y-3">
        <p className="text-sm font-medium">Upload a document</p>
        {error && (
          <p className="text-xs text-[var(--color-urgent)] bg-[var(--color-urgent-soft)] rounded-sm px-3 py-2">{error}</p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CV, Statement of Purpose"
            className="rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm focus:border-[var(--color-brass)] focus:outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            className="rounded-sm border border-[var(--color-line)] px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <input
          required
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-[var(--color-paper-dim)] file:px-3 file:py-1.5 file:text-xs file:font-medium"
        />
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-white hover:bg-[#94430a] disabled:opacity-60 transition-colors active:scale-[0.98]"
        >
          <Upload size={14} />
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {documents.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] text-center py-8">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const docVersions = versions
              .filter((v) => v.document_id === doc.id)
              .sort((a, b) => b.version_number - a.version_number);
            const currentVersion = docVersions.find((v) => v.id === doc.current_version_id) ?? docVersions[0];
            const docLinks = links.filter((l) => l.document_id === doc.id);
            const isExpanded = expanded === doc.id;
            const isLinking = linkingDoc === doc.id;

            return (
              <div key={doc.id} className="rounded-sm border border-[var(--color-line)] bg-white">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={16} className="text-[var(--color-muted)] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {currentVersion ? `v${currentVersion.version_number} · ${formatBytes(currentVersion.file_size_bytes)}` : "No versions"}
                        {docLinks.length > 0 ? ` · used in ${docLinks.length} application${docLinks.length === 1 ? "" : "s"}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {currentVersion && (
                      <button
                        onClick={() => handleDownload(currentVersion.storage_path, currentVersion.file_name)}
                        className="text-xs font-medium text-[var(--color-brass)] hover:underline"
                      >
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : doc.id)}
                      className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--color-line)] px-4 sm:px-5 py-4 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-2">
                        Versions
                      </p>
                      <div className="space-y-1.5">
                        {docVersions.map((v) => (
                          <div key={v.id} className="flex items-center justify-between text-xs">
                            <span>
                              v{v.version_number} — {v.file_name} ({formatBytes(v.file_size_bytes)})
                            </span>
                            {v.id === doc.current_version_id ? (
                              <span className="text-[var(--color-verified)] font-medium">Current</span>
                            ) : (
                              <button
                                onClick={() => setCurrentVersion(doc.id, v.id)}
                                className="text-[var(--color-brass)] hover:underline"
                              >
                                Make current
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <label className="inline-flex items-center gap-1.5 mt-2 text-xs text-[var(--color-brass)] hover:underline cursor-pointer">
                        <Upload size={12} />
                        Upload new version
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleNewVersion(doc.id, f);
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
                          Used in applications
                        </p>
                        <button
                          onClick={() => setLinkingDoc(isLinking ? null : doc.id)}
                          className="inline-flex items-center gap-1 text-xs text-[var(--color-brass)] hover:underline"
                        >
                          <Link2 size={12} />
                          {isLinking ? "Done" : "Attach to application"}
                        </button>
                      </div>
                      {docLinks.length === 0 && !isLinking && (
                        <p className="text-xs text-[var(--color-muted)]">Not attached to any application yet.</p>
                      )}
                      {isLinking ? (
                        <div className="space-y-1">
                          {applications.map((app) => {
                            const isLinked = docLinks.some((l) => l.application_id === app.id);
                            return (
                              <label key={app.id} className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={isLinked}
                                  onChange={() => toggleLink(doc.id, app.id, isLinked)}
                                />
                                {app.opportunity?.name ?? "Untitled application"}
                              </label>
                            );
                          })}
                          {applications.length === 0 && (
                            <p className="text-xs text-[var(--color-muted)]">No applications to attach to yet.</p>
                          )}
                        </div>
                      ) : (
                        <ul className="space-y-1">
                          {docLinks.map((l) => (
                            <li key={l.id} className="text-xs text-[var(--color-ink-soft)]">
                              ✓ {l.application.opportunity.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-[var(--color-urgent)] hover:underline"
                    >
                      <Trash2 size={12} />
                      Delete document
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
