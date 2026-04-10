/**
 * scraper.ts
 *
 * Fetches a news article URL and extracts its full text content using
 * Mozilla Readability + jsdom. Used to give DeepSeek richer context
 * than a 2-line newsdata description.
 *
 * Returns null gracefully on any failure (paywall, bot block, timeout, JS-only sites).
 * Callers should fall back to description-only generation if null is returned.
 *
 * Used by: src/app/api/stories/generate-batch/route.ts
 */

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const SCRAPE_TIMEOUT_MS = 8000;
const MAX_CONTENT_CHARS = 4000; // Cap to avoid blowing DeepSeek token budget

export async function scrapeArticleText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Pose as a browser to avoid basic bot blocks
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) return null;

    // Trim whitespace and cap length
    const text = article.textContent.replace(/\s+/g, " ").trim();
    return text.slice(0, MAX_CONTENT_CHARS);
  } catch {
    return null;
  }
}
