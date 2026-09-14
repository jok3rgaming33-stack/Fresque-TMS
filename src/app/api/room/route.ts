import { NextResponse } from "next/server";
import { getRoom, mutate } from "@/lib/room-store";
import type { RoomAction } from "@/lib/room";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") || "";
  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Atelier introuvable" }, { status: 404 });
  return NextResponse.json(room);
}

export async function POST(req: Request) {
  try {
    const action = (await req.json()) as RoomAction;
    const room = mutate(action);
    return NextResponse.json(room);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    const status = msg.includes("introuvable") ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
