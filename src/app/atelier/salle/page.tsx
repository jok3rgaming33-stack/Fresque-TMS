"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Board from "@/components/Board";
import { clientId } from "@/lib/storage";
import { isFormateur } from "@/lib/role";
import { roomGet, type RoomState } from "@/lib/room";

function Inner() {
  const code = useSearchParams().get("code") || "";
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const me = typeof window !== "undefined" ? clientId() : "";

  useEffect(() => {
    roomGet(code)
      .then((r) => {
        if (!r) setError("Atelier introuvable");
        else setRoom(r);
      })
      .catch(() => setError("Atelier introuvable"));
  }, [code]);

  if (error) return <p className="p-8">{error}</p>;
  if (!room) return <p className="p-8">Connexion à l&apos;atelier…</p>;
  const host = room.members.find((m) => m.id === me)?.role === "hote" || isFormateur();
  return <Board variant="room" initialRoom={room} hostView={host} />;
}

export default function SallePage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
