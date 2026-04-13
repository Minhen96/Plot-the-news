import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const baseUrl = req.nextUrl.origin;
    
    // Call the internal batch generation endpoint
    const res = await fetch(`${baseUrl}/api/stories/generate-batch`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin-sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
