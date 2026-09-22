import { createBrowserClient } from "@supabase/ssr";

// Note: not using the generated Database generic here — for this MVP slice
// lib/types/database.ts defines hand-written row shapes for the app to
// import directly, rather than a full Supabase codegen schema. Casting
// query results to those types (e.g. `as Opportunity[]`) keeps type safety
// where it matters without fighting the client's strict table typing.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
