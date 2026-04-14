import { searchNews as searchGNews } from "./gnews";
import { Reference } from "./types";

/**
 * Perform a news search using GNews.
 * GNews has a 100 req/day free tier — conserve calls by only using this at view time,
 * not at ingest time.
 */
export async function hybridSearch(q: string, size = 5): Promise<Reference[]> {
  try {
    const gnews = await searchGNews({ q, max: size, lang: "en" });
    if (gnews.articles && gnews.articles.length > 0) {
      return gnews.articles.map(a => ({
        title: a.title,
        source: a.source.name,
        url: a.url
      }));
    }
  } catch (err) {
    console.warn("[research] GNews failed:", err);
  }

  return [];
}
