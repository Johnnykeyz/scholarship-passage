"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    trackEvent("login");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-lg font-semibold">
          Passage
        </Link>
        <h1 className="font-serif text-2xl mt-8 mb-1">Welcome back</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Log in to your application workspace.
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
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[var(--color-brass)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)]">
          New here?{" "}
          <Link href="/signup" className="text-[var(--color-brass)] font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
