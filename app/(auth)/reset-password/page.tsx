"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The reset-password link puts the user in a temporary recovery
    // session. Confirm one exists before showing the form — if someone
    // lands here without a valid recovery link, there's nothing to reset.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(Boolean(session));
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-serif text-2xl mb-2">This link isn&apos;t valid</h1>
          <p className="text-sm text-[var(--color-muted)] mb-8">
            Password reset links expire after a short time. Request a new
            one to continue.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center rounded-sm bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-soft)] transition-colors"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-serif text-2xl mb-2">Password updated</h1>
          <p className="text-sm text-[var(--color-muted)]">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-lg font-semibold">
          Passage
        </Link>
        <h1 className="font-serif text-2xl mt-8 mb-1">Set a new password</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-brass)] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-brass)] focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-urgent)] bg-[var(--color-urgent-soft)] rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-[var(--color-ink)] px-4 py-2.5 text-white font-medium hover:bg-[var(--color-ink-soft)] disabled:opacity-60"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
