import { getStore } from "@netlify/blobs";

const STORE_NAME = "budget-attachments";

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]);

/**
 * Fuera del entorno de Netlify (build/runtime) hace falta pasar site ID + token a mano —
 * en producción, Netlify inyecta el contexto solo y getStore(name) alcanza.
 */
function store() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  return getStore(STORE_NAME);
}

export async function uploadAttachment(key: string, data: ArrayBuffer, contentType: string) {
  await store().set(key, data, { metadata: { contentType } });
}

export async function getAttachment(key: string) {
  return store().getWithMetadata(key, { type: "arrayBuffer" });
}

export async function deleteAttachment(key: string) {
  await store().delete(key);
}
