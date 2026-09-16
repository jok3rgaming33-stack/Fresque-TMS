"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Board from "@/components/Board";
import FormateurGate from "@/components/FormateurGate";
import { situationById, type SituationId } from "@/data/cards";

function Inner() {
  const situationId = situationById(useSearchParams().get("situation") as SituationId).id;
  return <Board variant="solo" hostView situationId={situationId} />;
}

export default function AtelierPage() {
  return (
    <FormateurGate>
      <Suspense>
        <Inner />
      </Suspense>
    </FormateurGate>
  );
}
