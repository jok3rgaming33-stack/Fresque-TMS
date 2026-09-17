"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FormateurGate from "@/components/FormateurGate";
import { clientId } from "@/lib/storage";
import { normalizeMember } from "@/lib/names";
import { roomFetch, roomGet, type AttendanceSlot, type Member, type RoomState } from "@/lib/room";

function Inner() {
  const code = (useSearchParams().get("code") || "").toUpperCase();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const me = typeof window !== "undefined" ? clientId() : "";

  useEffect(() => {
    if (!code) return;
    let stop = false;
    async function load() {
      try {
        const r = await roomGet(code);
        if (!stop) {
          if (!r) setError("Atelier introuvable");
          else setRoom(r);
        }
      } catch {
        if (!stop) setError("Atelier introuvable");
      }
    }
    load();
    const t = setInterval(load, 1500);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [code]);

  const participants = (room?.members ?? []).filter((m) => m.role !== "hote").map(normalizeMember);
  const date = room?.createdAt ? new Date(room.createdAt) : new Date();
  const dateLabel = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  async function kick(target: Member) {
    if (!window.confirm(`Retirer ${target.firstName} ${target.lastName} ?`)) return;
    setRoom(await roomFetch({ type: "kick", code, clientId: me, targetId: target.id }));
  }

  async function toggle(target: Member, slot: AttendanceSlot) {
    const current = target.attendance?.[slot] ?? false;
    setRoom(await roomFetch({ type: "set-attendance", code, clientId: me, targetId: target.id, slot, present: !current }));
  }

  if (!code) {
    return (
      <div className="mx-auto max-w-lg px-5 py-12">
        <p>Indiquez le code atelier dans l’adresse.</p>
        <Link href="/formateur" className="mt-4 inline-block text-[var(--gold)]">
          ← Espace formateur
        </Link>
      </div>
    );
  }

  if (error) return <p className="p-8">{error}</p>;
  if (!room) return <p className="p-8">Chargement…</p>;

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <Link href="/formateur" className="text-sm text-[var(--muted)] print:hidden">
        ← Espace formateur
      </Link>
      <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Feuille d’émargement</p>
      <h1 className="mt-2 font-serif text-4xl">Présences</h1>
      <p className="mt-2 text-sm capitalize text-[var(--muted)]">
        {dateLabel} · code {room.code}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)] print:hidden">Cochez matin et/ou après-midi. La feuille se prête à une demi-journée ou à une journée complète.</p>

      <div className="mt-6 overflow-x-auto border border-[var(--line)]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--panel)] text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">Nom</th>
              <th className="px-3 py-3 font-medium">Prénom</th>
              <th className="px-3 py-3 text-center font-medium">Matin</th>
              <th className="px-3 py-3 text-center font-medium">Après-midi</th>
              <th className="px-3 py-3 print:hidden" />
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-[var(--muted)]">
                  Aucun participant pour le moment.
                </td>
              </tr>
            ) : (
              participants.map((p) => (
                <tr key={p.id} className="border-t border-[var(--line)]">
                  <td className="px-3 py-3 font-semibold">{(p.lastName || "").toUpperCase()}</td>
                  <td className="px-3 py-3">{p.firstName}</td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={Boolean(p.attendance?.matin)}
                      onChange={() => toggle(p, "matin")}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={Boolean(p.attendance?.["apres-midi"])}
                      onChange={() => toggle(p, "apres-midi")}
                    />
                  </td>
                  <td className="px-3 py-3 text-right print:hidden">
                    <button type="button" className="text-xs text-[#C0392B]" onClick={() => kick(p)}>
                      Retirer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button type="button" className="min-h-11 bg-[var(--gold)] px-5 font-semibold text-[#1a140c]" onClick={() => window.print()}>
          Imprimer
        </button>
        <Link href={`/atelier/salle?code=${room.code}`} className="flex min-h-11 items-center border border-[var(--line)] px-5 text-sm">
          Retour à la fresque
        </Link>
      </div>
    </div>
  );
}

export default function EmargementPage() {
  return (
    <FormateurGate>
      <Suspense>
        <Inner />
      </Suspense>
    </FormateurGate>
  );
}
