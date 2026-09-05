import type { Metadata } from "next";
import { HomePage } from "@/components/pages/home-page";
import { buildAlternates } from "@/lib/seo/alternates";

export const metadata: Metadata = {
  alternates: buildAlternates("es", "/"),
};

export default function Home() {
  return <HomePage locale="es" />;
}
