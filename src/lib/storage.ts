import type { Kind, SituationId } from "@/data/cards";
import type { ZoneId } from "@/data/zones";

const KEY = "fresque-tms-save";

export type SoloSave = {
  kind: Kind | "done";
  situationId: SituationId;
  placements: Record<string, ZoneId>;
  theme: "dark" | "light";
  understood: string[];
  extraIds?: string[];
};

export function loadSolo(): SoloSave | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SoloSave) : null;
  } catch {
    return null;
  }
}

export function saveSolo(data: SoloSave) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearSolo() {
  localStorage.removeItem(KEY);
}

export function leaveLocalSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("fresque-tms-code");
  sessionStorage.removeItem("fresque-tms-demo");
}

export function clientId() {
  if (typeof window === "undefined") return "srv";
  const k = "fresque-tms-client";
  let id = sessionStorage.getItem(k);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(k, id);
  }
  return id;
}
