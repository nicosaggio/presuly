import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Inicialización perezosa: evita que falte DATABASE_URL rompa el build
// (Next.js puede evaluar este módulo al analizar rutas, sin ejecutar ninguna).
let cached: NeonHttpDatabase<typeof schema> | null = null;

function getDb() {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL no está configurado. Copiá .env.example a .env.local y completá la connection string de Neon."
      );
    }
    cached = drizzle(neon(url), { schema });
  }
  return cached;
}

export const db: NeonHttpDatabase<typeof schema> = new Proxy(
  {} as NeonHttpDatabase<typeof schema>,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getDb(), prop, receiver);
    },
  }
);
