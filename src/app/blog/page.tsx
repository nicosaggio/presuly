import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts, parsePostDate } from "@/lib/blog/posts";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog | Presuly",
  description:
    "Consejos prácticos para armar presupuestos profesionales, cobrar más rápido y trabajar mejor como freelancer o estudio chico.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-10">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="text-muted-foreground">
          Consejos prácticos para armar presupuestos que se aprueban más rápido.
        </p>
      </header>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader>
                <CardDescription>{formatDate(parsePostDate(post.publishedAt), "es")}</CardDescription>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{post.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <footer className="text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Presuly
        </Link>
      </footer>
    </div>
  );
}
