"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Board from "@/components/Board";

function Inner() {
  const solo = useSearchParams().get("solo") === "1";
  return <Board variant={solo ? "solo" : "solo"} />;
}

export default function AtelierPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
