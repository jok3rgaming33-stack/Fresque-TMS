"use client";

import { GROUP_COLORS, associationsFor } from "@/data/associations";
import { zoneLabel } from "@/data/zones";

export default function DebriefPanel({ situation }: { situation: string }) {
  const groups = associationsFor(situation);
  return (
    <div className="debrief-panel">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">Débrief collectif</p>
      <h2 className="mt-1 font-serif text-2xl">Fils Symptômes → Causes → Préventions</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Chaque couleur relie un trio de la feuille de route. Les fils apparaissent aussi sur le personnage.
      </p>
      <div className="mt-4 space-y-4">
        {groups.map((g, i) => (
          <section
            key={`${g.situation}-${g.index}`}
            className="border p-3"
            style={{ borderColor: GROUP_COLORS[i % GROUP_COLORS.length] }}
          >
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: GROUP_COLORS[i % GROUP_COLORS.length] }}>
              {g.zones.map(zoneLabel).join(" · ")}
            </p>
            <p className="mt-2 text-center text-xs text-[var(--muted)]">symptômes → causes → préventions</p>
            <div className="mt-2 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#c44536]">Symptômes</p>
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
                <p className="text-[10px] uppercase tracking-wide text-[#3d9a5f]">Préventions</p>
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
