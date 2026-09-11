import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { blogPosts, getBlogPostBySlug, parsePostDate } from "@/lib/blog/posts";
import { formatDate } from "@/lib/format";
import { LinkButton } from "@/components/link-button";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Presuly`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Presuly" },
    publisher: { "@type": "Organization", name: "Presuly" },
    mainEntityOfPage: `${appUrl}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Presuly", item: appUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${appUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${appUrl}/blog/${post.slug}` },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl px-6 py-16 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
        ← Blog
      </Link>

      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {formatDate(parsePostDate(post.publishedAt), "es")}
        </p>
        <h1 className="text-3xl font-semibold text-balance">{post.title}</h1>
        <p className="text-lg text-muted-foreground text-pretty">{post.intro}</p>
      </header>

      <div className="space-y-8">
        {post.sections.map((section, i) => (
          <section key={i} className="space-y-3">
            {section.heading && (
              <h2 className="text-xl font-semibold text-balance">{section.heading}</h2>
            )}
            {section.paragraphs?.map((p, j) => (
              <p key={j} className="leading-relaxed text-pretty">
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="list-disc space-y-1.5 pl-5 leading-relaxed">
                {section.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {post.relatedLink && (
        <p>
          <Link href={post.relatedLink.href} className="font-medium underline">
            {post.relatedLink.label} →
          </Link>
        </p>
      )}

      <div className="rounded-lg border bg-accent/30 p-6 text-center space-y-3">
        <p className="font-medium">¿Listo para armar el tuyo?</p>
        <LinkButton href="/login" size="lg">
          Crear presupuesto gratis
        </LinkButton>
      </div>
    </article>
  );
}
