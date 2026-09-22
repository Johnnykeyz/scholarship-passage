import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/applications",
          "/planning",
          "/documents",
          "/calendar",
          "/saved",
          "/tools",
          "/admin",
          "/onboarding",
          "/reset-password",
        ],
      },
    ],
  };
}
