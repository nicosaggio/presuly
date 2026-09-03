"use client";

import { useActionState } from "react";
import { requestMagicLink, type RequestMagicLinkState } from "@/lib/actions/auth";
import type { Dictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: RequestMagicLinkState = { ok: false };

export function LoginForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, isPending] = useActionState(
    requestMagicLink,
    initialState
  );

  if (state.ok) {
    return (
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{dict.auth.checkEmail}</p>
        <p className="text-sm text-muted-foreground">{dict.auth.checkEmailBody}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{dict.auth.emailLabel}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={dict.auth.emailPlaceholder}
          required
          autoFocus
        />
      </div>

      {state.error === "invalid_email" && (
        <p className="text-sm text-destructive">{dict.auth.invalidEmail}</p>
      )}
      {state.error === "too_soon" && (
        <p className="text-sm text-destructive">{dict.auth.tooSoon}</p>
      )}
      {state.error === "unknown" && (
        <p className="text-sm text-destructive">{dict.auth.unknownError}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? dict.auth.sending : dict.auth.sendLink}
      </Button>
    </form>
  );
}
