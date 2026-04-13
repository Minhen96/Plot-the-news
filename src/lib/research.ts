import { searchNews as searchGNews } from "./gnews";
import { searchNews as searchNewsData } from "./newsdata";
import { Reference } from "./types";

/**
 * Perform a hybrid news search.
 * Prioritizes GNews, but falls back to NewsData if GNews fails (e.g. limit reached).
 */
export async function hybridSearch(q: string, size = 5): Promise<Reference[]> {
  // 1. Try GNews first
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
    console.warn("[research] GNews failed, falling back to NewsData...", err);
  }

  // 2. Fallback to NewsData
  try {
    const newsdata = await searchNewsData(q, size);
    return newsdata.map(a => ({
      title: a.title,
      source: a.source.name,
      url: a.url
    }));
  } catch (err) {
    console.error("[research] NewsData fallback also failed:", err);
    return [];
  }
}
