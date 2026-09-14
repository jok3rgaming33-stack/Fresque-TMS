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
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-semibold">
          ← Accueil
        </Link>
        <h1 className="rounded-full bg-gradient-to-r from-[#C0392B] via-zinc-600 to-[#3D9A5F] px-5 py-2 font-bold">Fresque TMS</h1>
        <Link href={code ? `/atelier/salle?code=${code}` : "/atelier?solo=1"} className="rounded-full bg-white/10 px-4 py-2 text-sm">
          Revoir les étapes
        </Link>
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
