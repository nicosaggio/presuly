"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureAttribution } from "@/lib/actions/attribution";
import type { AttributionSource } from "@/lib/attribution";

/**
 * Componente invisible: si la URL trae ?ref= o ?utm_source=, guarda la atribución.
 * `implicitSource` sirve para páginas que en sí mismas son el canal (ej: una
 * página de plantilla) sin necesitar un query param.
 */
export function AttributionCapture({
  implicitSource,
}: {
  implicitSource?: AttributionSource;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    const utmSource = searchParams.get("utm_source");

    let source: AttributionSource | null = implicitSource ?? null;
    if (ref) source = "referral";
    else if (utmSource === "budget_footer") source = "shared_link";
    else if (utmSource === "template_gallery") source = "template_gallery";

    if (source) {
      captureAttribution({ source, ref: ref ?? undefined });
    }
  }, [searchParams, implicitSource]);

  return null;
}
