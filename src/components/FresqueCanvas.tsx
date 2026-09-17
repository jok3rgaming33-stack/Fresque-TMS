"use client";

import { CARDS, type Card } from "@/data/cards";
import { frescoLinks } from "@/lib/game";
import type { ZoneId } from "@/data/zones";
import BodyMap from "./BodyMap";
import { useState } from "react";

export default function FresqueCanvas({
  placements,
}: {
  placements: Record<string, ZoneId>;
}) {
  const [open, setOpen] = useState<Card | null>(null);
  const [understood, setUnderstood] = useState<string[]>([]);
  const placed = Object.keys(placements)
    .map((id) => CARDS.find((c) => c.id === id))
    .filter((c): c is Card => Boolean(c));
  const causes = placed.filter((c) => c.kind === "cause");
  const prev = placed.filter((c) => c.kind === "prevention");
  const links = frescoLinks(placements);

  function col(list: Card[], color: string) {
    const fam = new Map<string, Card[]>();
    for (const c of list) {
      const arr = fam.get(c.family) ?? [];
      arr.push(c);
      fam.set(c.family, arr);
    }
    return (
      <div className="space-y-4">
        {[...fam.entries()].map(([f, cs]) => (
          <section key={f}>
            <h2 className="mb-2 text-xs font-bold uppercase text-[var(--muted)]">{f}</h2>
            <div className="space-y-2">
              {cs.map((c) => (
                <button key={c.id} type="button" onClick={() => setOpen(c)} className={`chip chip-${c.kind} w-full`}>
                  {c.title}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_minmax(280px,520px)_1fr]">
      {col(causes, "cause")}
      <BodyMap selected={null} placements={placements} onZone={() => undefined} onPin={(id) => setOpen(CARDS.find((c) => c.id === id) ?? null)} />
      {col(prev, "prevention")}
      {open ? (
        <aside className="border border-[var(--line)] bg-[var(--panel)] p-5 lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">{open.family}</p>
          <h3 className="mt-1 font-serif text-2xl">{open.title}</h3>
          <p className="mt-2 text-sm leading-relaxed">{open.description}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{links.filter((l) => l.from === open.id || l.to === open.id).length} lien(s) sur la fresque</p>
          <button
            type="button"
            className="mt-4 min-h-11 bg-[var(--gold)] px-4 font-semibold text-[#1a140c]"
            onClick={() => setUnderstood((xs) => (xs.includes(open.id) ? xs : [...xs, open.id]))}
          >
            {understood.includes(open.id) ? "Compris" : "Marquer comme compris"}
          </button>
        </aside>
      ) : null}
    </div>
  );
}
