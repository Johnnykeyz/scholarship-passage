#!/usr/bin/env node
/**
 * Cross-checks that every `create table public.X` in supabase/schema.sql
 * has a corresponding exported TypeScript interface in
 * lib/types/database.ts. This does NOT check field-level accuracy — it's
 * a cheap drift guard, not a substitute for real generated types.
 *
 * Once the schema stabilizes, replace lib/types/database.ts with actual
 * Supabase-generated types:
 *
 *   npx supabase gen types typescript --project-id <your-project-ref> > lib/types/database.generated.ts
 *
 * (requires the Supabase CLI and a linked project — see
 * https://supabase.com/docs/guides/api/rest/generating-types)
 *
 * Run: node scripts/check-types-sync.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const schema = readFileSync(path.join(root, "supabase/schema.sql"), "utf8");
const typesFile = readFileSync(path.join(root, "lib/types/database.ts"), "utf8");

const tableNames = [...schema.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]);
const interfaceNames = [...typesFile.matchAll(/export interface (\w+)/g)].map((m) => m[1]);

// snake_case table -> PascalCase, with a couple of known deliberate
// renames (Document collides with the DOM global, so the table is
// `documents` but the type is `AppDocument`).
const KNOWN_RENAMES = { documents: "AppDocument" };

function toPascalCase(snake) {
  const pascal = snake
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
  // Naive singularization for this table set only: "...ies" -> "...y",
  // otherwise strip a trailing "s". Good enough for the known tables;
  // not a general-purpose inflector.
  if (pascal.endsWith("ies")) return pascal.slice(0, -3) + "y";
  if (pascal.endsWith("s")) return pascal.slice(0, -1);
  return pascal;
}

const missing = [];
for (const table of tableNames) {
  const expected = KNOWN_RENAMES[table] ?? toPascalCase(table);
  if (!interfaceNames.includes(expected)) {
    missing.push({ table, expected });
  }
}

if (missing.length > 0) {
  console.error("Tables in schema.sql with no matching interface in lib/types/database.ts:");
  for (const m of missing) {
    console.error(`  - ${m.table} (expected interface: ${m.expected})`);
  }
  process.exit(1);
}

console.log(`OK — all ${tableNames.length} tables in schema.sql have a matching TypeScript interface.`);
