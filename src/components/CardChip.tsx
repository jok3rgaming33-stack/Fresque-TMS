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
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image} alt="" className="h-11 w-8 shrink-0 rounded-[3px] object-cover object-top" />
      ) : (
        <span className="chip-mark" aria-hidden>
          ●
        </span>
      )}
      <span className="min-w-0 flex-1 break-words text-left leading-snug">{card.title}</span>
      {heldBy ? <span className="ml-1 shrink-0 text-[10px] font-semibold opacity-80">· {heldBy}</span> : null}
    </button>
  );
}
