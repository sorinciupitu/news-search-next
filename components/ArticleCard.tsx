
import Image from "next/image";

export type Article = {
  title: string;
  source_link: string;
  post_image: string;
  pubDate?: string;
  body: string;
  source?: string;
};

export default function ArticleCard({ a }: { a: Article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
        {a.post_image ? (
          <Image src={a.post_image} alt="cover" fill className="object-cover group-hover:scale-[1.02] transition-transform" />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold leading-snug">{a.title}</h2>
        <p className="text-xs text-gray-500 mt-1">{a.pubDate ? new Date(a.pubDate).toLocaleString() : ""}</p>
        <div className="prose prose-sm max-w-none mt-3 whitespace-pre-wrap">{a.body}</div>
        <div className="mt-4 flex items-center justify-between">
          <a href={a.source_link} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-900 underline underline-offset-4">
            Deschide sursa
          </a>
          {a.source ? <span className="text-xs text-gray-500">{a.source}</span> : null}
        </div>
      </div>
    </article>
  );
}
