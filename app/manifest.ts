import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Passage — Global Scholarship & University Application Platform",
    short_name: "Passage",
    description:
      "Discover scholarships, universities and research opportunities. Track requirements, documents and deadlines for every application in one place.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#0f172a",
    icons: [],
  };
}
