import type { Metadata } from "next";
import { HomePage } from "@/components/pages/home-page";
import { buildAlternates } from "@/lib/seo/alternates";

export const metadata: Metadata = {
  alternates: buildAlternates("/"),
};

export default function EnglishHome() {
  return <HomePage locale="en" />;
}
