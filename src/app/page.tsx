"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSolo } from "@/lib/storage";

export default function HomePage() {
  const [hasSave, setHasSave] = useState(false);
  useEffect(() => setHasSave(Boolean(loadSolo())), []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#1a1d21] p-8 shadow-2xl sm:p-10">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-r from-[#C0392B] via-zinc-600 to-[#3D9A5F] px-8 py-3 text-2xl font-bold text-white">
            Fresque TMS
          </div>
        </div>
        <h1 className="mb-3 text-center text-xl font-bold sm:text-2xl">Formation aux Troubles Musculo-Squelettiques</h1>
        <p className="mb-6 text-center text-base leading-relaxed text-[var(--muted)]">
          Associez les cartes pédagogiques sur le corps humain pour comprendre le lien <strong className="text-white">Causes</strong> →{" "}
          <strong className="text-white">Symptômes</strong> → <strong className="text-white">Moyens de prévention</strong>.
        </p>
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#3A3F46] p-4 text-center text-sm font-semibold">Causes (gris)</div>
          <div className="rounded-2xl bg-[#C0392B] p-4 text-center text-sm font-semibold">Symptômes (rouge)</div>
          <div className="rounded-2xl bg-[#3D9A5F] p-4 text-center text-sm font-semibold text-[#0f1a12]">Préventions (vert)</div>
        </div>
        <ol className="mb-8 list-decimal space-y-2 pl-5 text-sm">
          <li>Placez d&apos;abord tous les symptômes aux bons endroits du corps.</li>
          <li>Une fois validés, les causes se déverrouillent, puis les moyens de prévention.</li>
          <li>Touchez une carte pour voir le détail, puis la zone du corps.</li>
          <li>En cas d&apos;erreur, la carte clignote et revient dans le jeu.</li>
        </ol>
        <div className="flex flex-col gap-3">
          <Link href="/hote" className="flex min-h-12 items-center justify-center rounded-full bg-white text-base font-bold text-[#121417]">
            Commencer l&apos;atelier
          </Link>
          <Link href="/atelier/rejoindre" className="flex min-h-12 items-center justify-center rounded-full bg-white/10 font-semibold">
            Rejoindre un atelier
          </Link>
          <Link href="/table" className="flex min-h-12 items-center justify-center rounded-full bg-white/10 font-semibold">
            Autour de la table
          </Link>
          <Link href="/atelier?solo=1" className="flex min-h-11 items-center justify-center text-sm text-[var(--muted)]">
            Réviser seul
          </Link>
          {hasSave ? (
            <Link href="/atelier?solo=1" className="text-center text-sm font-semibold text-[#3D9A5F]">
              Reprendre
            </Link>
          ) : null}
          <Link href="/hote" className="text-center text-sm text-[var(--muted)]">
            Mode formateur
          </Link>
        </div>
      </div>
    </div>
  );
}
