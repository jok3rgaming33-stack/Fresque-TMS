"use client";

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
}: {
  cards: Card[];
  selectedId: string | null;
  lock?: { cardId: string; by: string } | null;
  blinkingId?: string | null;
  members?: { id: string; name: string }[];
  onSelect: (id: string) => void;
  onPress?: (e: ReactPointerEvent, cardId: string) => void;
}) {
  return (
    <div className="mini-grid">
      {cards.map((c) => (
        <CardChip
          key={c.id}
          card={c}
          selected={selectedId === c.id}
          heldBy={lock?.cardId === c.id ? members?.find((m) => m.id === lock.by)?.name : null}
          blinking={blinkingId === c.id}
          onClick={() => onSelect(c.id)}
          onPress={onPress}
        />
      ))}
    </div>
  );
}
