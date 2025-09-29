
import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleNewsRSS } from "@/lib/rss";
import { extractMarkdown, firstImageFromMarkdown, fetchOgImage } from "@/lib/extract";
import { getCache, setCache } from "@/lib/cache";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "10", 10), 30);
  const lang = searchParams.get("lang") || "ro-RO";
  const region = searchParams.get("region") || "RO";
  const allowDomains = (searchParams.get("allowDomains") || "").split(",").map(s => s.trim()).filter(Boolean);

  if (!q) return NextResponse.json({ error: "Parametrul q este obligatoriu." }, { status: 400 });

  const cacheKey = `search:${q}:${from}:${to}:${page}:${pageSize}:${lang}:${region}:${allowDomains.join("|")}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const items = await fetchGoogleNewsRSS(q, lang, region);

  const minDate = from ? new Date(from + "T00:00:00") : undefined;
  const maxDate = to ? new Date(to + "T23:59:59") : undefined;

  let arr = items.map(it => {
    const link = (it.link || "").trim();
    const title = (it.title || "").trim();
    const pubDate = it.pubDate ? new Date(it.pubDate) : undefined;
    const thumb = (it["media:content"]?.url || it.enclosure?.url);
    return { title, link, pubDate, thumb };
  }).filter(x => x.link && x.title);

  if (minDate) arr = arr.filter(x => !x.pubDate || x.pubDate >= minDate);
  if (maxDate) arr = arr.filter(x => !x.pubDate || x.pubDate <= maxDate);

  if (allowDomains.length) {
    arr = arr.filter(x => allowDomains.some(d => x.link.includes(d)));
  }

  const start = (page - 1) * pageSize;
  const pageSlice = arr.slice(start, start + pageSize);

  const results: any[] = [];
  for (const it of pageSlice) {
    try {
      const md = await extractMarkdown(it.link);
      const img = firstImageFromMarkdown(md) || it.thumb || await fetchOgImage(it.link) || "https://placehold.co/1200x630?text=No+Image";
      results.push({
        title: it.title,
        source_link: it.link,
        post_image: img,
        pubDate: it.pubDate ? it.pubDate.toISOString() : undefined,
        body: md.trim(),
        source: new URL(it.link).hostname,
      });
    } catch {}
  }

  const payload = { page, pageSize, total: arr.length, results };
  setCache(cacheKey, payload, 120);
  return NextResponse.json(payload, { headers: { "Cache-Control": "s-maxage=60" } });
}
