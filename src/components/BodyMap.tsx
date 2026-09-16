"use client";

import { CARDS, type Card } from "@/data/cards";
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
  projection,
  scale,
}: {
  selected: Card | null;
  placements: Record<string, ZoneId>;
  proposed?: { cardId: string; zoneId: ZoneId } | null;
  blinkingId?: string | null;
  reveal?: boolean;
  debug?: boolean;
  onZone: (id: ZoneId) => void;
  onPin?: (cardId: string) => void;
  projection?: boolean;
  scale?: number;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[520px] origin-top"
      style={{ transform: scale && scale !== 1 ? `scale(${scale})` : undefined }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/perso.jpg" alt="Personnage technicien" className="mx-auto block h-auto w-full max-h-[62vh] object-contain md:max-h-[78vh]" />
      {ZONES.map((z) => (
        <button
          key={z.id}
          type="button"
          aria-label={reveal || debug ? z.label : "Zone du corps"}
          className={`zone-hot ${selected ? "pulse" : ""} ${debug || reveal ? "debug" : ""}`}
          style={z.style}
          onClick={() => onZone(z.id)}
        />
      ))}
      {Object.entries(placements).map(([id, zoneId], i) => {
        const zone = ZONES.find((z) => z.id === zoneId);
        const card = CARDS.find((c) => c.id === id);
        if (!zone || !card) return null;
        const color = card.kind === "symptome" ? "#C0392B" : card.kind === "prevention" ? "#3D9A5F" : "#9aa3ad";
        const left = 18 + ((i * 11) % 48);
        const top = 10 + ((i * 9) % 42);
        return (
          <button
            key={id}
            type="button"
            className={`pin absolute ${blinkingId === id ? "chip-error" : ""}`}
            style={{
              background: color,
              top: `calc(${zone.style.top} + ${top}px)`,
              left: `calc(${zone.style.left} + ${left}%)`,
            }}
            aria-label={card.title}
            onClick={() => onPin?.(id)}
          />
        );
      })}
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
      {projection ? null : null}
    </div>
  );
}
