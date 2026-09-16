"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FormateurGate from "@/components/FormateurGate";
import { SITUATIONS, cardsFor, type SituationId } from "@/data/cards";
import { associationsFor } from "@/data/associations";
import { zoneLabel } from "@/data/zones";

function Inner() {
  const preset = useSearchParams().get("situation") as SituationId | null;
  const [situationId, setSituationId] = useState<SituationId>(
    SITUATIONS.some((s) => s.id === preset) ? (preset as SituationId) : "tampons",
  );
  const sit = SITUATIONS.find((s) => s.id === situationId)!;
  const groups = associationsFor(situationId);
  const copies = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cardsFor(situationId)) {
      map.set(c.baseId, (map.get(c.baseId) ?? 0) + 1);
    }
    return map;
  }, [situationId]);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 py-10">
      <Link href="/formateur" className="text-sm text-[var(--muted)]">
        ← Espace formateur
      </Link>
      <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Document interne</p>
      <h1 className="mt-2 font-serif text-4xl">Corrigé</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Associations symptômes — causes — moyens de prévention, par zone. À ne pas projeter pendant que le groupe cherche.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {SITUATIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSituationId(s.id)}
            className={`min-h-11 border px-4 text-sm ${
              situationId === s.id ? "border-[var(--gold)] bg-[var(--gold)] text-[#1a140c]" : "border-[var(--line)]"
            }`}
          >
            N° {s.fresque} · {s.short}
          </button>
        ))}
      </div>

      <div className="gold-line my-8" />
      <h2 className="font-serif text-3xl">{sit.title}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Fresque N° {sit.fresque}</p>

      {groups.map((g) => (
        <section key={`${g.situation}-${g.index}`} className="mt-10 border border-[var(--line)]">
          <header className="border-b border-[var(--line)] bg-[var(--panel)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">Groupe {g.index}</p>
            <p className="font-serif text-xl">{g.zones.map(zoneLabel).join(" · ")}</p>
          </header>
          <div className="grid gap-0 md:grid-cols-3">
            {(
              [
                ["Symptômes", g.symptoms],
                ["Causes", g.causes],
                ["Moyens de prévention", g.preventions],
              ] as const
            ).map(([title, list]) => (
              <div key={title} className="border-t border-[var(--line)] px-4 py-4 md:border-l md:border-t-0 md:first:border-l-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{title}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {list.map((item, i) => (
                    <li key={`${item}-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-12">
        <h3 className="font-serif text-2xl">Cartes en plusieurs exemplaires</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">Le signe + de la feuille de route correspond à ces copies, à placer sur une autre zone.</p>
        <div className="mt-4 overflow-hidden border border-[var(--line)]">
          {cardsFor(situationId)
            .filter((c) => (copies.get(c.baseId) ?? 1) > 1 && c.id === c.baseId)
            .map((c, i) => (
              <div key={c.id} className={`grid gap-2 px-4 py-3 text-sm md:grid-cols-[1.4fr_0.6fr] ${i % 2 ? "bg-white/[0.03]" : ""}`}>
                <p className="font-semibold">{c.title}</p>
                <p className="text-[var(--gold-2)]">{copies.get(c.baseId)} exemplaires</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

export default function CorrigePage() {
  return (
    <FormateurGate>
      <Suspense>
        <Inner />
      </Suspense>
    </FormateurGate>
  );
}
