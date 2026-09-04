"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile";
import type { Dictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({ dict, name }: { dict: Dictionary; name: string | null }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateProfile(formData);
      toast.success(dict.profile.saved);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{dict.profile.name}</Label>
        <Input
          key={name ?? ""}
          id="name"
          name="name"
          defaultValue={name ?? ""}
          placeholder={dict.profile.namePlaceholder}
        />
        <p className="text-xs text-muted-foreground">{dict.profile.nameHint}</p>
      </div>
      <Button type="submit" disabled={isPending}>
        {dict.common.save}
      </Button>
    </form>
  );
}
