"use client";

import type { Card } from "@/data/cards";
import CardChip from "./CardChip";

export default function Deck({
  cards,
  selectedId,
  lock,
  blinkingId,
  members,
  onSelect,
}: {
  cards: Card[];
  selectedId: string | null;
  lock?: { cardId: string; by: string } | null;
  blinkingId?: string | null;
  members?: { id: string; name: string }[];
  onSelect: (id: string) => void;
}) {
  const families = new Map<string, Card[]>();
  for (const c of cards) {
    const arr = families.get(c.family) ?? [];
    arr.push(c);
    families.set(c.family, arr);
  }
  return (
    <div className="space-y-4">
      {[...families.entries()].map(([fam, list]) => (
        <section key={fam}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{fam}</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
            {list.map((c) => (
              <div key={c.id} className="min-w-[220px] md:min-w-0">
                <CardChip
                  card={c}
                  selected={selectedId === c.id}
                  heldBy={lock?.cardId === c.id ? members?.find((m) => m.id === lock.by)?.name : null}
                  blinking={blinkingId === c.id}
                  onClick={() => onSelect(c.id)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
