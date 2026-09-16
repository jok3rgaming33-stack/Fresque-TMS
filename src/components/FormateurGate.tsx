"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isFormateurUnlocked, unlockFormateur } from "@/lib/role";

export default function FormateurGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => setOk(isFormateurUnlocked()), []);

  if (ok === null) return null;

  if (!ok) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <Link href="/" className="mb-8 text-sm text-[var(--muted)]">
          ← Accueil
        </Link>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Espace formateur</p>
        <h1 className="mt-3 font-serif text-4xl">Identification</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Saisissez le mot de passe formateur pour ouvrir la salle, le corrigé et le plateau.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (unlockFormateur(password)) setOk(true);
            else setError(true);
          }}
        >
          <label className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            Mot de passe
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="mt-2 min-h-12 w-full border border-[var(--line)] bg-transparent px-4"
              required
            />
          </label>
          {error ? <p className="text-sm text-[#C0392B]">Mot de passe incorrect.</p> : null}
          <button type="submit" className="min-h-12 w-full bg-[var(--gold)] font-semibold text-[#1a140c]">
            Entrer
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
