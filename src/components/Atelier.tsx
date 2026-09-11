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
import { CARDS, COMBOS, ZONES, type CardKind, type GameCard, type ZoneId } from "@/data/catalog";

const KIND_LABEL: Record<CardKind | "all", string> = {
  all: "Toutes",
  cause: "Causes",
  symptome: "Symptômes",
  prevention: "Préventions",
};

function Chip({ card }: { card: GameCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`chip chip-${card.kind} ${isDragging ? "opacity-40" : ""}`}
      {...listeners}
      {...attributes}
    >
      <span>{card.title}</span>
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
    <div ref={setNodeRef} className={`zone-hot ${isOver ? "over" : ""}`} style={zone.style} title={zone.label}>
      <p className="pointer-events-none absolute -top-5 left-1/2 w-max -translate-x-1/2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow">
        {zone.label}
        {placed.length ? ` · ${placed.length}` : ""}
      </p>
      <div className="flex h-full flex-col justify-end gap-1 p-1">
        {placed.slice(0, 4).map((c) => (
          <span key={c.id} className={`chip chip-${c.kind} !min-h-7 !px-2 !py-1 !text-[10px]`}>
            {c.title}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Atelier({ onHome }: { onHome: () => void }) {
  const [filter, setFilter] = useState<CardKind | "all">("all");
  const [placed, setPlaced] = useState<Record<string, ZoneId>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const pool = useMemo(() => {
    return CARDS.filter((c) => (filter === "all" ? true : c.kind === filter) && !placed[c.id]);
  }, [filter, placed]);

  const grouped = useMemo(() => {
    const map = new Map<string, GameCard[]>();
    for (const c of pool) {
      const arr = map.get(c.family) ?? [];
      arr.push(c);
      map.set(c.family, arr);
    }
    return [...map.entries()];
  }, [pool]);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const over = e.over?.id ? String(e.over.id) : null;
    const id = String(e.active.id);
    if (over && ZONES.some((z) => z.id === over)) {
      setPlaced((p) => ({ ...p, [id]: over as ZoneId }));
      setMessage(null);
    }
  }

  function verify() {
    const dropped = Object.entries(placed);
    if (!dropped.length) {
      setMessage("Placez d'abord des cartes sur le personnage.");
      return;
    }
    const hits = COMBOS.filter((combo) => {
      const ids = new Set(dropped.map(([id]) => id));
      const matchCards = combo.cards.filter((id) => ids.has(id)).length >= 2;
      const matchZone = dropped.some(([, z]) => combo.zones.includes(z));
      return matchCards && matchZone;
    });
    if (hits.length) {
      setMessage(`Association(s) reconnue(s) : ${hits.map((h) => h.title).join(" · ")}`);
    } else {
      setMessage("Pas encore d'association complète. Survolez une carte pour relire le détail, puis replacez-la sur la bonne zone du corps.");
    }
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
          <div className="flex gap-2">
            <button onClick={() => { setPlaced({}); setMessage(null); }} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">
              Tout recommencer
            </button>
            <button onClick={verify} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
              Vérifier
            </button>
          </div>
        </header>

        {message ? (
          <p className="mb-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow">{message}</p>
        ) : (
          <p className="mb-3 text-center text-xs text-slate-600">
            Cartes horizontales : seul l&apos;intitulé est visible. Survolez pour voir l&apos;illustration et le texte. Déposez-les sur le personnage.
          </p>
        )}

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {(["all", "cause", "symptome", "prevention"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${filter === k ? "bg-zinc-800 text-white" : "bg-white text-slate-700"}`}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(280px,520px)_minmax(220px,1fr)]">
          <aside className="space-y-4">
            {grouped.filter(([fam]) => CARDS.find((c) => c.family === fam)?.kind !== "prevention").map(([fam, cards]) => (
              <section key={fam}>
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{fam}</h2>
                <div className="flex flex-col gap-2">
                  {cards.map((c) => (
                    <Chip key={c.id} card={c} />
                  ))}
                </div>
              </section>
            ))}
          </aside>

          <section className="relative mx-auto w-full max-w-[520px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/perso.jpg" alt="Modèle de positionnement TMS" className="mx-auto block h-auto w-full max-h-[86vh] object-contain" />
            {ZONES.map((z) => (
              <ZoneSlot key={z.id} zone={z} placed={CARDS.filter((c) => placed[c.id] === z.id)} />
            ))}
          </section>

          <aside className="space-y-4">
            {grouped.filter(([fam]) => CARDS.find((c) => c.family === fam)?.kind === "prevention").map(([fam, cards]) => (
              <section key={fam}>
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{fam}</h2>
                <div className="flex flex-col gap-2">
                  {cards.map((c) => (
                    <Chip key={c.id} card={c} />
                  ))}
                </div>
              </section>
            ))}
          </aside>
        </div>
      </div>
      <DragOverlay>{active ? <div className={`chip chip-${active.kind}`}>{active.title}</div> : null}</DragOverlay>
    </DndContext>
  );
}
