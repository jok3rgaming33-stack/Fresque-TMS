import type { RoomState } from "@/lib/room";

const TTL = 60 * 60 * 24 * 7;

async function store() {
  try {
    const { getCache } = await import("@vercel/functions");
    return getCache({ namespace: "fresque-rooms" });
  } catch {
    return null;
  }
}

export async function readCachedRoom(code: string): Promise<RoomState | null> {
  try {
    const cache = await store();
    if (!cache) return null;
    const value = await cache.get(code.toUpperCase());
    return (value as RoomState) ?? null;
  } catch {
    return null;
  }
}

export async function writeCachedRoom(state: RoomState): Promise<void> {
  try {
    const cache = await store();
    if (!cache) return;
    await cache.set(state.code, state, { ttl: TTL, tags: ["room", `room:${state.code}`] });
  } catch {
    /* memory-only fallback */
  }
}
