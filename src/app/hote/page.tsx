"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientId } from "@/lib/storage";
import { roomFetch, type RoomState } from "@/lib/room";

export default function HotePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

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
    const join = `${origin}/atelier/rejoindre?code=${room.code}`;
    return (
      <div className="mx-auto max-w-lg space-y-5 p-6">
        <h1 className="text-2xl font-bold">Atelier {room.code}</h1>
        <p className="text-[var(--muted)]">Les collaborateurs scannent le QR ou saisissent le code.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`QR ${room.code}`}
          className="mx-auto rounded-2xl bg-white p-3"
          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(join)}`}
        />
        <p className="text-center text-4xl font-black tracking-[0.4em]">{room.code}</p>
        <button
          type="button"
          className="min-h-12 w-full rounded-full bg-white font-bold text-[#121417]"
          onClick={() => router.push(`/atelier/salle?code=${room.code}`)}
        >
          Ouvrir la fresque hôte
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={create} className="mx-auto mt-16 max-w-md space-y-4 rounded-3xl bg-[#1a1d21] p-8">
      <h1 className="text-xl font-bold">Créer un atelier</h1>
      <label className="block text-sm">
        Votre prénom
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 min-h-12 w-full rounded-2xl bg-white/10 px-4" />
      </label>
      {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
      <button type="submit" className="min-h-12 w-full rounded-full bg-white font-bold text-[#121417]">
        Générer le code
      </button>
    </form>
  );
}
