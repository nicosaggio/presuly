"use client";

import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({ label }: { label: string }) {
  return (
    <Button variant="ghost" size="sm" onClick={() => logout()}>
      {label}
    </Button>
  );
}
