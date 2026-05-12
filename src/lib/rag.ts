// ─── Simple Keyword RAG ───────────────────────────────────────
// Searches dset-knowledge.json by keyword matching.
// No vector DB, no external service — works everywhere in production.

import knowledgeBase from '../../data/dset-knowledge.json';

interface KnowledgeChunk {
  topic:    string;
  keywords: string[];
  content:  string;
}

const chunks = knowledgeBase as KnowledgeChunk[];

// Returns top N relevant chunks for a given user query
export function searchKnowledge(query: string, topN = 3): string {
  const q = query.toLowerCase();

  const scored = chunks.map((chunk) => {
    const matchCount = chunk.keywords.filter((kw) =>
      q.includes(kw.toLowerCase())
    ).length;
    return { chunk, score: matchCount };
  });

  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.chunk.content);

  // If no keyword match found, return general company overview as fallback
  if (relevant.length === 0) {
    const fallback = chunks.find((c) => c.topic === 'company_overview');
    return fallback ? fallback.content : '';
  }

  return relevant.join('\n\n');
}
