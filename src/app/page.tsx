"use client";

import Link from "next/link";
import Brand from "@/components/Brand";
import { setAppRole } from "@/lib/role";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-y-0 right-[-8%] hidden w-[42%] opacity-25 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/perso.jpg" alt="" className="h-full w-full object-contain object-right" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <Brand />
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-[var(--muted)]">
          Atelier collectif pour relier <span className="text-[var(--text)]">symptômes</span>,{" "}
          <span className="text-[var(--text)]">causes</span> et{" "}
          <span className="text-[var(--text)]">moyens de prévention</span> des troubles musculo-squelettiques.
        </p>
        <div className="gold-line mx-auto my-10 max-w-xs" />

        <div className="grid gap-5 md:grid-cols-2">
          <Link href="/formateur" className="access-card group rounded-sm p-8 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">Accès formateur</p>
            <h2 className="mt-4 font-serif text-4xl">Formateur</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Créez la salle, projetez la fresque, suivez le groupe. Le corrigé et les zones justes restent visibles uniquement de votre côté.
            </p>
            <p className="mt-8 text-sm font-semibold tracking-wide text-[var(--gold-2)] group-hover:underline">
              Entrer →
            </p>
          </Link>

          <Link href="/participants" onClick={() => setAppRole("participant")} className="access-card group rounded-sm p-8 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">Accès atelier</p>
            <h2 className="mt-4 font-serif text-4xl">Participant(e)s</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Rejoignez la salle avec un code. Posez les cartes, discutez, votez. Aucun corrigé n’est affiché.
            </p>
            <p className="mt-8 text-sm font-semibold tracking-wide text-[var(--gold-2)] group-hover:underline">
              Entrer →
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
