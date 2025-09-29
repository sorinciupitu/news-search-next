
import { XMLParser } from "fast-xml-parser";

export type RssItem = {
  title: string;
  link: string;
  pubDate?: string;
  enclosure?: { url?: string };
  "media:content"?: { url?: string };
};

export async function fetchGoogleNewsRSS(q: string, lang = "ro-RO", region = "RO") {
  const encodedQ = encodeURIComponent(q.trim());
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQ}&hl=${lang}&gl=${region}&ceid=${region}:${lang.split("-")[0]}`;
  const jinaUrl = `https://r.jina.ai/http://news.google.com/rss/search?q=${encodedQ}&hl=${lang}&gl=${region}&ceid=${region}:${lang.split("-")[0]}`;
  const res = await fetch(jinaUrl, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Nu pot prelua RSS");
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const json = parser.parse(xml);
  const items: any[] = json?.rss?.channel?.item ?? [];
  return items as RssItem[];
}
