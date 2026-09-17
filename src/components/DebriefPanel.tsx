"use client";

import { associationsFor } from "@/data/associations";
import { zoneLabel } from "@/data/zones";

export default function DebriefPanel({ situation }: { situation: string }) {
  const groups = associationsFor(situation);
  return (
    <div className="debrief-panel">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">Débrief collectif</p>
      <h2 className="mt-1 font-serif text-2xl">Associations de référence</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Le formateur vient d’ouvrir le corrigé pour le groupe.</p>
      <div className="mt-4 space-y-4">
        {groups.map((g) => (
          <section key={`${g.situation}-${g.index}`} className="border border-[var(--line)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">
              {g.zones.map(zoneLabel).join(" · ")}
            </p>
            <div className="mt-2 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Symptômes</p>
                <ul className="mt-1 space-y-1">
                  {g.symptoms.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Causes</p>
                <ul className="mt-1 space-y-1">
                  {g.causes.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Préventions</p>
                <ul className="mt-1 space-y-1">
                  {g.preventions.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
