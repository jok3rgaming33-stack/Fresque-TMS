"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FresqueCanvas from "@/components/FresqueCanvas";
import { loadSolo } from "@/lib/storage";
import { roomGet } from "@/lib/room";
import type { ZoneId } from "@/data/zones";

function Inner() {
  const code = useSearchParams().get("code");
  const [placements, setPlacements] = useState<Record<string, ZoneId>>({});

  useEffect(() => {
    if (code) {
      roomGet(code).then((r) => {
        if (r) setPlacements(Object.fromEntries(Object.entries(r.placements).map(([id, p]) => [id, p.zoneId])));
      });
    } else {
      const s = loadSolo();
      if (s) setPlacements(s.placements);
    }
  }, [code]);

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-5 py-8">
      <header className="mb-8">
        <Link href="/" className="text-sm text-[var(--muted)]">
          ← Accueil
        </Link>
        <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">Fresque collective</p>
        <h1 className="mt-2 font-serif text-4xl">Fresque TMS</h1>
        {code ? (
          <Link href={`/atelier/salle?code=${code}`} className="mt-4 inline-flex min-h-11 items-center border border-[var(--line)] px-4 text-sm">
            Revoir les étapes
          </Link>
        ) : null}
      </header>
      <FresqueCanvas placements={placements} />
    </div>
  );
}

export default function FresquePage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
