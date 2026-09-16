"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";
import { clientId } from "@/lib/storage";
import { setAppRole } from "@/lib/role";
import { roomFetch, type RoomState } from "@/lib/room";

export default function FormateurPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => setAppRole("formateur"), []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await roomFetch({ type: "create", clientId: clientId(), name: name.trim() || "Formateur" });
      setRoom(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  if (room) {
    const join = `${origin}/participants?code=${room.code}`;
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12">
        <Brand compact />
        <div className="mt-10 border border-[var(--line)] bg-[var(--panel)] p-8">
          <p className="text-center text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Salle ouverte</p>
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
            <Link href="/formateur/corrige" className="flex min-h-12 items-center justify-center border border-[var(--line)] text-sm font-semibold">
              Ouvrir le corrigé
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <Link href="/" className="mb-8 text-sm text-[var(--muted)]">
        ← Accueil
      </Link>
      <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Espace formateur</p>
      <h1 className="mt-3 font-serif text-4xl">Créer l’atelier</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Vous cadrez la séance, voyez le corrigé, et projetez le plateau. Les participant(e)s n’y ont pas accès.
      </p>
      <form onSubmit={create} className="mt-8 space-y-4">
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Votre prénom
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 min-h-12 w-full border border-[var(--line)] bg-transparent px-4"
          />
        </label>
        {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
        <button type="submit" className="min-h-12 w-full bg-[var(--gold)] font-semibold text-[#1a140c]">
          Générer le code
        </button>
      </form>
      <Link href="/formateur/corrige" className="mt-6 text-center text-sm text-[var(--gold)]">
        Consulter le corrigé sans lancer de salle
      </Link>
    </div>
  );
}
