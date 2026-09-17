import { MESSAGES, cardById, maxCopies, resolveCard, situationById, type Kind, type SituationId } from "@/data/cards";
import { COLORS, isCorrectPlacement, isStepComplete, nextKind, stepMessage } from "@/lib/game";
import { DEMO_CODE, type RoomAction, type RoomState } from "@/lib/room";
import { readCachedRoom, writeCachedRoom } from "@/lib/room-persist";
import type { ZoneId } from "@/data/zones";

const g = globalThis as typeof globalThis & { __fresqueRooms?: Map<string, RoomState> };
if (!g.__fresqueRooms) g.__fresqueRooms = new Map();
const rooms = g.__fresqueRooms;

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function code4() {
  let s = "";
  for (let i = 0; i < 4; i++) s += ALPH[Math.floor(Math.random() * ALPH.length)];
  if (rooms.has(s)) return code4();
  return s;
}

function member(state: RoomState, id: string) {
  return state.members.find((m) => m.id === id);
}

function isHost(state: RoomState, id: string) {
  return member(state, id)?.role === "hote";
}

function isDemo(state: RoomState) {
  return state.code === DEMO_CODE;
}

function ensureDemoRoom(): RoomState {
  const existing = rooms.get(DEMO_CODE);
  if (existing) return existing;
  const room: RoomState = {
    code: DEMO_CODE,
    ...empty("symptome", "tampons"),
    mode: "guide",
    members: [],
  };
  rooms.set(DEMO_CODE, room);
  return room;
}

export async function hydrateRoom(code: string) {
  const c = (code || "").toUpperCase();
  if (!c) return;
  const cached = await readCachedRoom(c);
  if (!cached) return;
  const mem = rooms.get(c);
  if (!mem || (cached.updatedAt || 0) >= (mem.updatedAt || 0)) {
    rooms.set(c, cached);
  }
}

export async function persistRoom(state: RoomState) {
  rooms.set(state.code, state);
  await writeCachedRoom(state);
}

function empty(kind: Kind | "done" = "symptome", situationId: SituationId = "tampons"): Omit<RoomState, "code"> {
  return {
    situationId,
    mode: "atelier",
    kind,
    members: [],
    placements: {},
    lock: null,
    proposal: null,
    blinkingId: null,
    message: MESSAGES.start,
    understood: [],
    revealZones: false,
    projection: false,
    stepReady: false,
    extraIds: [],
    updatedAt: Date.now(),
  };
}

function applyPlacement(state: RoomState, cardId: string, zoneId: ZoneId, by: string) {
  const card = resolveCard(cardId);
  if (!card) return;
  state.proposal = null;
  state.lock = null;
  state.blinkingId = null;
  const placedZones = Object.fromEntries(Object.entries(state.placements).map(([k, v]) => [k, v.zoneId]));
  if (!isCorrectPlacement(card, zoneId, placedZones)) {
    state.blinkingId = cardId;
    state.message = MESSAGES.error;
    setTimeout(() => {
      const r = rooms.get(state.code);
      if (r && r.blinkingId === cardId) {
        r.blinkingId = null;
        r.updatedAt = Date.now();
      }
    }, 1100);
    return;
  }
  state.placements[cardId] = { zoneId, by, at: Date.now() };
  if (state.kind === "done") return;
  const after = Object.fromEntries(Object.entries(state.placements).map(([k, v]) => [k, v.zoneId]));
  if (isStepComplete(state.kind, after, state.situationId)) {
    state.stepReady = true;
    state.message = state.kind === "symptome" ? MESSAGES.afterSymptoms : state.kind === "cause" ? MESSAGES.afterCauses : MESSAGES.done;
  } else {
    state.message = null;
  }
}

export function mutate(action: RoomAction): RoomState {
  if (action.type === "create") {
    const code = code4();
    const situationId = situationById(action.situationId).id;
    const state: RoomState = {
      code,
      ...empty("symptome", situationId),
      members: [{ id: action.clientId, name: action.name, color: COLORS[0], role: "hote" }],
    };
    rooms.set(code, state);
    return state;
  }

  const code = (action.code || "").toUpperCase();
  if (code === DEMO_CODE) ensureDemoRoom();

  const state = rooms.get(code);
  if (!state) throw new Error("Atelier introuvable");
  state.updatedAt = Date.now();

  if (action.type === "join") {
    const existing = member(state, action.clientId);
    if (existing) {
      existing.name = action.name || existing.name;
      return state;
    }
    state.members.push({
      id: action.clientId,
      name: action.name,
      color: COLORS[state.members.length % COLORS.length],
      role: action.role ?? "collaborateur",
    });
    return state;
  }

  if (action.type === "leave") {
    state.members = state.members.filter((m) => m.id !== action.clientId);
    if (state.lock?.by === action.clientId) state.lock = null;
    if (state.proposal?.by === action.clientId) state.proposal = null;
    return state;
  }

  const me = member(state, action.clientId);
  if (!me) throw new Error("Vous n'êtes pas dans cet atelier");

  if (action.type === "select") {
    if (state.kind === "done") return state;
    if (!action.cardId) {
      if (state.lock?.by === me.id) state.lock = null;
      return state;
    }
    const card = cardById(action.cardId);
    if (!card || card.kind !== state.kind || card.situation !== state.situationId) {
      throw new Error("Cette carte n'est pas disponible");
    }
    if (state.placements[action.cardId]) throw new Error("Carte déjà posée");
    if (state.lock && state.lock.by !== me.id && state.lock.until > Date.now()) {
      throw new Error("Cette carte est déjà tenue");
    }
    if (state.proposal && state.proposal.cardId !== action.cardId) {
      throw new Error("Une proposition est déjà en cours");
    }
    state.lock = { cardId: action.cardId, by: me.id, until: Date.now() + 20000 };
    return state;
  }

  if (action.type === "propose") {
    const cardId = (state.lock?.by === me.id ? state.lock.cardId : null) || action.cardId;
    if (!cardId) throw new Error("Tenez d'abord une carte");
    const card = resolveCard(cardId);
    if (!card || card.kind !== state.kind || state.placements[cardId]) {
      throw new Error("Cette carte n'est pas disponible");
    }
    if (state.mode === "guide") {
      applyPlacement(state, cardId, action.zoneId, me.id);
      return state;
    }
    state.proposal = { cardId, zoneId: action.zoneId, by: me.id, votes: { [me.id]: "oui" }, notes: [] };
    return state;
  }

  if (action.type === "vote") {
    if (!state.proposal) throw new Error("Aucune proposition");
    state.proposal.votes[me.id] = action.vote;
    const yes = Object.values(state.proposal.votes).filter((v) => v === "oui").length;
    if (yes > state.members.length / 2) {
      applyPlacement(state, state.proposal.cardId, state.proposal.zoneId, state.proposal.by);
    }
    return state;
  }

  if (action.type === "note") {
    if (!state.proposal) return state;
    const text = action.text.slice(0, 80);
    if (!text) return state;
    state.proposal.notes.push({ by: me.id, text });
    return state;
  }

  if (action.type === "force") {
    if (!isHost(state, me.id) || !state.proposal) return state;
    applyPlacement(state, state.proposal.cardId, state.proposal.zoneId, state.proposal.by);
    return state;
  }

  if (action.type === "release") {
    if (!isHost(state, me.id) && state.lock?.by !== me.id) return state;
    state.lock = null;
    state.proposal = null;
    return state;
  }

  if (action.type === "continue") {
    if (state.kind === "done") return state;
    const placedZones = Object.fromEntries(Object.entries(state.placements).map(([k, v]) => [k, v.zoneId]));
    const ready = state.stepReady || isStepComplete(state.kind, placedZones, state.situationId);
    if (!ready) return state;
    const n = nextKind(state.kind);
    state.kind = n;
    state.stepReady = n === "done";
    state.lock = null;
    state.proposal = null;
    state.message = stepMessage(n);
    return state;
  }

  if (action.type === "restart-step") {
    if ((!isHost(state, me.id) && !isDemo(state)) || state.kind === "done") return state;
    const kind = state.kind;
    for (const id of Object.keys(state.placements)) {
      const card = cardById(id);
      if (card?.kind === kind) delete state.placements[id];
    }
    state.stepReady = false;
    state.lock = null;
    state.proposal = null;
    state.message = MESSAGES.start;
    return state;
  }

  if (action.type === "restart-all") {
    if (!isHost(state, me.id) && !isDemo(state)) return state;
    const members = state.members;
    const next: RoomState = {
      code: state.code,
      ...empty("symptome", state.situationId),
      members,
      extraIds: [],
      mode: isDemo(state) ? "guide" : "atelier",
    };
    rooms.set(state.code, next);
    return next;
  }

  if (action.type === "toggle-mode") {
    if (!isHost(state, me.id)) return state;
    state.mode = state.mode === "atelier" ? "guide" : "atelier";
    return state;
  }
  if (action.type === "toggle-reveal") {
    if (!isHost(state, me.id)) return state;
    state.revealZones = !state.revealZones;
    return state;
  }
  if (action.type === "toggle-projection") {
    if (!isHost(state, me.id)) return state;
    state.projection = !state.projection;
    return state;
  }
  if (action.type === "remove-card") {
    if (!isHost(state, me.id) && !isDemo(state)) return state;
    const card = resolveCard(action.cardId);
    if (!card || state.kind === "done" || card.kind !== state.kind) return state;
    delete state.placements[action.cardId];
    state.extraIds = (state.extraIds || []).filter((id) => id !== action.cardId);
    state.stepReady = false;
    return state;
  }

  if (action.type === "add-copy") {
    const source = resolveCard(action.cardId);
    if (!source || source.kind !== state.kind) return state;
    const extras = state.extraIds || [];
    const placed = Object.keys(state.placements).filter((id) => resolveCard(id)?.title === source.title);
    const pending = extras.filter((id) => resolveCard(id)?.title === source.title && !state.placements[id]);
    const count = 1 + extras.filter((id) => resolveCard(id)?.title === source.title).length;
    if (count >= maxCopies(source.kind, state.situationId, source.title)) return state;
    if (pending.length > 0) return state;
    let n = 2;
    let nid = `${source.baseId}~${n}`;
    const used = new Set([...extras, ...Object.keys(state.placements), source.baseId]);
    while (used.has(nid)) {
      n += 1;
      nid = `${source.baseId}~${n}`;
    }
    state.extraIds = [...extras, nid];
    return state;
  }

  return state;
}

export function getRoom(code: string) {
  const c = code.toUpperCase();
  if (c === DEMO_CODE) return ensureDemoRoom();
  return rooms.get(c) ?? null;
}
