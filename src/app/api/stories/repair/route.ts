import { NextResponse } from "next/server";
import { db } from "@/db";
import { news } from "@/db/schema";
import { hybridSearch } from "@/lib/research";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/stories/repair
 * 
 * Manually triggered endpoint to backfill missing references for existing stories.
 * Scans for stories where refs is null or empty and attempts a resilient search.
 */
export async function GET() {
  try {
    // Find stories with no refs
    const missingRefs = await db
      .select()
      .from(news)
      .where(sql`${news.refs} IS NULL OR json_array_length(${news.refs}) = 0`)
      .limit(20);

    if (missingRefs.length === 0) {
      return NextResponse.json({ message: "No stories require repair." });
    }

    let repaired = 0;
    for (const story of missingRefs) {
      // Clean query for better hit rate
      const query = story.title.replace(/[^\w\s]/gi, ' ').split(' ').slice(0, 8).join(' ');
      
      let gNewsRefs = await hybridSearch(query, 3).catch(() => []);

      // Fallback: If no refs found by title, try a broader search
      if (gNewsRefs.length === 0) {
        const fallbackQuery = story.title.slice(0, 40);
        gNewsRefs = await hybridSearch(fallbackQuery, 2).catch(() => []);
      }

      if (gNewsRefs.length > 0) {
        await db
          .update(news)
          .set({ refs: gNewsRefs })
          .where(eq(news.id, story.id));
        repaired++;
      }
    }

    return NextResponse.json({ 
      total_scanned: missingRefs.length, 
      repaired,
      message: `Intelligence backfill complete for ${repaired} stories.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
