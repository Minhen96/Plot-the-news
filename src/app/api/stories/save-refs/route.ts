import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/stories/save-refs
 * 
 * Securely saves discovered references back to the database news table.
 * Used by LiveArticleView when it finds references for an entry that was missing them.
 */
export async function POST(req: NextRequest) {
  try {
    const { newsId, refs } = await req.json();

    if (!newsId || !Array.isArray(refs)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Only allow saving if we actually have references to save
    if (refs.length === 0) {
      return NextResponse.json({ message: "No references to save" });
    }

    await db
      .update(news)
      .set({ refs })
      .where(eq(news.id, newsId));

    return NextResponse.json({ success: true, savedCount: refs.length });
  } catch (err) {
    console.error("[save-refs] failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
