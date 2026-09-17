"use client";

import { resolveCard, type Card } from "@/data/cards";
import { ZONES, zoneLabel, type ZoneId } from "@/data/zones";

export default function BodyMap({
  selected,
  placements,
  proposed,
  reveal,
  debug,
  onZone,
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
  const counts: Partial<Record<ZoneId, number>> = {};
  for (const zoneId of Object.values(placements)) {
    counts[zoneId] = (counts[zoneId] ?? 0) + 1;
  }
  const bodyZones = ZONES.filter((z) => !z.external);
  const uniqueBody = bodyZones.filter((z, i, arr) => arr.findIndex((x) => x.id === z.id) === i);
  const armed = Boolean(selected) || Boolean(hoverZone);
  const orgCount = counts.organisation ?? 0;

  return (
    <div className="body-layout">
      <div className="relative mx-auto w-fit max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/perso.png" alt="Personnage technicien" className="board-body-img" />
        {bodyZones.map((z, i) => (
          <div
            key={`${z.id}-${i}`}
            role="button"
            tabIndex={0}
            aria-label={reveal || debug ? z.label : "Zone du corps"}
            data-zone-id={z.id}
            className={`zone-hot ${armed ? "armed" : ""} ${hoverZone === z.id ? "drop-ok" : ""} ${debug || reveal ? "debug" : ""}`}
            style={z.style}
            onClick={() => onZone(z.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onZone(z.id);
            }}
          />
        ))}
        {uniqueBody.map((z) => {
          const n = counts[z.id] ?? 0;
          if (!n) return null;
          const top = parseFloat(z.style.top) + parseFloat(z.style.height) / 2;
          const left = parseFloat(z.style.left) + parseFloat(z.style.width) / 2;
          return (
            <button
              key={`badge-${z.id}`}
              type="button"
              className="zone-badge"
              style={{ top: `${top}%`, left: `${left}%` }}
              aria-label={`${n} carte${n > 1 ? "s" : ""} · ${zoneLabel(z.id)}`}
              onClick={(e) => {
                e.stopPropagation();
                onZone(z.id);
              }}
            >
              {n}
            </button>
          );
        })}
        {proposed && proposed.zoneId !== "organisation" ? (
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

      <button
        type="button"
        data-zone-id="organisation"
        className={`org-drop ${armed ? "armed" : ""} ${hoverZone === "organisation" ? "drop-ok" : ""}`}
        onClick={() => onZone("organisation")}
      >
        <span className="org-drop-kicker">Hors corps</span>
        <span className="org-drop-title">Organisation &amp; contexte</span>
        {orgCount ? <span className="zone-badge org-badge">{orgCount}</span> : null}
      </button>
    </div>
  );
}
