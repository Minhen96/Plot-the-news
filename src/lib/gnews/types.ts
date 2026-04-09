export type GNewsCategory = 
  | "general" | "world" | "nation" | "business" | "technology" 
  | "entertainment" | "sports" | "science" | "health";

export type GNewsLanguage = 
  | "ar" | "zh" | "nl" | "en" | "fr" | "de" | "el" | "he" | "hi" 
  | "it" | "ja" | "ko" | "no" | "pt" | "ro" | "ru" | "es" | "sv" 
  | "ta" | "te" | "tr" | "uk";

export type GNewsCountry = 
  | "au" | "br" | "ca" | "cn" | "eg" | "fr" | "de" | "gr" | "hk" 
  | "in" | "ie" | "il" | "it" | "jp" | "pk" | "ph" | "pt" | "ro" 
  | "ru" | "sa" | "sg" | "es" | "tw" | "ua" | "gb" | "us";

export type GNewsSearchAttribute = "title" | "description" | "content";
export type GNewsNullableAttribute = "description" | "content" | "image";
export type GNewsSortBy = "publishedAt" | "relevance";

export interface GNewsSource {
  name: string;
  url: string;
}

export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: GNewsSource;
}

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

export interface GNewsErrorResponse {
  errors: string[] | Record<string, string>;
}

export interface GNewsBaseOptions {
  lang?: GNewsLanguage;
  country?: GNewsCountry;
  max?: number;
  page?: number;
  from?: string; // ISO 8601
  to?: string;   // ISO 8601
}

export interface GNewsSearchOptions extends GNewsBaseOptions {
  q: string;
  in?: GNewsSearchAttribute[];
  nullable?: GNewsNullableAttribute[];
  sortby?: GNewsSortBy;
}

export interface GNewsTopHeadlinesOptions extends GNewsBaseOptions {
  category?: GNewsCategory;
  q?: string;
}
