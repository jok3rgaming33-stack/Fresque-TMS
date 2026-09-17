"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clientId } from "@/lib/storage";
import { setAppRole } from "@/lib/role";
import { DEMO_CODE, roomFetch } from "@/lib/room";

function Form() {
  const router = useRouter();
  const preset = useSearchParams().get("code") || "";
  const [code, setCode] = useState(preset);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [slot, setSlot] = useState<"matin" | "apres-midi" | "journee">("matin");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setAppRole("participant"), []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    try {
      const room = await roomFetch({
        type: "join",
        code: code.trim().toUpperCase(),
        clientId: clientId(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        slot,
      });
      sessionStorage.setItem("fresque-tms-code", room.code);
      router.push(`/atelier/salle?code=${room.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de rejoindre");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-8 text-sm text-[var(--muted)]">
        ← Accueil
      </Link>
      <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Espace participant(e)s</p>
      <h1 className="mt-3 font-serif text-4xl">Rejoindre</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Saisissez le code, votre nom et prénom. Pour un essai, code {DEMO_CODE}.
      </p>
      <form onSubmit={join} className="mt-8 space-y-4">
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Code atelier
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 min-h-12 w-full border border-[var(--line)] bg-transparent px-4 uppercase tracking-[0.3em]"
            required
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Prénom
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-2 min-h-12 w-full border border-[var(--line)] bg-transparent px-4"
            required
          />
        </label>
        <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Nom
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-2 min-h-12 w-full border border-[var(--line)] bg-transparent px-4"
            required
          />
        </label>
        <fieldset>
          <legend className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Émargement</legend>
          <div className="mt-2 grid gap-2">
            {(
              [
                ["matin", "Matin"],
                ["apres-midi", "Après-midi"],
                ["journee", "Journée complète"],
              ] as const
            ).map(([id, label]) => (
              <label key={id} className={`flex min-h-11 cursor-pointer items-center gap-3 border px-3 text-sm ${slot === id ? "border-[var(--gold)]" : "border-[var(--line)]"}`}>
                <input type="radio" name="slot" checked={slot === id} onChange={() => setSlot(id)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
        <button type="submit" className="min-h-12 w-full bg-[var(--gold)] font-semibold text-[#1a140c]">
          Entrer dans l’atelier
        </button>
      </form>
    </div>
  );
}

export default function ParticipantsPage() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
