import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://benkyo.ycells.com";

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/decks`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/kana`, changeFrequency: "weekly", priority: 0.9 },
  ];
}
