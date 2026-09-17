"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { resolveCard, type Card } from "@/data/cards";
import { debriefPaths } from "@/data/associations";
import { ZONES, zoneLabel, type ZoneId } from "@/data/zones";

export default function BodyMap({
  selected,
  placements,
  proposed,
  reveal,
  debug,
  onZone,
  hoverZone,
  debrief,
  situation,
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
  debrief?: boolean;
  situation?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([]);

  const byZone: Record<string, Card[]> = {};
  const placedCards: Card[] = [];
  for (const [id, zoneId] of Object.entries(placements)) {
    const card = resolveCard(id);
    if (!card) continue;
    placedCards.push(card);
    (byZone[zoneId] ??= []).push(card);
  }

  const counts: Partial<Record<ZoneId, number>> = {};
  for (const zoneId of Object.values(placements)) {
    counts[zoneId] = (counts[zoneId] ?? 0) + 1;
  }
  const bodyZones = ZONES.filter((z) => !z.external);
  const uniqueBody = bodyZones.filter((z, i, arr) => arr.findIndex((x) => x.id === z.id) === i);
  const armed = Boolean(selected) || Boolean(hoverZone);
  const orgCount = counts.organisation ?? 0;
  const orgCards = byZone.organisation ?? [];

  useLayoutEffect(() => {
    if (!debrief || !wrapRef.current || !situation) {
      setLines([]);
      return;
    }
    const root = wrapRef.current.getBoundingClientRect();
    const paths = debriefPaths(
      situation,
      placedCards.map((c) => ({ id: c.id, title: c.title, kind: c.kind })),
    );
    const next: typeof lines = [];
    for (const link of paths) {
      const a = wrapRef.current.querySelector(`[data-debrief-id="${CSS.escape(link.from)}"]`);
      const b = wrapRef.current.querySelector(`[data-debrief-id="${CSS.escape(link.to)}"]`);
      if (!a || !b) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      next.push({
        x1: ra.left + ra.width / 2 - root.left,
        y1: ra.top + ra.height / 2 - root.top,
        x2: rb.left + rb.width / 2 - root.left,
        y2: rb.top + rb.height / 2 - root.top,
        color: link.color,
      });
    }
    setLines(next);
  }, [debrief, situation, placements]);

  function chips(zoneId: ZoneId) {
    if (!debrief) return null;
    return (
      <div className="debrief-stack">
        {(byZone[zoneId] ?? []).map((card) => (
          <span key={card.id} data-debrief-id={card.id} className={`debrief-chip debrief-${card.kind}`}>
            {card.title}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="body-layout" ref={wrapRef}>
      {debrief ? (
        <svg className="debrief-svg" aria-hidden>
          {lines.map((l, i) => {
            const mx = (l.x1 + l.x2) / 2;
            const my = Math.min(l.y1, l.y2) - 18;
            return (
              <path
                key={i}
                d={`M ${l.x1} ${l.y1} Q ${mx} ${my} ${l.x2} ${l.y2}`}
                fill="none"
                stroke={l.color}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.85"
              />
            );
          })}
        </svg>
      ) : null}

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
            className={`zone-hot ${armed ? "armed" : ""} ${hoverZone === z.id ? "drop-ok" : ""} ${debug || reveal ? "debug" : ""} ${debrief ? "debriefing" : ""}`}
            style={z.style}
            onClick={() => onZone(z.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onZone(z.id);
            }}
          >
            {reveal && z.stack ? <span className="zone-caption">{zoneLabel(z.id)}</span> : null}
            {z.stack ? chips(z.id) : null}
          </div>
        ))}
        {!debrief
          ? uniqueBody.map((z) => {
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
            })
          : null}
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
        {!debrief && orgCount ? <span className="zone-badge org-badge">{orgCount}</span> : null}
        {debrief && orgCards.length ? (
          <div className="debrief-stack org-stack">
            {orgCards.map((card) => (
              <span key={card.id} data-debrief-id={card.id} className={`debrief-chip debrief-${card.kind}`}>
                {card.title}
              </span>
            ))}
          </div>
        ) : null}
      </button>
    </div>
  );
}
