import { NextResponse } from "next/server";
import { applyPlatformAction, readPlatformState } from "@/lib/server/platform-store";

export async function GET() {
  const state = await readPlatformState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const action = await request.json();
  const state = await applyPlatformAction(action);
  return NextResponse.json(state);
}
