import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://benkyo.ycells.com/sitemap.xml",
    host: "https://benkyo.ycells.com",
  };
}
