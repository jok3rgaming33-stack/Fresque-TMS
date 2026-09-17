import fs from "fs";
import path from "path";
import type { RoomState } from "@/lib/room";

const TTL = 60 * 60 * 24 * 30;

function fileDir() {
  const root = process.env.VERCEL ? "/tmp/fresque-rooms" : path.join(process.cwd(), "data", "rooms");
  return root;
}

function filePath(code: string) {
  return path.join(fileDir(), `${code.toUpperCase()}.json`);
}

async function cacheStore() {
  try {
    const { getCache } = await import("@vercel/functions");
    return getCache({ namespace: "fresque-rooms" });
  } catch {
    return null;
  }
}

function readFileRoom(code: string): RoomState | null {
  try {
    const p = filePath(code);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8")) as RoomState;
  } catch {
    return null;
  }
}

function writeFileRoom(state: RoomState) {
  try {
    fs.mkdirSync(fileDir(), { recursive: true });
    fs.writeFileSync(filePath(state.code), JSON.stringify(state));
  } catch {
    /* read-only filesystem */
  }
}

function newest(a: RoomState | null, b: RoomState | null): RoomState | null {
  if (!a) return b;
  if (!b) return a;
  return (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
}

export async function readPersistedRoom(code: string): Promise<RoomState | null> {
  const c = code.toUpperCase();
  let cached: RoomState | null = null;
  try {
    const cache = await cacheStore();
    if (cache) cached = ((await cache.get(c)) as RoomState) ?? null;
  } catch {
    cached = null;
  }
  return newest(cached, readFileRoom(c));
}

export async function writePersistedRoom(state: RoomState): Promise<void> {
  writeFileRoom(state);
  try {
    const cache = await cacheStore();
    if (!cache) return;
    await cache.set(state.code, state, { ttl: TTL, tags: ["room", `room:${state.code}`] });
  } catch {
    /* ignore */
  }
}

export async function readCachedRoom(code: string) {
  return readPersistedRoom(code);
}

export async function writeCachedRoom(state: RoomState) {
  return writePersistedRoom(state);
}
