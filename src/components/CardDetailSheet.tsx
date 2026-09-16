"use client";

import type { Card } from "@/data/cards";
import { zoneLabel, type ZoneId } from "@/data/zones";

export default function CardDetailSheet({
  card,
  placedZone,
  revealZones,
  onPlace,
  onClose,
  onRemove,
}: {
  card: Card;
  placedZone?: ZoneId;
  revealZones?: boolean;
  onPlace?: () => void;
  onClose: () => void;
  onRemove?: () => void;
}) {
  const showZones = Boolean(revealZones);
  return (
    <div className="sheet p-5 md:rounded-3xl md:border md:border-white/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{card.family}</p>
      <h3 className="mt-1 text-xl font-bold">{card.title}</h3>
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image} alt="" className="mt-3 max-h-48 w-full rounded-2xl object-cover object-top" />
      ) : (
        <div className={`mt-3 flex h-24 items-center justify-center rounded-2xl chip-${card.kind} text-3xl`}>●</div>
      )}
      <p className="mt-3 text-base leading-relaxed">{card.description}</p>
      {showZones ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Zones : {card.zones.map(zoneLabel).join(", ")}
        </p>
      ) : null}
      <div className="mt-4 flex gap-2">
        {placedZone ? (
          onRemove ? (
            <button type="button" onClick={onRemove} className="min-h-11 flex-1 rounded-full bg-white/10 px-4 font-semibold">
              Retirer
            </button>
          ) : null
        ) : onPlace ? (
          <button type="button" onClick={onPlace} className="min-h-11 flex-1 rounded-full bg-[var(--green)] px-4 font-bold text-[#0f1a12]">
            Placer sur le corps
          </button>
        ) : null}
        <button type="button" onClick={onClose} className="min-h-11 rounded-full bg-white/10 px-4 font-semibold">
          Fermer
        </button>
      </div>
    </div>
  );
}
