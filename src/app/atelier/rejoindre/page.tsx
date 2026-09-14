"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clientId } from "@/lib/storage";
import { roomFetch } from "@/lib/room";

function Form() {
  const router = useRouter();
  const preset = useSearchParams().get("code") || "";
  const [code, setCode] = useState(preset);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    try {
      const room = await roomFetch({
        type: "join",
        code: code.trim().toUpperCase(),
        clientId: clientId(),
        name: name.trim() || "Anonyme",
      });
      sessionStorage.setItem("fresque-tms-code", room.code);
      router.push(`/atelier/salle?code=${room.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de rejoindre");
    }
  }

  return (
    <form onSubmit={join} className="mx-auto mt-16 max-w-md space-y-4 rounded-3xl bg-[#1a1d21] p-8">
      <h1 className="text-xl font-bold">Rejoindre un atelier</h1>
      <label className="block text-sm">
        Code
        <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 min-h-12 w-full rounded-2xl bg-white/10 px-4 uppercase" required />
      </label>
      <label className="block text-sm">
        Prénom
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 min-h-12 w-full rounded-2xl bg-white/10 px-4" required />
      </label>
      {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
      <button type="submit" className="min-h-12 w-full rounded-full bg-white font-bold text-[#121417]">
        Entrer
      </button>
    </form>
  );
}

export default function RejoindrePage() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
