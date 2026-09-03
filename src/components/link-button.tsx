"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

type LinkButtonProps = ComponentProps<typeof Button> & {
  href: string;
  target?: string;
  rel?: string;
};

/**
 * Button que navega como link. Se arma Button+Link en el mismo módulo cliente
 * (en vez de pasar <Link> como `render` desde un Server Component) porque cruzar
 * el límite server/client con un elemento como prop rompía la detección de
 * `nativeButton` de Base UI y disparaba un warning en cada render.
 */
export function LinkButton({ href, target, rel, ...props }: LinkButtonProps) {
  return (
    <Button
      render={<Link href={href} target={target} rel={rel} />}
      nativeButton={false}
      {...props}
    />
  );
}
