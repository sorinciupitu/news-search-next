# news-search-next

This is an initial README for the news-search-next project.


# News Search (Next.js + Tailwind)

Caută articole după cuvânt cheie, filtrează după dată/sursă/limbă, paginează rezultatele, exportă în Markdown. API server-side cu caching in‑memory și fallback la `og:image`.

## Setup
```bash
pnpm i # sau npm i / yarn
pnpm dev
```
Apoi deschide `http://localhost:3000`.

## Variabile (opțional)
Nimic obligatoriu. Se folosește Google News RSS public și `r.jina.ai` pentru extragere text.

## Note
- Caching-ul este in-memory, resetat la redeploy. Pentru producție, folosește Redis.
- Respectă termenii surselor. Conținutul returnat este pentru citire; păstrează linkul original.
