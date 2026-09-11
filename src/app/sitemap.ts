import type { MetadataRoute } from "next";
import { templates } from "@/lib/templates/data";
import { blogPosts } from "@/lib/blog/posts";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${APP_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${APP_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/refunds`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const templatePages: MetadataRoute.Sitemap = templates.map((t) => ({
    url: `${APP_URL}/templates/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${APP_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...templatePages, ...blogPages];
}
