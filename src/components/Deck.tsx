"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Card } from "@/data/cards";
import CardChip from "./CardChip";
import type { PointerEvent as ReactPointerEvent } from "react";

export default function Deck({
  cards,
  selectedId,
  lock,
  blinkingId,
  members,
  onSelect,
  onPress,
  detail,
}: {
  cards: Card[];
  selectedId: string | null;
  lock?: { cardId: string; by: string } | null;
  blinkingId?: string | null;
  members?: { id: string; name: string }[];
  onSelect: (id: string) => void;
  onPress?: (e: ReactPointerEvent, cardId: string) => void;
  detail?: ReactNode;
}) {
  const selectedRef = useRef<HTMLDivElement | null>(null);
  const families = new Map<string, Card[]>();
  for (const c of cards) {
    const arr = families.get(c.family) ?? [];
    arr.push(c);
    families.set(c.family, arr);
  }

  useEffect(() => {
    if (!selectedId || !detail) return;
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [selectedId, detail]);

  return (
    <div className="space-y-4">
      {[...families.entries()].map(([fam, list]) => (
        <section key={fam}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{fam}</h2>
          <div className="grid grid-cols-1 gap-2">
            {list.map((c) => (
              <div key={c.id} ref={selectedId === c.id ? selectedRef : undefined}>
                <CardChip
                  card={c}
                  selected={selectedId === c.id}
                  heldBy={lock?.cardId === c.id ? members?.find((m) => m.id === lock.by)?.name : null}
                  blinking={blinkingId === c.id}
                  onClick={() => onSelect(c.id)}
                  onPress={onPress}
                />
                {selectedId === c.id && detail ? <div className="mt-2 lg:hidden">{detail}</div> : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
