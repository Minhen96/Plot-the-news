import { 
  GNewsBaseOptions,
  GNewsErrorResponse, 
  GNewsResponse, 
  GNewsSearchOptions, 
  GNewsTopHeadlinesOptions 
} from "./types";

const GNEWS_API_BASE = "https://gnews.io/api/v4";

/**
 * Custom error class for GNews API errors
 */
export class GNewsError extends Error {
  public status: number;
  public errors: string[] | Record<string, string>;

  constructor(status: number, data: GNewsErrorResponse) {
    const mainMessage = Array.isArray(data.errors) 
      ? data.errors[0] 
      : Object.values(data.errors)[0] || "Unknown GNews API error";
    
    super(mainMessage);
    this.name = "GNewsError";
    this.status = status;
    this.errors = data.errors;
  }

  /**
   * Helper to get a human-readable list of all error messages
   */
  public getAllMessages(): string[] {
    if (Array.isArray(this.errors)) {
      return this.errors;
    }
    return Object.entries(this.errors).map(([attr, msg]) => `${attr}: ${msg}`);
  }
}

/**
 * Core fetch function for GNews API
 */
async function fetchGNews<T>(
  endpoint: "search" | "top-headlines",
  options: Record<string, any> = {}
): Promise<T> {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    throw new Error("GNEWS_API_KEY is missing from environment variables");
  }

  const url = new URL(`${GNEWS_API_BASE}/${endpoint}`);
  
  // Append API key
  url.searchParams.append("apikey", apiKey);

  // Map all options to query parameters
  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      // GNews supports comma-separated values for 'in' and 'nullable'
      url.searchParams.append(key, value.join(","));
    } else {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData: GNewsErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = { errors: [response.statusText || "Unknown error"] };
      }
      throw new GNewsError(response.status, errorData);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof GNewsError) throw error;
    
    console.error("Network or unexpected error during GNews fetch:", error);
    throw new Error(error instanceof Error ? error.message : "Unexpected connection error");
  }
}

/**
 * Fetches top headlines from GNews
 * Supports category, q (search within headlines), and all base options.
 */
export async function getTopHeadlines(options: GNewsTopHeadlinesOptions = {}): Promise<GNewsResponse> {
  return fetchGNews<GNewsResponse>("top-headlines", options);
}

/**
 * Searches for news articles on GNews
 * Supports advanced query syntax, attributes filtering, and sorting.
 */
export async function searchNews(options: GNewsSearchOptions): Promise<GNewsResponse> {
  return fetchGNews<GNewsResponse>("search", options);
}

/**
 * Helper to search specifically by keyword (legacy / simpler interface)
 */
export async function searchByKeyword(q: string, extraOptions: GNewsBaseOptions = {}): Promise<GNewsResponse> {
  return searchNews({ ...extraOptions, q });
}

export * from "./types";
