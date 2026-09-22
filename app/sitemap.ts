import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// NEXT_PUBLIC_SITE_URL should be set to the real production domain once
// deployed (e.g. https://passage.example.com). Falls back to a placeholder
// so this still builds without it configured.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/opportunities`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/countries`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  // Best-effort: if Supabase isn't reachable at build/request time, ship
  // the static pages rather than fail the whole sitemap.
  try {
    const supabase = await createClient();
    const { data: opportunities } = await supabase
      .from("opportunities")
      .select("id, updated_at")
      .neq("status", "archived");

    const opportunityPages: MetadataRoute.Sitemap = (opportunities ?? []).map((o) => ({
      url: `${SITE_URL}/opportunities/${o.id}`,
      lastModified: new Date(o.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...opportunityPages];
  } catch {
    return staticPages;
  }
}
