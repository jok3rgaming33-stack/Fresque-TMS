"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CARDS, KIND_LABEL, MESSAGES, cardsOf, cardById, type Kind } from "@/data/cards";
import type { ZoneId } from "@/data/zones";
import { continueLabel, isCorrectPlacement, isStepComplete, nextKind, stepMessage } from "@/lib/game";
import { clientId, clearSolo, loadSolo, saveSolo } from "@/lib/storage";
import { roomFetch, roomGet, type Member, type RoomState } from "@/lib/room";
import BodyMap from "./BodyMap";
import Deck from "./Deck";
import CardDetailSheet from "./CardDetailSheet";

type Variant = "solo" | "table" | "room";

export default function Board({
  variant,
  initialRoom,
  hostView,
}: {
  variant: Variant;
  initialRoom?: RoomState;
  hostView?: boolean;
}) {
  const router = useRouter();
  const me = typeof window !== "undefined" ? clientId() : "";
  const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";

  const [kind, setKind] = useState<Kind | "done">("symptome");
  const [placements, setPlacements] = useState<Record<string, ZoneId>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blinkingId, setBlinkingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(MESSAGES.start);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [understood, setUnderstood] = useState<string[]>([]);
  const [awaitingZone, setAwaitingZone] = useState(false);
  const [scale, setScale] = useState(1);
  const [tableNames, setTableNames] = useState<string[]>(["Léa", "Sam"]);
  const [actor, setActor] = useState("Léa");
  const [room, setRoom] = useState<RoomState | null>(initialRoom ?? null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (variant !== "solo") return;
    const s = loadSolo();
    if (s) {
      setKind(s.kind);
      setPlacements(s.placements);
      setTheme(s.theme);
      setUnderstood(s.understood);
      setMessage(stepMessage(s.kind));
    }
  }, [variant]);

  useEffect(() => {
    if (variant !== "solo") return;
    saveSolo({ kind, placements, theme, understood });
  }, [variant, kind, placements, theme, understood]);

  useEffect(() => {
    if (variant !== "room" || !room) return;
    const t = setInterval(async () => {
      const next = await roomGet(room.code);
      if (next) setRoom(next);
    }, 800);
    return () => clearInterval(t);
  }, [variant, room?.code]);

  const liveKind: Kind | "done" = room?.kind ?? kind;
  const livePlacements: Record<string, ZoneId> = room
    ? Object.fromEntries(Object.entries(room.placements).map(([id, p]) => [id, p.zoneId]))
    : placements;
  const liveMessage = room?.message ?? message;
  const liveBlink = room?.blinkingId ?? blinkingId;
  const selected = selectedId ? cardById(selectedId) ?? null : null;
  const stepKind = liveKind === "done" ? "prevention" : liveKind;
  const remaining = CARDS.filter((c) => c.kind === stepKind && !livePlacements[c.id]);
  const total = cardsOf(stepKind).length;
  const placedCount = total - remaining.length;
  const complete = liveKind !== "done" && isStepComplete(liveKind, livePlacements);
  const members: Member[] = room?.members ?? tableNames.map((n, i) => ({ id: n, name: n, color: "#3D9A5F", role: i === 0 ? "hote" : "collaborateur" }));
  const meMember = members.find((m) => m.id === me) || members.find((m) => m.name === actor);

  const groupedDeck = remaining;

  function flash(id: string) {
    setBlinkingId(id);
    window.setTimeout(() => setBlinkingId(null), 1100);
  }

  async function selectCard(id: string) {
    const card = cardById(id);
    if (!card) return;
    if (variant === "room" && room) {
      try {
        setRoom(await roomFetch({ type: "select", code: room.code, clientId: me, cardId: selectedId === id ? null : id }));
        setSelectedId(selectedId === id ? null : id);
        setAwaitingZone(selectedId !== id);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Impossible");
      }
      return;
    }
    if (card.kind !== liveKind) return;
    setSelectedId(id);
    setAwaitingZone(true);
    setMessage(MESSAGES.help);
    if (navigator.vibrate) navigator.vibrate(10);
  }

  async function chooseZone(zoneId: ZoneId) {
    if (!selectedId) return;
    const card = cardById(selectedId);
    if (!card) return;

    if (variant === "room" && room) {
      try {
        setRoom(await roomFetch({ type: "propose", code: room.code, clientId: me, zoneId }));
        setAwaitingZone(false);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Impossible");
      }
      return;
    }

    if (!isCorrectPlacement(card, zoneId)) {
      flash(card.id);
      setMessage(MESSAGES.error);
      setSelectedId(null);
      setAwaitingZone(false);
      return;
    }
    const next = { ...livePlacements, [card.id]: zoneId };
    setPlacements(next);
    setSelectedId(null);
    setAwaitingZone(false);
    if (liveKind !== "done" && isStepComplete(liveKind, next)) {
      setMessage(liveKind === "symptome" ? MESSAGES.afterSymptoms : liveKind === "cause" ? MESSAGES.afterCauses : MESSAGES.done);
    } else {
      setMessage(null);
    }
  }

  function continueStep() {
    if (variant === "room" && room) {
      roomFetch({ type: "continue", code: room.code, clientId: me }).then(setRoom);
      return;
    }
    if (liveKind === "done") {
      router.push("/fresque");
      return;
    }
    const n = nextKind(liveKind);
    setKind(n);
    setMessage(stepMessage(n));
    if (n === "done") router.push("/fresque");
  }

  function reset() {
    if (variant === "room" && room) {
      roomFetch({ type: "restart-all", code: room.code, clientId: me }).then(setRoom);
      return;
    }
    clearSolo();
    setKind("symptome");
    setPlacements({});
    setSelectedId(null);
    setMessage(MESSAGES.start);
  }

  const proposal = room?.proposal;
  const proposalCard = proposal ? cardById(proposal.cardId) : null;
  const lock = room?.lock;
  const projection = hostView && room?.projection;

  return (
    <div className="min-h-screen px-3 py-4 md:px-6">
      {!projection ? (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => router.push("/")} className="min-h-11 text-sm text-[var(--muted)]">
            ← Accueil
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold)]">Fresque TMS</p>
            <p className="font-serif text-lg">{hostView ? "Vue formateur" : "Atelier"}</p>
          </div>
          <div className="flex gap-2">
            {hostView ? (
              <button type="button" onClick={() => router.push("/formateur/corrige")} className="min-h-11 border border-[var(--line)] px-3 text-sm">
                Corrigé
              </button>
            ) : null}
            <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="min-h-11 border border-[var(--line)] px-3 text-sm">
              {theme === "dark" ? "Clair" : "Sombre"}
            </button>
            <button type="button" onClick={reset} className="min-h-11 border border-[var(--line)] px-3 text-sm">
              Recommencer
            </button>
          </div>
        </header>
      ) : null}

      <p className="text-center text-sm font-bold">{KIND_LABEL[liveKind]}</p>
      <div className="mx-auto mt-2 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-[var(--green)]" style={{ width: `${(placedCount / Math.max(total, 1)) * 100}%` }} />
      </div>
      <p className="mt-1 text-center text-xs text-[var(--muted)]">
        {placedCount} / {total}
        {room ? ` · code ${room.code} · ${members.length} présents` : ""}
      </p>
      {liveMessage ? <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-[var(--panel)] px-4 py-3 text-center text-sm">{liveMessage}</p> : null}

      {variant === "table" ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {tableNames.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setActor(n)}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${actor === n ? "bg-[var(--green)] text-[#0f1a12]" : "bg-white/10"}`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="min-h-11 rounded-full bg-white/10 px-3 text-sm"
            onClick={() => {
              const n = window.prompt("Prénom ?");
              if (n) setTableNames((xs) => [...xs, n.trim()]);
            }}
          >
            +
          </button>
        </div>
      ) : null}

      {room ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {members.map((m) => (
            <span key={m.id} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: m.color }}>
              {m.name}
              {m.role === "hote" ? " · hôte" : ""}
            </span>
          ))}
        </div>
      ) : null}

      {proposal && proposalCard ? (
        <div className="mx-auto mt-3 max-w-xl rounded-2xl border border-amber-400/50 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold">
            {members.find((m) => m.id === proposal.by)?.name} propose « {proposalCard.title} »
            {hostView ? ` → ${proposal.zoneId}` : " sur une zone du corps"}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="min-h-11 flex-1 rounded-full bg-[var(--green)] font-bold text-[#0f1a12]"
              onClick={() => room && roomFetch({ type: "vote", code: room.code, clientId: me, vote: "oui" }).then(setRoom)}
            >
              ✓ On est d&apos;accord
            </button>
            <button
              type="button"
              className="min-h-11 flex-1 rounded-full bg-[var(--red)] font-bold"
              onClick={() => room && roomFetch({ type: "vote", code: room.code, clientId: me, vote: "non" }).then(setRoom)}
            >
              ✗ Autre zone
            </button>
            {hostView ? (
              <button
                type="button"
                className="min-h-11 rounded-full bg-white/10 px-4 font-semibold"
                onClick={() => room && roomFetch({ type: "force", code: room.code, clientId: me }).then(setRoom)}
              >
                Forcer
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {lock && !proposal ? (
        <p className="mt-2 text-center text-sm text-[var(--muted)]">
          {members.find((m) => m.id === lock.by)?.name} tient {cardById(lock.cardId)?.title}
        </p>
      ) : null}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(280px,520px)_minmax(240px,1fr)]">
        <aside className={`${projection ? "hidden" : ""} order-2 lg:order-1`}>
          {liveKind !== "done" ? (
            <Deck
              cards={groupedDeck}
              selectedId={selectedId}
              lock={lock}
              blinkingId={liveBlink}
              members={members}
              onSelect={selectCard}
            />
          ) : null}
        </aside>

        <section className="order-1 lg:order-2">
          <div className="mb-2 flex justify-center gap-2 lg:hidden">
            <button type="button" className="min-h-11 rounded-full bg-white/10 px-3" onClick={() => setScale((s) => Math.max(1, s - 0.25))}>
              −
            </button>
            <button type="button" className="min-h-11 rounded-full bg-white/10 px-3" onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}>
              +
            </button>
          </div>
          <BodyMap
            selected={selected}
            placements={livePlacements}
            proposed={proposal ? { cardId: proposal.cardId, zoneId: proposal.zoneId } : null}
            blinkingId={liveBlink}
            reveal={room?.revealZones}
            debug={debug}
            onZone={chooseZone}
            onPin={(id) => setSelectedId(id)}
            projection={projection}
            scale={scale}
          />
        </section>

        <aside className={`${projection ? "hidden" : ""} order-3 hidden lg:block`}>
          {selected ? (
            <CardDetailSheet
              card={selected}
              placedZone={livePlacements[selected.id]}
              revealZones={Boolean(room?.revealZones) || hostView}
              onPlace={awaitingZone ? undefined : () => setAwaitingZone(true)}
              onClose={() => setSelectedId(null)}
              onRemove={
                livePlacements[selected.id] && (variant !== "room" || hostView)
                  ? () => {
                      if (variant === "room" && room) {
                        roomFetch({ type: "remove-card", code: room.code, clientId: me, cardId: selected.id }).then(setRoom);
                      } else {
                        const next = { ...livePlacements };
                        delete next[selected.id];
                        setPlacements(next);
                      }
                    }
                  : undefined
              }
            />
          ) : (
            <p className="rounded-3xl bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">{MESSAGES.help}</p>
          )}
        </aside>
      </div>

      {selected && !projection ? (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <CardDetailSheet
            card={selected}
            placedZone={livePlacements[selected.id]}
            revealZones={Boolean(room?.revealZones) || hostView}
            onPlace={() => setAwaitingZone(true)}
            onClose={() => setSelectedId(null)}
          />
        </div>
      ) : null}

      {(complete || room?.stepReady) && liveKind !== "done" ? (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={continueStep} className="min-h-12 rounded-full bg-[var(--green)] px-8 text-base font-bold text-[#0f1a12]">
            {continueLabel(liveKind)}
          </button>
        </div>
      ) : null}

      {liveKind === "done" ? (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => router.push(room ? `/fresque?code=${room.code}` : "/fresque")} className="min-h-12 rounded-full bg-[var(--green)] px-8 font-bold text-[#0f1a12]">
            Voir la fresque
          </button>
        </div>
      ) : null}

      {hostView && room ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button className="min-h-11 rounded-full bg-white/10 px-4" onClick={() => roomFetch({ type: "toggle-mode", code: room.code, clientId: me }).then(setRoom)}>
            Mode {room.mode === "atelier" ? "Guidé" : "Atelier"}
          </button>
          <button className="min-h-11 border border-[var(--line)] px-4" onClick={() => roomFetch({ type: "toggle-reveal", code: room.code, clientId: me }).then(setRoom)}>
            {room.revealZones ? "Masquer les zones" : "Révéler les zones (formateur)"}
          </button>
          <button className="min-h-11 rounded-full bg-white/10 px-4" onClick={() => roomFetch({ type: "toggle-projection", code: room.code, clientId: me }).then(setRoom)}>
            Projection
          </button>
          <button className="min-h-11 rounded-full bg-white/10 px-4" onClick={() => roomFetch({ type: "restart-step", code: room.code, clientId: me }).then(setRoom)}>
            Recommencer l&apos;étape
          </button>
        </div>
      ) : null}
    </div>
  );
}
