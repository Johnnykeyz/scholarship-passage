"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    trackEvent("signup");

    // If the Supabase project requires email confirmation, signUp()
    // succeeds but returns no session — redirecting straight to
    // onboarding would just bounce the person back to /login with no
    // explanation. Show a "check your email" state instead.
    if (!data.session) {
      setNeedsConfirmation(true);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-[var(--color-brass-soft)] text-[var(--color-brass)] mb-5">
            <MailCheck size={22} strokeWidth={2} />
          </div>
          <h1 className="font-serif text-2xl mb-2">Check your email</h1>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-8">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account, then come back and log in.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-sm bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-ink-soft)] transition-colors"
          >
            Go to login
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
        <h1 className="font-serif text-2xl mt-8 mb-1">Create your account</h1>
        <p className="text-sm text-[var(--color-muted)] mb-8">
          Free to start. No card required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
              Full name
            </label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-sm border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-brass)] focus:outline-none"
            />
          </div>
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
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Password
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-brass)] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
