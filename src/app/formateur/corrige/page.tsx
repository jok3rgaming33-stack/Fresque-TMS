"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CARDS, type Kind } from "@/data/cards";
import { zoneLabel } from "@/data/zones";
import { isFormateur } from "@/lib/role";

const GROUPS: { kind: Kind; title: string }[] = [
  { kind: "symptome", title: "Symptômes" },
  { kind: "cause", title: "Causes" },
  { kind: "prevention", title: "Moyens de prévention" },
];

export default function CorrigePage() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => setOk(isFormateur()), []);

  if (ok === null) return null;
  if (!ok) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
        <h1 className="font-serif text-3xl">Corrigé réservé</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Cette page n’est accessible que depuis l’espace formateur.</p>
        <Link href="/" className="mt-8 text-[var(--gold)]">
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-5 py-10">
      <Link href="/formateur" className="text-sm text-[var(--muted)]">
        ← Espace formateur
      </Link>
      <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Document interne</p>
      <h1 className="mt-2 font-serif text-4xl">Corrigé</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Emplacements justes pour chaque carte. À ne pas projeter pendant que le groupe cherche.
      </p>
      <div className="gold-line my-8" />
      {GROUPS.map((g) => (
        <section key={g.kind} className="mb-12">
          <h2 className="font-serif text-2xl">{g.title}</h2>
          <div className="mt-4 overflow-hidden border border-[var(--line)]">
            {CARDS.filter((c) => c.kind === g.kind).map((c, i) => (
              <div
                key={c.id}
                className={`grid gap-2 px-4 py-3 text-sm md:grid-cols-[1.2fr_1fr_1.4fr] ${i % 2 ? "bg-white/[0.03]" : ""}`}
              >
                <p className="font-semibold">{c.title}</p>
                <p className="text-[var(--muted)]">{c.family}</p>
                <p className="text-[var(--gold-2)]">{c.zones.map(zoneLabel).join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
