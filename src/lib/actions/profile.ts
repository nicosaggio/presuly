"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : null)),
});

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = profileSchema.parse({ name: formData.get("name") ?? "" });

  await db.update(users).set({ name: data.name }).where(eq(users.id, session.userId));

  revalidatePath("/dashboard/profile");
}
