"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CARDS, ZONES, type CardKind, type GameCard, type ZoneId } from "@/data/catalog";

const STAGE_ORDER: CardKind[] = ["symptome", "cause", "prevention"];
const STAGE_LABEL: Record<CardKind, string> = {
  symptome: "1 / 3 — Placez les symptômes",
  cause: "2 / 3 — Placez les causes",
  prevention: "3 / 3 — Placez les moyens de prévention",
};

function Chip({
  card,
  blinking,
  compact,
}: {
  card: GameCard;
  blinking?: boolean;
  compact?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`chip chip-${card.kind} ${isDragging ? "opacity-40" : ""} ${blinking ? "chip-error" : ""} ${compact ? "chip-compact" : ""}`}
      {...listeners}
      {...attributes}
    >
      <span>{card.title}</span>
      {!compact ? (
        <div className="detail">
          {card.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image} alt="" className="h-44 w-full object-cover object-top" />
          ) : null}
          <div className="p-3 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{card.family}</p>
            <p className="mt-1 text-sm font-bold">{card.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{card.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ZoneSlot({
  zone,
  placed,
}: {
  zone: (typeof ZONES)[number];
  placed: GameCard[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zone.id });
  return (
    <div ref={setNodeRef} className={`zone-hot ${isOver ? "over" : ""}`} style={zone.style}>
      <div className="flex h-full flex-col justify-center gap-1 overflow-hidden p-1">
        {placed.map((c) => (
          <div key={c.id} className={`chip chip-${c.kind} chip-compact`}>
            {c.title}
          </div>
        ))}
      </div>
    </div>
  );
}

function allCorrect(kind: CardKind, placed: Record<string, ZoneId>) {
  const cards = CARDS.filter((c) => c.kind === kind);
  return cards.every((c) => placed[c.id] && c.zones.includes(placed[c.id]));
}

export default function Atelier({ onHome }: { onHome: () => void }) {
  const [stage, setStage] = useState<CardKind>("symptome");
  const [placed, setPlaced] = useState<Record<string, ZoneId>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [blinking, setBlinking] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(
    "Placez d'abord tous les symptômes aux bons endroits du corps.",
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const pool = useMemo(() => {
    return CARDS.filter((c) => c.kind === stage && !placed[c.id]);
  }, [stage, placed]);

  const grouped = useMemo(() => {
    const map = new Map<string, GameCard[]>();
    for (const c of pool) {
      const arr = map.get(c.family) ?? [];
      arr.push(c);
      map.set(c.family, arr);
    }
    return [...map.entries()];
  }, [pool]);

  function flashError(id: string) {
    setBlinking((b) => ({ ...b, [id]: true }));
    window.setTimeout(() => {
      setBlinking((b) => {
        const next = { ...b };
        delete next[id];
        return next;
      });
    }, 1100);
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const over = e.over?.id ? String(e.over.id) : null;
    const id = String(e.active.id);
    const card = CARDS.find((c) => c.id === id);
    if (!card || card.kind !== stage) return;

    if (over && ZONES.some((z) => z.id === over)) {
      const zone = over as ZoneId;
      if (card.zones.includes(zone)) {
        const nextPlaced = { ...placed, [id]: zone };
        setPlaced(nextPlaced);
        if (allCorrect(stage, nextPlaced)) {
          const idx = STAGE_ORDER.indexOf(stage);
          if (idx < STAGE_ORDER.length - 1) {
            const next = STAGE_ORDER[idx + 1];
            setStage(next);
            setMessage(
              next === "cause"
                ? "Symptômes validés. Les causes sont déverrouillées."
                : "Causes validées. Les moyens de prévention sont déverrouillés.",
            );
          } else {
            setMessage("Parcours terminé : symptômes, causes et préventions sont en place.");
          }
        } else {
          setMessage(null);
        }
      } else {
        flashError(id);
        setMessage("Mauvais emplacement : la carte revient dans le jeu.");
      }
    }
  }

  function reset() {
    setStage("symptome");
    setPlaced({});
    setBlinking({});
    setMessage("Placez d'abord tous les symptômes aux bons endroits du corps.");
  }

  const active = CARDS.find((c) => c.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-[#ece7df] px-3 py-4 sm:px-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button onClick={onHome} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            ← Accueil
          </button>
          <h1 className="rounded-full bg-zinc-800 px-5 py-2 text-lg font-bold text-white">Fresque TMS</h1>
          <button onClick={reset} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">
            Tout recommencer
          </button>
        </header>

        <p className="mb-4 text-center text-sm font-semibold text-slate-800">{STAGE_LABEL[stage]}</p>
        {message ? (
          <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-center text-sm font-medium text-slate-800 shadow">{message}</p>
        ) : null}

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(280px,520px)_minmax(220px,1fr)]">
          <aside className="space-y-4">
            {stage !== "prevention"
              ? grouped.map(([fam, cards]) => (
                  <section key={fam}>
                    <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{fam}</h2>
                    <div className="flex flex-col gap-2">
                      {cards.map((c) => (
                        <Chip key={c.id} card={c} blinking={!!blinking[c.id]} />
                      ))}
                    </div>
                  </section>
                ))
              : null}
          </aside>

          <section className="relative mx-auto w-full max-w-[520px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/perso.jpg" alt="" className="mx-auto block h-auto w-full max-h-[86vh] object-contain" />
            {ZONES.map((z) => (
              <ZoneSlot key={z.id} zone={z} placed={CARDS.filter((c) => placed[c.id] === z.id)} />
            ))}
          </section>

          <aside className="space-y-4">
            {stage === "prevention"
              ? grouped.map(([fam, cards]) => (
                  <section key={fam}>
                    <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{fam}</h2>
                    <div className="flex flex-col gap-2">
                      {cards.map((c) => (
                        <Chip key={c.id} card={c} blinking={!!blinking[c.id]} />
                      ))}
                    </div>
                  </section>
                ))
              : null}
          </aside>
        </div>
      </div>
      <DragOverlay>{active ? <div className={`chip chip-${active.kind}`}>{active.title}</div> : null}</DragOverlay>
    </DndContext>
  );
}
