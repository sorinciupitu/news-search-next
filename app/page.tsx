
'use client';
import { useEffect, useMemo, useState } from 'react';
import ArticleCard, { type Article } from '@/components/ArticleCard';

type ApiResp = { page: number; pageSize: number; total: number; results: Article[] };

export default function Page() {
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [lang, setLang] = useState('ro-RO');
  const [region, setRegion] = useState('RO');
  const [allowDomains, setAllowDomains] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ApiResp | null>(null);
  const [selected, setSelected] = useState<Article[]>([]);

  const pages = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.total / data.pageSize);
  }, [data]);

  async function search(p = 1) {
    if (!q.trim()) { setErr('Introdu un cuvânt cheie.'); return; }
    setErr(null);
    setLoading(true);
    setPage(p);
    try {
      const params = new URLSearchParams({
        q: q.trim(),
        page: String(p),
        pageSize: String(pageSize),
        lang, region,
      });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (allowDomains.trim()) params.set('allowDomains', allowDomains.trim());

      const r = await fetch('/api/search?' + params.toString());
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Eroare');
      setData(j);
      setSelected(j.results);
    } catch (e: any) {
      setErr(e.message || 'A apărut o eroare.');
    } finally {
      setLoading(false);
    }
  }

  async function exportMD() {
    if (!selected.length) return;
    const r = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: selected }),
    });
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  useEffect(() => { setPage(1); }, [from, to, lang, region, allowDomains, pageSize]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Căutător de articole</h1>
            <p className="text-sm text-gray-600">Caută, filtrează după dată/sursă/limbă, paginează și exportă în Markdown.</p>
          </div>

          <div className="w-full sm:w-auto grid grid-cols-1 md:grid-cols-6 gap-3">
            <input className="md:col-span-2 w-full px-3 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="ex: inteligență artificială"
              value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 w-10">De la</label>
              <input type="date" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white shadow-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 w-10">Până</label>
              <input type="date" className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white shadow-sm" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <select className="px-3 py-2 rounded-xl border border-gray-300 bg-white shadow-sm" value={lang} onChange={(e)=>setLang(e.target.value)}>
              <option value="ro-RO">ro-RO</option>
              <option value="en-US">en-US</option>
              <option value="de-DE">de-DE</option>
              <option value="fr-FR">fr-FR</option>
              <option value="es-ES">es-ES</option>
            </select>
            <select className="px-3 py-2 rounded-xl border border-gray-300 bg-white shadow-sm" value={region} onChange={(e)=>setRegion(e.target.value)}>
              <option value="RO">RO</option>
              <option value="US">US</option>
              <option value="DE">DE</option>
              <option value="FR">FR</option>
              <option value="ES">ES</option>
            </select>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="md:col-span-3 w-full px-3 py-2 rounded-xl border border-gray-300 bg-white shadow-sm"
            placeholder="Restrânge la domenii (ex: hotnews.ro, digi24.ro)"
            value={allowDomains} onChange={(e)=>setAllowDomains(e.target.value)} />
          <select className="px-3 py-2 rounded-xl border border-gray-300 bg-white shadow-sm" value={pageSize} onChange={(e)=>setPageSize(parseInt(e.target.value))}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
          <button onClick={()=>search(1)} disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white font-medium shadow-sm hover:opacity-90 disabled:opacity-50">
            {loading ? 'Caut…' : 'Caută'}
          </button>
          <button onClick={exportMD} disabled={!data?.results?.length}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50">
            Export Markdown
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {err ? <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{err}</div> : null}

        {!loading && (!data || data.results.length === 0) ? (
          <div className="text-center text-gray-600 py-16"><p className="text-lg">Introdu un cuvânt cheie și apasă „Caută”.</p></div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="aspect-[16/9] bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && data?.results?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {data.results.map((a, idx) => <ArticleCard key={idx} a={a} />)}
          </div>
        ) : null}

        {!loading && data && pages > 1 ? (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button disabled={page===1} onClick={()=>search(page-1)} className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50">Înapoi</button>
            <span className="text-sm text-gray-600">Pagina {page} / {pages}</span>
            <button disabled={page===pages} onClick={()=>search(page+1)} className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50">Înainte</button>
          </div>
        ) : null}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-10 text-xs text-gray-500">
        <p>Sursă rezultate: Google News RSS · Extracție text: r.jina.ai (Readability). Pentru producție: backend persistent (Redis) și respectarea termenilor surselor.</p>
      </footer>
    </div>
  );
}
