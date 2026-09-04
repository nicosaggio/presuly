"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  label,
  iconOnly = false,
}: {
  label: string;
  /** Para headers angostos (ej: el del dashboard en mobile) — el ícono solo,
   * con el texto como aria-label en vez de visible. */
  iconOnly?: boolean;
}) {
  if (iconOnly) {
    return (
      <Button variant="ghost" size="icon-sm" onClick={() => logout()} aria-label={label}>
        <LogOut />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => logout()}>
      {label}
    </Button>
  );
}
