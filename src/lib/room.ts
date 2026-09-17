import type { Kind, SituationId } from "@/data/cards";
import type { ZoneId } from "@/data/zones";

export const DEMO_CODE = "0000";

export type Role = "hote" | "collaborateur" | "observateur";
export type PlayMode = "atelier" | "guide";

export type Member = { id: string; name: string; color: string; role: Role };

export type RoomState = {
  code: string;
  situationId: SituationId;
  mode: PlayMode;
  kind: Kind | "done";
  members: Member[];
  placements: Record<string, { zoneId: ZoneId; by: string; at: number }>;
  lock: { cardId: string; by: string; until: number } | null;
  proposal: {
    cardId: string;
    zoneId: ZoneId;
    by: string;
    votes: Record<string, "oui" | "non">;
    notes: { by: string; text: string }[];
  } | null;
  blinkingId: string | null;
  message: string | null;
  understood: string[];
  revealZones: boolean;
  projection: boolean;
  stepReady: boolean;
  extraIds: string[];
  updatedAt: number;
};

export type RoomAction =
  | { type: "create"; clientId: string; name: string; situationId: SituationId }
  | { type: "join"; code: string; clientId: string; name: string; role?: Role }
  | { type: "leave"; code: string; clientId: string }
  | { type: "select"; code: string; clientId: string; cardId: string | null }
  | { type: "propose"; code: string; clientId: string; zoneId: ZoneId; cardId?: string }
  | { type: "vote"; code: string; clientId: string; vote: "oui" | "non" }
  | { type: "note"; code: string; clientId: string; text: string }
  | { type: "force"; code: string; clientId: string }
  | { type: "release"; code: string; clientId: string }
  | { type: "continue"; code: string; clientId: string }
  | { type: "restart-step"; code: string; clientId: string }
  | { type: "restart-all"; code: string; clientId: string }
  | { type: "toggle-mode"; code: string; clientId: string }
  | { type: "toggle-reveal"; code: string; clientId: string }
  | { type: "toggle-projection"; code: string; clientId: string }
  | { type: "remove-card"; code: string; clientId: string; cardId: string }
  | { type: "add-copy"; code: string; clientId: string; cardId: string };

export async function roomFetch(action: RoomAction): Promise<RoomState> {
  const res = await fetch("/api/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(err.error || "Erreur salle");
  }
  return res.json();
}

export async function roomGet(code: string): Promise<RoomState | null> {
  const res = await fetch(`/api/room?code=${encodeURIComponent(code)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erreur salle");
  return res.json();
}
