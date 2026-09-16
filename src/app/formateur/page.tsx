"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";
import FormateurGate from "@/components/FormateurGate";
import { SITUATIONS, type SituationId } from "@/data/cards";
import { clientId } from "@/lib/storage";
import { roomFetch, type RoomState } from "@/lib/room";

function Inner() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [situationId, setSituationId] = useState<SituationId>("tampons");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await roomFetch({
        type: "create",
        clientId: clientId(),
        name: name.trim() || "Formateur",
        situationId,
      });
      setRoom(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  if (room) {
    const join = `${origin}/participants?code=${room.code}`;
    const sit = SITUATIONS.find((s) => s.id === room.situationId);
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12">
        <Brand compact />
        <div className="mt-10 border border-[var(--line)] bg-[var(--panel)] p-8">
          <p className="text-center text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Salle ouverte</p>
          <p className="mt-2 text-center text-sm text-[var(--muted)]">
            Fresque N° {sit?.fresque} — {sit?.title}
          </p>
          <p className="mt-4 text-center font-serif text-6xl tracking-[0.28em]">{room.code}</p>
          <p className="mt-3 text-center text-sm text-[var(--muted)]">Les participant(e)s scannent le QR ou saisissent ce code.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`QR ${room.code}`}
            className="mx-auto mt-6 bg-white p-3"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(join)}`}
          />
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              className="min-h-12 bg-[var(--gold)] font-semibold tracking-wide text-[#1a140c]"
              onClick={() => router.push(`/atelier/salle?code=${room.code}`)}
            >
              Ouvrir la fresque
            </button>
            <Link href={`/formateur/corrige?situation=${room.situationId}`} className="flex min-h-12 items-center justify-center border border-[var(--line)] text-sm font-semibold">
              Ouvrir le corrigé
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fresque1 = SITUATIONS.filter((s) => s.fresque === 1);
  const fresque2 = SITUATIONS.filter((s) => s.fresque === 2);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-8 text-sm text-[var(--muted)]">
        ← Accueil
      </Link>
      <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Espace formateur</p>
      <h1 className="mt-3 font-serif text-4xl">Créer l’atelier</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Choisissez la fresque et la situation. Le corrigé reste de votre côté.
      </p>
      <form onSubmit={create} className="mt-8 space-y-6">
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Votre prénom
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 min-h-12 w-full border border-[var(--line)] bg-transparent px-4"
          />
        </label>

        <fieldset>
          <legend className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Situation de travail</legend>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {[
              { n: 1, list: fresque1 },
              { n: 2, list: fresque2 },
            ].map((block) => (
              <div key={block.n} className="border border-[var(--line)] bg-[var(--panel)] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--gold)]">Fresque N° {block.n}</p>
                <div className="mt-3 space-y-2">
                  {block.list.map((s) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-start gap-3 border px-3 py-3 text-sm ${
                        situationId === s.id ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-transparent bg-white/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name="situation"
                        className="mt-1"
                        checked={situationId === s.id}
                        onChange={() => setSituationId(s.id)}
                      />
                      <span>
                        <span className="block font-semibold">{s.short}</span>
                        <span className="block text-xs text-[var(--muted)]">{s.title}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
        <button type="submit" className="min-h-12 w-full bg-[var(--gold)] font-semibold text-[#1a140c]">
          Générer le code
        </button>
      </form>
      <div className="mt-6 flex flex-col items-center gap-2 text-sm">
        <Link href={`/formateur/corrige?situation=${situationId}`} className="text-[var(--gold)]">
          Consulter le corrigé
        </Link>
        <Link href={`/table?situation=${situationId}`} className="text-[var(--muted)]">
          Un seul appareil autour de la table
        </Link>
      </div>
    </div>
  );
}

export default function FormateurPage() {
  return (
    <FormateurGate>
      <Inner />
    </FormateurGate>
  );
}
