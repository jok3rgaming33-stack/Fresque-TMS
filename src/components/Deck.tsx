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

  useEffect(() => {
    if (!selectedId || !detail) return;
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [selectedId, detail]);

  return (
    <div className="grid grid-cols-1 gap-2">
      {cards.map((c) => (
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
  );
}
