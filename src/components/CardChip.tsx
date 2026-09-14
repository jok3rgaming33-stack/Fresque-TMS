"use client";

import type { Card } from "@/data/cards";

export default function CardChip({
  card,
  selected,
  heldBy,
  blinking,
  onClick,
}: {
  card: Card;
  selected?: boolean;
  heldBy?: string | null;
  blinking?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip chip-${card.kind} ${selected ? "chip-selected" : ""} ${heldBy ? "chip-held" : ""} ${blinking ? "chip-error" : ""}`}
      aria-pressed={selected}
    >
      <span>{card.title}</span>
      {heldBy ? <span className="ml-2 text-[10px] font-semibold opacity-80">· {heldBy}</span> : null}
    </button>
  );
}
