"use client";

import type { Card } from "@/data/cards";
import type { PointerEvent as ReactPointerEvent } from "react";

export default function CardChip({
  card,
  selected,
  heldBy,
  blinking,
  onClick,
  onPress,
}: {
  card: Card;
  selected?: boolean;
  heldBy?: string | null;
  blinking?: boolean;
  onClick: () => void;
  onPress?: (e: ReactPointerEvent, cardId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        const pt = (e.nativeEvent as PointerEvent).pointerType;
        if (pt === "mouse") return;
        onClick();
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") onPress?.(e, card.id);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`mini-card chip-${card.kind} ${selected ? "chip-selected" : ""} ${heldBy ? "chip-held" : ""} ${blinking ? "chip-error" : ""}`}
      aria-pressed={selected}
    >
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image} alt="" draggable={false} className="mini-card-img" />
      ) : (
        <span className="mini-card-fallback">{card.kind === "symptome" ? "S" : card.kind === "cause" ? "C" : "P"}</span>
      )}
      <span className="mini-card-title">{card.title}</span>
      {heldBy ? <span className="mini-card-held">{heldBy}</span> : null}
    </button>
  );
}
