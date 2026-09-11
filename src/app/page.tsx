"use client";

import { useState } from "react";
import Atelier from "@/components/Atelier";

export default function Page() {
  const [started, setStarted] = useState(false);
  if (started) return <Atelier onHome={() => setStarted(false)} />;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100 via-stone-100 to-emerald-100" />
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/60 bg-white/85 p-8 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-r from-red-600 via-zinc-700 to-emerald-700 px-8 py-3 text-2xl font-bold tracking-wide text-white shadow-lg sm:text-3xl">
            Fresque TMS
          </div>
        </div>
        <h1 className="mb-3 text-center text-xl font-bold text-slate-900 sm:text-2xl">
          Formation aux Troubles Musculo-Squelettiques
        </h1>
        <p className="mb-6 text-center text-sm leading-relaxed text-slate-600 sm:text-base">
          Associez les cartes pédagogiques sur le corps humain pour comprendre le lien <strong>Causes</strong> →{" "}
          <strong>Symptômes</strong> → <strong>Moyens de prévention</strong>.
        </p>
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-zinc-800 p-4 text-center text-white shadow">
            <p className="text-xs font-semibold">Causes (gris)</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-b from-red-400 to-red-700 p-4 text-center text-white shadow">
            <p className="text-xs font-semibold">Symptômes (rouge)</p>
          </div>
          <div className="rounded-2xl bg-[#95d18d] p-4 text-center text-zinc-900 shadow">
            <p className="text-xs font-semibold">Préventions (vert)</p>
          </div>
        </div>
        <ol className="mb-8 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Placez d&apos;abord tous les <strong>symptômes</strong> aux bons endroits du corps.</li>
          <li>Une fois validés, les <strong>causes</strong> se déverrouillent, puis les <strong>moyens de prévention</strong>.</li>
          <li>Seul l&apos;intitulé est visible : survolez une carte pour voir l&apos;illustration et le descriptif.</li>
          <li>En cas d&apos;erreur de positionnement, la carte clignote et revient dans le jeu.</li>
        </ol>
        <div className="flex justify-center">
          <button
            onClick={() => setStarted(true)}
            className="rounded-full bg-zinc-900 px-10 py-3 text-base font-bold text-white shadow-lg hover:bg-zinc-800"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}
