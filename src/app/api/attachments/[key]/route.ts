import { NextRequest, NextResponse } from "next/server";
import { getAttachment } from "@/lib/storage/attachments";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params;
  const result = await getAttachment(key);

  if (!result?.data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const contentType =
    (result.metadata?.contentType as string | undefined) ?? "application/octet-stream";
  const name = request.nextUrl.searchParams.get("name") ?? "archivo";

  return new NextResponse(result.data, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
