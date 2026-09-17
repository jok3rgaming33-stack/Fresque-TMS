"use client";

import { resolveCard, type Card } from "@/data/cards";
import { ZONES, type ZoneId } from "@/data/zones";

export default function BodyMap({
  selected,
  placements,
  proposed,
  blinkingId,
  reveal,
  debug,
  onZone,
  onPin,
  hoverZone,
}: {
  selected: Card | null;
  placements: Record<string, ZoneId>;
  proposed?: { cardId: string; zoneId: ZoneId } | null;
  blinkingId?: string | null;
  reveal?: boolean;
  debug?: boolean;
  onZone: (id: ZoneId) => void;
  onPin?: (cardId: string) => void;
  hoverZone?: ZoneId | null;
  projection?: boolean;
  scale?: number;
}) {
  const byZone: Record<string, Card[]> = {};
  for (const [id, zoneId] of Object.entries(placements)) {
    const card = resolveCard(id);
    if (!card) continue;
    (byZone[zoneId] ??= []).push(card);
  }

  return (
    <div className="relative mx-auto w-fit max-w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/perso.png"
        alt="Personnage technicien"
        className="block h-auto max-h-[min(68vh,720px)] w-auto max-w-full"
      />
      {ZONES.map((z, i) => (
        <div
          key={`${z.id}-${i}`}
          role="button"
          tabIndex={0}
          aria-label={reveal || debug ? z.label : "Zone du corps"}
          data-zone-id={z.id}
          className={`zone-hot ${selected || hoverZone ? "pulse" : ""} ${hoverZone === z.id ? "drop-ok" : ""} ${debug || reveal ? "debug" : ""}`}
          style={z.style}
          onClick={() => onZone(z.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onZone(z.id);
          }}
        >
          {z.stack ? (
            <div className="zone-stack">
              {(byZone[z.id] ?? []).map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`placed-chip placed-${card.kind} ${blinkingId === card.id ? "chip-error" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin?.(card.id);
                  }}
                >
                  {card.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
      {proposed ? (
        <div
          className="pin pin-proposed absolute"
          style={{
            background: "#fbbf24",
            top: ZONES.find((z) => z.id === proposed.zoneId)?.style.top,
            left: ZONES.find((z) => z.id === proposed.zoneId)?.style.left,
          }}
        />
      ) : null}
    </div>
  );
}
