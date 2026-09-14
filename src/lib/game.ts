import { CARDS, cardsOf, MESSAGES, type Card, type Kind } from "@/data/cards";
import type { ZoneId } from "@/data/zones";

export function isCorrectPlacement(card: Card, zoneId: ZoneId) {
  return card.zones.includes(zoneId);
}

export function isStepComplete(kind: Kind, placements: Record<string, ZoneId>) {
  return cardsOf(kind).every((c) => placements[c.id] && c.zones.includes(placements[c.id]));
}

export function nextKind(kind: Kind): Kind | "done" {
  if (kind === "symptome") return "cause";
  if (kind === "cause") return "prevention";
  return "done";
}

export function continueLabel(kind: Kind) {
  if (kind === "symptome") return "Continuer vers les causes";
  if (kind === "cause") return "Continuer vers les préventions";
  return "Voir la fresque";
}

export function stepMessage(kind: Kind | "done") {
  if (kind === "symptome") return MESSAGES.start;
  if (kind === "cause") return MESSAGES.afterSymptoms;
  if (kind === "prevention") return MESSAGES.afterCauses;
  return MESSAGES.done;
}

export type FrescoLink = { from: string; to: string };

export function frescoLinks(placements: Record<string, ZoneId>): FrescoLink[] {
  const placed = Object.keys(placements)
    .map((id) => CARDS.find((c) => c.id === id))
    .filter((c): c is Card => Boolean(c));
  const symptoms = placed.filter((c) => c.kind === "symptome");
  const others = placed.filter((c) => c.kind !== "symptome");
  const links: FrescoLink[] = [];
  for (const a of others) {
    const zone = placements[a.id];
    const target = symptoms.find((s) => s.zones.includes(zone) || a.zones.some((z) => s.zones.includes(z)));
    if (target) links.push({ from: a.id, to: target.id });
  }
  return links;
}

export const COLORS = ["#C0392B", "#3D9A5F", "#4A90D9", "#E8A317", "#9B59B6", "#1ABC9C", "#E67E22", "#5D6D7E"];
