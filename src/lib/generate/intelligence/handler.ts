import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const SCRAPE_TIMEOUT_MS = 8000;
const MAX_CONTENT_CHARS = 5000; // Increased slightly for better context
const CONTENT_MIN_LENGTH = 200;

/**
 * Strips common web UI noise from crawled article text:
 * social share buttons, live-blog timestamps, nav/footer boilerplate.
 */
function cleanCrawledText(text: string): string {
  return text
    // Social share blocks (various formats from different sites)
    .replace(/Share\s*Share\s*Copy\s*link[\s\S]*?Email/gi, '')
    .replace(/\b(Share|ShareShare)\b\s*(Copy link\s*)?(Facebook\s*)?(X\s*\(Twitter\)\s*)?(LinkedIn\s*)?(Email\s*)?/gi, '')
    // Live-blog / timestamped entry separators (e.g. "19:01" or "12:18 GMT+")
    .replace(/\b\d{1,2}:\d{2}(\s*(GMT|UTC|EST|PST|BST)[+-]?\d*)?/g, '')
    // "Load more", "Read more", "See also", "Click here" CTA noise
    .replace(/\b(Load more|Read more|See also[:\s]*|Click here|Subscribe now|Sign up)\b[^\n]*/gi, '')
    // Social platform names as standalone words (leftover from share widgets)
    .replace(/\b(Facebook|Twitter|LinkedIn|Instagram|WhatsApp|Telegram|Pinterest)\b/g, '')
    // Copyright / footer lines and RSS bridges
    .replace(/©[^\n]*/g, '')
    .replace(/All rights reserved[^\n]*/gi, '')
    .replace(/\bThe post\s+.*?\s+appeared first on\s+.*?\s*$/gi, '')
    // Collapse multiple spaces/newlines created by the above removals
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function scrapeArticleText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
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

    const rawText = article.textContent.replace(/\s+/g, " ").trim();
    const cleanedText = cleanCrawledText(rawText);

    // Ensure we have a minimum amount of meaningful content
    if (cleanedText.length < CONTENT_MIN_LENGTH) return null;

    return cleanedText.slice(0, MAX_CONTENT_CHARS);
  } catch (err) {
    console.error(`[scraper] error for ${url}:`, err);
    return null;
  }
}
