"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-[var(--color-brass-soft)] text-[var(--color-brass)] mb-5">
            <MailCheck size={22} strokeWidth={2} />
          </div>
          <h1 className="font-serif text-2xl mb-2">Check your email</h1>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-8">
            If an account exists for <strong>{email}</strong>, we&apos;ve
            sent a link to reset your password.
          </p>
          <Link href="/login" className="text-sm text-[var(--color-brass)] font-medium hover:underline">
            Back to login
          </Link>
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
        <h1 className="font-serif text-2xl mt-8 mb-1">Reset your password</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)]">
          <Link href="/login" className="text-[var(--color-brass)] font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
