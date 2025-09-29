
export function firstImageFromMarkdown(md: string): string | undefined {
  const m = md.match(/!\[[^\]]*\]\((https?:[^\s)]+)\)/);
  return m?.[1];
}

export async function extractMarkdown(url: string): Promise<string> {
  const tryUrls = [
    `https://r.jina.ai/http://${url}`,
    `https://r.jina.ai/https://${url}`,
    url.startsWith("http") ? `https://r.jina.ai/${url}` : undefined,
  ].filter(Boolean) as string[];

  for (const u of tryUrls) {
    try {
      const r = await fetch(u, { cache: "no-store" });
      if (r.ok) return await r.text();
    } catch {}
  }
  throw new Error("Nu pot extrage conținutul");
}

export async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    const html = await r.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
              html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i);
    return m?.[1];
  } catch {
    return undefined;
  }
}
