import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Passage — Global Scholarship & University Application Platform",
    short_name: "Passage",
    description:
      "Discover scholarships, universities and research opportunities. Track requirements, documents and deadlines for every application in one place.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f8fb",
    theme_color: "#10233f",
    icons: [
      { src: "/passage.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/passage.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
