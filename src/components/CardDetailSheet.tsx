"use client";

import type { Card } from "@/data/cards";
import { zoneLabel, type ZoneId } from "@/data/zones";
import type { PointerEvent as ReactPointerEvent } from "react";

export default function CardDetailSheet({
  card,
  placedZone,
  revealZones,
  onClose,
  onRemove,
  onPress,
  onAddCopy,
}: {
  card: Card;
  placedZone?: ZoneId;
  revealZones?: boolean;
  onClose: () => void;
  onRemove?: () => void;
  onPress?: (e: ReactPointerEvent, cardId: string) => void;
  onAddCopy?: () => void;
}) {
  const showZones = Boolean(revealZones);
  return (
    <div className="sheet p-3 md:p-5">
      <div className="card-preview-layout">
        {card.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image}
            alt={card.title}
            draggable={false}
            className="card-preview-img"
            onPointerDown={(e) => onPress?.(e, card.id)}
          />
        ) : (
          <div className={`card-face card-face-${card.kind}`} onPointerDown={(e) => onPress?.(e, card.id)}>
            <p className="card-face-kind">{card.kind === "symptome" ? "Symptôme" : card.kind === "cause" ? "Cause" : "Prévention"}</p>
            <p className="card-face-title">{card.title}</p>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">{card.family}</p>
          <h3 className="mt-1 font-serif text-xl leading-tight md:text-2xl">{card.title}</h3>
          {card.description && card.description !== card.title ? (
            <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">{card.description}</p>
          ) : null}
          {showZones ? (
            <p className="mt-2 text-sm text-[var(--gold-2)]">Zone : {card.zones.map(zoneLabel).join(" · ")}</p>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">Maintenez la carte, puis glissez-la sur une zone du corps.</p>
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {onAddCopy ? (
              <button type="button" onClick={onAddCopy} className="min-h-11 flex-1 border border-[var(--line)] px-4 font-semibold">
                Ajouter un exemplaire
              </button>
            ) : null}
            {placedZone && onRemove ? (
              <button type="button" onClick={onRemove} className="min-h-11 flex-1 border border-[var(--line)] px-4 font-semibold">
                Retirer
              </button>
            ) : null}
            <button type="button" onClick={onClose} className="min-h-11 flex-1 bg-white/10 px-4 font-semibold">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
