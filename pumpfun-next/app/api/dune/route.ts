import { NextRequest, NextResponse } from "next/server";
import { QUERY_IDS } from "@/lib/queries";

const DUNE_BASE = "https://api.dune.com/api/v1";

// Whitelist: only allow query IDs defined in our queries.ts
const ALLOWED_IDS = new Set(Object.values(QUERY_IDS));

// Simple in-memory rate limiter (per-IP, resets on redeploy)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing query id" }, { status: 400 });
  }

  // Whitelist check
  if (!ALLOWED_IDS.has(Number(id))) {
    return NextResponse.json({ error: "Invalid query id" }, { status: 403 });
  }

  const apiKey = process.env.DUNE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${DUNE_BASE}/query/${id}/results`, {
      headers: { "X-Dune-API-Key": apiKey },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream data source error" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rows = data?.result?.rows ?? [];
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 502 }
    );
  }
}
