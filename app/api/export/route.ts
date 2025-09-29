
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { items } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Nimic de exportat." }, { status: 400 });
  }
  const md = items.map((a: any) => {
    const date = a.pubDate ? new Date(a.pubDate).toLocaleString() : "";
    return [
      `# ${a.title}`,
      ``,
      a.post_image ? `![cover](${a.post_image})` : ``,
      ``,
      `_${date}_  ·  [Sursa](${a.source_link})`,
      ``,
      a.body || ""
    ].join("\n");
  }).join("\n\n---\n\n");

  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": "attachment; filename=export.md"
    }
  });
}
