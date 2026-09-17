"use client";

import Link from "next/link";
import Brand from "@/components/Brand";
import { setAppRole } from "@/lib/role";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/perso.png" alt="" className="mx-auto mb-6 h-28 w-auto object-contain sm:h-36" />
      <Brand />
      <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-[var(--muted)]">
        Atelier collectif pour relier <span className="text-[var(--text)]">symptômes</span>,{" "}
        <span className="text-[var(--text)]">causes</span> et{" "}
        <span className="text-[var(--text)]">moyens de prévention</span> des troubles musculo-squelettiques.
      </p>
      <div className="gold-line mx-auto my-8 max-w-xs" />

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/formateur" className="border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">Accès formateur</p>
          <h2 className="mt-2 font-serif text-3xl">Formateur</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Créez la salle, projetez la fresque, suivez le groupe. Le corrigé reste visible uniquement de votre côté.
          </p>
          <span className="mt-6 flex min-h-12 items-center justify-center bg-[var(--gold)] font-semibold tracking-wide text-[#1a140c]">
            Entrer
          </span>
        </Link>

        <Link href="/participants" onClick={() => setAppRole("participant")} className="border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">Accès atelier</p>
          <h2 className="mt-2 font-serif text-3xl">Participant(e)s</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Rejoignez la salle avec un code. Posez les cartes, discutez, votez. Aucun corrigé n’est affiché.
          </p>
          <span className="mt-6 flex min-h-12 items-center justify-center bg-[var(--gold)] font-semibold tracking-wide text-[#1a140c]">
            Entrer
          </span>
        </Link>
      </div>
    </div>
  );
}
