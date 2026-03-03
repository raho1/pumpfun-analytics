import { NextRequest, NextResponse } from "next/server";

const DUNE_BASE = "https://api.dune.com/api/v1";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing query id" }, { status: 400 });
  }

  const apiKey = process.env.DUNE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DUNE_API_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch(`${DUNE_BASE}/query/${id}/results`, {
      headers: { "X-Dune-API-Key": apiKey },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Dune API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rows = data?.result?.rows ?? [];
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch from Dune" },
      { status: 500 }
    );
  }
}
