"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import {
  KIND_SHORT,
  MESSAGES,
  cardById,
  uniqueCardsOf,
  shuffleSeeded,
  resolveCard,
  maxCopies,
  situationById,
  type Kind,
  type SituationId,
} from "@/data/cards";
import { zoneLabel, type ZoneId } from "@/data/zones";
import { continueLabel, isCorrectPlacement, isStepComplete, nextKind, stepMessage } from "@/lib/game";
import { clientId, clearSolo, leaveLocalSession, loadSolo, saveSolo } from "@/lib/storage";
import { DEMO_CODE, roomFetch, roomGet, type Member, type RoomState } from "@/lib/room";
import { playLabel } from "@/lib/names";
import BodyMap from "./BodyMap";
import Deck from "./Deck";
import CardDetailSheet from "./CardDetailSheet";

type Variant = "solo" | "table" | "room";

export default function Board({
  variant,
  initialRoom,
  hostView,
  situationId: situationProp,
}: {
  variant: Variant;
  initialRoom?: RoomState;
  hostView?: boolean;
  situationId?: SituationId;
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
  const [tableNames, setTableNames] = useState<string[]>(["Léa", "Sam"]);
  const [actor, setActor] = useState("Léa");
  const [room, setRoom] = useState<RoomState | null>(initialRoom ?? null);
  const [soloSituation, setSoloSituation] = useState<SituationId>(situationProp ?? "tampons");
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [drag, setDrag] = useState<{ cardId: string; x: number; y: number } | null>(null);
  const [hoverZone, setHoverZone] = useState<ZoneId | null>(null);
  const [inspectZone, setInspectZone] = useState<ZoneId | null>(null);
  const pressRef = useRef<{
    cardId: string;
    x: number;
    y: number;
    timer: number;
    dragging: boolean;
    mouse: boolean;
  } | null>(null);
  const roomRef = useRef(room);
  roomRef.current = room;
  const dropRef = useRef<(cardId: string, zoneId: ZoneId) => void>(() => undefined);
  const openRef = useRef<(id: string) => void>(() => undefined);

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
      if (s.situationId) setSoloSituation(s.situationId);
      if (s.extraIds) setExtraIds(s.extraIds);
      setMessage(stepMessage(s.kind));
    }
  }, [variant]);

  const situationId: SituationId = room?.situationId ?? situationProp ?? soloSituation;
  const situation = situationById(situationId);

  useEffect(() => {
    if (variant !== "solo") return;
    saveSolo({ kind, situationId, placements, theme, understood, extraIds });
  }, [variant, kind, situationId, placements, theme, understood, extraIds]);

  useEffect(() => {
    if (room?.code === DEMO_CODE) {
      try {
        sessionStorage.setItem("fresque-tms-demo", JSON.stringify(room));
      } catch {
        /* ignore */
      }
    }
  }, [room]);

  useEffect(() => {
    if (!room || room.code !== DEMO_CODE) return;
    if (Object.keys(room.placements).length > 0) return;
    try {
      const raw = sessionStorage.getItem("fresque-tms-demo");
      if (!raw) return;
      const saved = JSON.parse(raw) as RoomState;
      if (saved?.code === DEMO_CODE && Object.keys(saved.placements || {}).length > 0) {
        setRoom({
          ...saved,
          members: room.members.length ? room.members : saved.members,
        });
      }
    } catch {
      /* ignore */
    }
  }, [room?.code]);

  useEffect(() => {
    if (variant !== "room" || !room) return;
    const t = setInterval(async () => {
      const next = await roomGet(room.code);
      if (!next) return;
      if (me && !next.members.some((m) => m.id === me)) {
        leaveLocalSession();
        router.push("/");
        return;
      }
      const cur = roomRef.current;
      const rank: Record<string, number> = { symptome: 0, cause: 1, prevention: 2, done: 3 };
      const nextCount = Object.keys(next.placements || {}).length;
      const curCount = Object.keys(cur?.placements || {}).length;
      if (cur && rank[next.kind] < rank[cur.kind]) return;
      if (cur && nextCount < curCount && next.kind === cur.kind && next.situationId === cur.situationId) {
        return;
      }
      setRoom(next);
    }, 1200);
    return () => clearInterval(t);
  }, [variant, room?.code]);

  const liveKind: Kind | "done" = room?.kind ?? kind;
  const livePlacements: Record<string, ZoneId> = room
    ? Object.fromEntries(Object.entries(room.placements).map(([id, p]) => [id, p.zoneId]))
    : placements;
  const liveMessage = room?.message ?? message;
  const liveBlink = room?.blinkingId ?? blinkingId;
  const selected = selectedId ? resolveCard(selectedId) ?? null : null;
  const stepKind = liveKind === "done" ? "prevention" : liveKind;
  const liveExtras = room ? room.extraIds ?? [] : extraIds;
  const remaining = shuffleSeeded(
    [
      ...uniqueCardsOf(stepKind, situationId),
      ...liveExtras.map((id) => resolveCard(id)).filter((c): c is NonNullable<typeof c> => Boolean(c)),
    ].filter((c) => c.kind === stepKind && !livePlacements[c.id]),
    `${situationId}|${stepKind}|${room?.code ?? "solo"}`,
  );
  const uniques = uniqueCardsOf(stepKind, situationId);
  const total = uniques.length;
  const placedCount = uniques.filter((c) =>
    Object.keys(livePlacements).some((id) => resolveCard(id)?.title === c.title),
  ).length;
  const complete = liveKind !== "done" && isStepComplete(liveKind, livePlacements, situationId);
  const members: Member[] = room?.members ?? tableNames.map((n, i) => ({ id: n, name: n, color: "#3D9A5F", role: i === 0 ? "hote" : "collaborateur" }));

  function flash(id: string) {
    setBlinkingId(id);
    window.setTimeout(() => setBlinkingId(null), 1100);
  }

  function openCard(id: string) {
    const card = resolveCard(id);
    if (!card) return;
    if (liveKind !== "done" && card.kind !== liveKind && !livePlacements[id]) return;
    setInspectZone(null);
    setSelectedId((cur) => (cur === id ? null : id));
  }

  function zoneAtPoint(x: number, y: number): ZoneId | null {
    const nodes = document.querySelectorAll<HTMLElement>("[data-zone-id]");
    let best: { id: ZoneId; area: number } | null = null;
    for (const n of nodes) {
      const r = n.getBoundingClientRect();
      const pad = 16;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) {
        const area = Math.max(1, r.width * r.height);
        const id = n.dataset.zoneId as ZoneId;
        if (!best || area < best.area) best = { id, area };
      }
    }
    return best?.id ?? null;
  }

  function lockPage(on: boolean) {
    document.documentElement.classList.toggle("dragging-card", on);
    if (!on) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
  }

  async function dropCard(cardId: string, zoneId: ZoneId) {
    const card = resolveCard(cardId);
    if (!card) return;
    if (liveKind !== "done" && card.kind !== liveKind) return;

    setInspectZone(null);
    if (!isCorrectPlacement(card, zoneId, livePlacements)) {
      flash(card.id);
      setMessage(MESSAGES.error);
      return;
    }

    const nextPlacements = { ...livePlacements, [card.id]: zoneId };
    const done = liveKind !== "done" && isStepComplete(liveKind, nextPlacements, situationId);
    setSelectedId(null);
    if (variant === "room" && room) {
      setRoom((r) =>
        r
          ? {
              ...r,
              placements: { ...r.placements, [cardId]: { zoneId, by: me, at: Date.now() } },
              blinkingId: null,
              lock: null,
              proposal: null,
              stepReady: done,
              message: done ? (liveKind === "symptome" ? MESSAGES.afterSymptoms : liveKind === "cause" ? MESSAGES.afterCauses : MESSAGES.done) : null,
              updatedAt: Date.now(),
            }
          : r,
      );
      try {
        const next = await roomFetch({ type: "propose", code: room.code, clientId: me, zoneId, cardId });
        if (next.placements[cardId]) setRoom(next);
      } catch {
        /* keep optimistic placement */
      }
      return;
    }

    setPlacements(nextPlacements);
    setMessage(done ? (liveKind === "symptome" ? MESSAGES.afterSymptoms : liveKind === "cause" ? MESSAGES.afterCauses : MESSAGES.done) : null);
  }

  function chooseZone(zoneId: ZoneId) {
    if (drag) return;
    if (selectedId && !livePlacements[selectedId]) {
      dropCard(selectedId, zoneId);
      setInspectZone(null);
      return;
    }
    setSelectedId(null);
    setInspectZone((cur) => (cur === zoneId ? null : zoneId));
  }

  dropRef.current = dropCard;
  openRef.current = openCard;

  function onCardPress(e: ReactPointerEvent, cardId: string) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const card = resolveCard(cardId);
    if (!card || livePlacements[cardId]) return;
    if (liveKind !== "done" && card.kind !== liveKind) return;
    window.clearTimeout(pressRef.current?.timer);
    const mouse = e.pointerType === "mouse";
    pressRef.current = {
      cardId,
      x: e.clientX,
      y: e.clientY,
      dragging: false,
      mouse: true,
      timer: 0,
    };
  }

  useEffect(() => {
    function move(e: PointerEvent) {
      const p = pressRef.current;
      if (!p) return;
      const dist = Math.hypot(e.clientX - p.x, e.clientY - p.y);
      if (!p.dragging) {
        if (p.mouse && dist > 5) {
          p.dragging = true;
          setSelectedId(null);
          setDrag({ cardId: p.cardId, x: e.clientX, y: e.clientY });
          lockPage(true);
        } else if (!p.mouse && dist > 8) {
          window.clearTimeout(p.timer);
          pressRef.current = null;
          return;
        } else {
          return;
        }
      }
      e.preventDefault();
      p.x = e.clientX;
      p.y = e.clientY;
      setDrag({ cardId: p.cardId, x: e.clientX, y: e.clientY });
      setHoverZone(zoneAtPoint(e.clientX, e.clientY));
    }
    function touchMove(e: TouchEvent) {
      if (pressRef.current?.dragging) e.preventDefault();
    }
    function up(e: PointerEvent) {
      const p = pressRef.current;
      pressRef.current = null;
      if (!p) return;
      window.clearTimeout(p.timer);
      if (!p.dragging) {
        const dist = Math.hypot(e.clientX - p.x, e.clientY - p.y);
        if (dist < 8) openRef.current(p.cardId);
        return;
      }
      lockPage(false);
      const zoneId = zoneAtPoint(e.clientX, e.clientY);
      setDrag(null);
      setHoverZone(null);
      if (zoneId) dropRef.current(p.cardId, zoneId);
    }
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      lockPage(false);
    };
  }, []);

  function continueStep() {
    if (liveKind === "done") {
      router.push(room ? `/fresque?code=${room.code}` : "/fresque");
      return;
    }
    const n = nextKind(liveKind);
    setKind(n);
    setMessage(stepMessage(n));
    setSelectedId(null);
    if (variant === "room" && room) {
      setRoom((r) =>
        r
          ? {
              ...r,
              kind: n,
              stepReady: n === "done",
              lock: null,
              proposal: null,
              message: stepMessage(n),
              updatedAt: Date.now(),
            }
          : r,
      );
      roomFetch({ type: "continue", code: room.code, clientId: me })
        .then((next) => {
          const rank: Record<string, number> = { symptome: 0, cause: 1, prevention: 2, done: 3 };
          if (rank[next.kind] >= rank[n]) setRoom(next);
        })
        .catch(() => undefined);
    }
    if (n === "done") router.push(room ? `/fresque?code=${room.code}` : "/fresque");
  }

  const demo = room?.code === DEMO_CODE;

  async function quitSession() {
    if (typeof window !== "undefined" && !window.confirm("Quitter l’atelier en cours ?")) return;
    if (variant === "room" && room) {
      try {
        await roomFetch({ type: "leave", code: room.code, clientId: me });
      } catch {
        /* still leave locally */
      }
    }
    leaveLocalSession();
    if (variant === "solo") clearSolo();
    router.push(hostView ? "/formateur" : "/");
  }

  function reset() {
    if (variant === "room" && room) {
      if (!hostView && !demo) return;
      roomFetch({ type: "restart-all", code: room.code, clientId: me }).then(setRoom);
      return;
    }
    clearSolo();
    setKind("symptome");
    setPlacements({});
    setSelectedId(null);
    setExtraIds([]);
    setMessage(MESSAGES.start);
  }

  function addCopy(cardId: string) {
    const card = resolveCard(cardId);
    if (!card) return;
    if (variant === "room" && room) {
      roomFetch({ type: "add-copy", code: room.code, clientId: me, cardId }).then(setRoom);
      return;
    }
    const extras = extraIds.filter((id) => resolveCard(id)?.title === card.title);
    if (1 + extras.length >= maxCopies(card.kind, situationId, card.title)) return;
    if (extras.some((id) => !livePlacements[id])) return;
    let n = 2;
    let nid = `${card.baseId}~${n}`;
    const used = new Set([...extraIds, ...Object.keys(livePlacements), card.baseId]);
    while (used.has(nid)) {
      n += 1;
      nid = `${card.baseId}~${n}`;
    }
    setExtraIds((xs) => [...xs, nid]);
  }

  function canAddCopy(card: NonNullable<typeof selected>) {
    if (liveKind === "done" || card.kind !== liveKind) return false;
    const extras = liveExtras.filter((id) => resolveCard(id)?.title === card.title);
    const pending = extras.filter((id) => !livePlacements[id]);
    return pending.length === 0 && 1 + extras.length < maxCopies(card.kind, situationId, card.title);
  }

  function canRemove(card: NonNullable<typeof selected>) {
    return liveKind !== "done" && card.kind === liveKind && Boolean(livePlacements[card.id]);
  }

  function removeCard(cardId: string) {
    const card = resolveCard(cardId);
    if (!card || !canRemove(card)) return;
    if (variant === "room" && room) {
      roomFetch({ type: "remove-card", code: room.code, clientId: me, cardId }).then(setRoom);
      return;
    }
    const next = { ...livePlacements };
    delete next[cardId];
    setPlacements(next);
    setExtraIds((xs) => xs.filter((id) => id !== cardId));
  }

  const proposal = room?.proposal;
  const proposalCard = proposal ? cardById(proposal.cardId) : null;
  const lock = room?.lock;
  const projection = hostView && room?.projection;

  return (
    <div className="board-page">
      <div className="board-chrome">
      {!projection ? (
        <header className="board-header">
          <div className="flex items-center gap-2">
            <button type="button" onClick={quitSession} className="shrink-0 px-1 text-xs text-[var(--muted)]">
              Quitter
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate font-serif text-base leading-tight">
                {situation.short}
                <span className="ml-2 text-sm font-sans text-[var(--muted)]">
                  {KIND_SHORT[liveKind]} · {placedCount}/{total}
                </span>
              </p>
              <div className="mx-auto mt-1 h-1 max-w-xs overflow-hidden bg-white/10">
                <div className="h-full bg-[var(--gold)]" style={{ width: `${(placedCount / Math.max(total, 1)) * 100}%` }} />
              </div>
            </div>
            {hostView || variant !== "room" || demo ? (
              <button type="button" onClick={reset} className="shrink-0 px-2 text-xs text-[var(--muted)]">
                ↺
              </button>
            ) : (
              <span className="inline-block w-6 shrink-0" />
            )}
          </div>
          {hostView ? (
            <div className="hidden flex-wrap justify-center gap-2 lg:flex">
              {room ? (
                <button type="button" onClick={() => router.push(`/formateur/emargement?code=${room.code}`)} className="min-h-11 border border-[var(--line)] px-3 text-sm">
                  Émargement
                </button>
              ) : null}
              <button type="button" onClick={() => router.push(`/formateur/corrige?situation=${situation.id}`)} className="min-h-11 border border-[var(--line)] px-3 text-sm">
                Corrigé
              </button>
              <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="min-h-11 border border-[var(--line)] px-3 text-sm">
                {theme === "dark" ? "Clair" : "Sombre"}
              </button>
            </div>
          ) : null}
        </header>
      ) : null}

      {liveMessage === MESSAGES.error ? (
        <p className="mx-auto mt-1 max-w-xl px-2 text-center text-xs text-[#E8A090]">{liveMessage}</p>
      ) : null}

      {variant === "table" && hostView ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {tableNames.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setActor(n)}
              className={`min-h-11 px-4 text-sm font-bold ${actor === n ? "bg-[var(--gold)] text-[#1a140c]" : "bg-white/10"}`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="min-h-11 bg-white/10 px-3 text-sm"
            onClick={() => {
              const n = window.prompt("Prénom ?");
              if (n) setTableNames((xs) => [...xs, n.trim()]);
            }}
          >
            +
          </button>
        </div>
      ) : null}

      {room && members.length > 1 ? (
        <div className="mt-1 flex flex-wrap justify-center gap-1">
          {members.map((m) => (
            <span key={m.id} className="rounded-sm px-1.5 py-0.5 text-[10px] font-bold" style={{ background: m.color }}>
              {playLabel(m, members)}
            </span>
          ))}
        </div>
      ) : null}

      {proposal && proposalCard ? (
        <div className="mx-auto mt-3 max-w-xl border border-amber-400/50 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold">
            {members.find((m) => m.id === proposal.by)?.name} propose « {proposalCard.title} »
            {hostView ? ` → ${proposal.zoneId}` : " sur une zone du corps"}
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="min-h-11 flex-1 bg-[var(--green)] font-bold text-[#0f1a12]"
              onClick={() => room && roomFetch({ type: "vote", code: room.code, clientId: me, vote: "oui" }).then(setRoom)}
            >
              ✓ On est d&apos;accord
            </button>
            <button
              type="button"
              className="min-h-11 flex-1 bg-[var(--red)] font-bold"
              onClick={() => room && roomFetch({ type: "vote", code: room.code, clientId: me, vote: "non" }).then(setRoom)}
            >
              ✗ Autre zone
            </button>
            {hostView ? (
              <button
                type="button"
                className="min-h-11 bg-white/10 px-4 font-semibold"
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
      </div>

      <div className="board-stage mt-2">
        <section className="board-body">
          <BodyMap
            selected={selected && !livePlacements[selected.id] ? selected : null}
            placements={livePlacements}
            proposed={proposal ? { cardId: proposal.cardId, zoneId: proposal.zoneId } : null}
            reveal={Boolean(room?.revealZones) && Boolean(hostView)}
            debug={debug && Boolean(hostView)}
            onZone={chooseZone}
            hoverZone={hoverZone}
          />
        </section>

        <div className="board-slot">
          {inspectZone && !selectedId ? (
            <div className="sheet p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-serif text-lg">{zoneLabel(inspectZone)}</p>
                <button type="button" className="min-h-11 px-3 text-sm" onClick={() => setInspectZone(null)}>
                  Fermer
                </button>
              </div>
              <ul className="space-y-2">
                {Object.entries(livePlacements)
                  .filter(([, z]) => z === inspectZone)
                  .map(([id]) => {
                    const card = resolveCard(id);
                    if (!card) return null;
                    return (
                      <li key={id} className="flex items-center justify-between gap-2 border border-[var(--line)] px-3 py-2 text-sm">
                        <button type="button" className="min-w-0 flex-1 text-left font-semibold" onClick={() => setSelectedId(id)}>
                          {card.title}
                        </button>
                        {canRemove(card) ? (
                          <button type="button" className="shrink-0 text-xs text-[var(--muted)]" onClick={() => removeCard(id)}>
                            Retirer
                          </button>
                        ) : (
                          <span className="shrink-0 text-[10px] uppercase tracking-wide text-[var(--muted)]">Validé</span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : selected && !livePlacements[selected.id] ? (
            <CardDetailSheet
              card={selected}
              revealZones={Boolean(room?.revealZones) || Boolean(hostView)}
              onPress={onCardPress}
              onClose={() => setSelectedId(null)}
            />
          ) : selected && livePlacements[selected.id] ? (
            <CardDetailSheet
              card={selected}
              placedZone={livePlacements[selected.id]}
              revealZones={Boolean(room?.revealZones) || Boolean(hostView)}
              onClose={() => setSelectedId(null)}
              onAddCopy={canAddCopy(selected) ? () => addCopy(selected.id) : undefined}
              onRemove={canRemove(selected) ? () => removeCard(selected.id) : undefined}
            />
          ) : null}
        </div>

        <aside className={`board-deck ${projection ? "hidden" : ""}`}>
          {liveKind !== "done" ? (
            <Deck
              cards={remaining}
              selectedId={selectedId}
              lock={lock}
              blinkingId={liveBlink}
              members={members}
              onSelect={openCard}
              onPress={onCardPress}
            />
          ) : null}
        </aside>

        <aside className={`board-preview ${projection ? "!hidden" : ""}`}>
          {inspectZone && !selected ? (
            <div className="sheet p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-serif text-xl">{zoneLabel(inspectZone)}</p>
                <button type="button" className="min-h-11 px-3 text-sm" onClick={() => setInspectZone(null)}>
                  Fermer
                </button>
              </div>
              <ul className="space-y-2">
                {Object.entries(livePlacements)
                  .filter(([, z]) => z === inspectZone)
                  .map(([id]) => {
                    const card = resolveCard(id);
                    if (!card) return null;
                    return (
                      <li key={id} className="flex items-center justify-between gap-2 border border-[var(--line)] px-3 py-2 text-sm">
                        <span className="font-semibold">{card.title}</span>
                        {canRemove(card) ? (
                          <button type="button" className="text-xs text-[var(--muted)]" onClick={() => removeCard(id)}>
                            Retirer
                          </button>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Validé</span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : selected ? (
            <CardDetailSheet
              card={selected}
              placedZone={livePlacements[selected.id]}
              revealZones={Boolean(room?.revealZones) || Boolean(hostView)}
              onPress={onCardPress}
              onClose={() => setSelectedId(null)}
              onAddCopy={livePlacements[selected.id] && canAddCopy(selected) ? () => addCopy(selected.id) : undefined}
              onRemove={canRemove(selected) ? () => removeCard(selected.id) : undefined}
            />
          ) : (
            <p className="border border-[var(--line)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">{MESSAGES.help}</p>
          )}
        </aside>
      </div>

      <div className="board-footer">
      {(complete || room?.stepReady) && liveKind !== "done" ? (
        <div className="mt-3 flex justify-center">
          <button type="button" onClick={continueStep} className="min-h-12 w-full max-w-md bg-[var(--gold)] px-8 text-base font-bold text-[#1a140c]">
            {continueLabel(liveKind)}
          </button>
        </div>
      ) : null}

      {liveKind === "done" ? (
        <div className="mt-3 flex justify-center">
          <button type="button" onClick={() => router.push(room ? `/fresque?code=${room.code}` : "/fresque")} className="min-h-12 w-full max-w-md bg-[var(--gold)] px-8 font-bold text-[#1a140c]">
            Voir la fresque
          </button>
        </div>
      ) : null}

      {hostView && room ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button className="min-h-11 bg-white/10 px-4" onClick={() => roomFetch({ type: "toggle-mode", code: room.code, clientId: me }).then(setRoom)}>
            Mode {room.mode === "atelier" ? "Guidé" : "Atelier"}
          </button>
          <button className="min-h-11 border border-[var(--line)] px-4" onClick={() => roomFetch({ type: "toggle-reveal", code: room.code, clientId: me }).then(setRoom)}>
            {room.revealZones ? "Masquer les zones" : "Révéler les zones"}
          </button>
          <button className="min-h-11 bg-white/10 px-4" onClick={() => roomFetch({ type: "toggle-projection", code: room.code, clientId: me }).then(setRoom)}>
            Projection
          </button>
          <button className="min-h-11 bg-white/10 px-4" onClick={() => roomFetch({ type: "restart-step", code: room.code, clientId: me }).then(setRoom)}>
            Recommencer l&apos;étape
          </button>
          <button className="min-h-11 border border-[var(--line)] px-4" onClick={() => router.push(`/formateur/emargement?code=${room.code}`)}>
            Émargement
          </button>
        </div>
      ) : null}
      </div>

      {drag ? (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
          {(() => {
            const card = cardById(drag.cardId);
            if (!card) return null;
            return (
              <div className={`chip chip-${card.kind} chip-selected`}>
                {card.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.image} alt="" className="h-11 w-8 shrink-0 object-cover object-top" />
                ) : null}
                <span>{card.title}</span>
              </div>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}
