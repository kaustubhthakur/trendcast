import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =  "http://localhost:8081";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const body = await req.json();

   const res = await fetch(`${BACKEND_URL}/match/matches/${params.id}/vote`, {
  method: "PUT",   // ← PUT not POST
  headers: {
    "Content-Type": "application/json",
    ...(authHeader ? { Authorization: authHeader } : {}),
  },
  body: JSON.stringify(body),
});

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 502 }
    );
  }
}