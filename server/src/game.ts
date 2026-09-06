import { randomBytes, randomUUID } from 'node:crypto';
import { isShoeColor, isShoeStyle } from '../../shared/shoes.js';
import type { GameView, Outfit, Phase, PlayerView, RevealEntry, Seat } from '../../shared/types.js';

interface Player {
  id: string;
  name: string;
  connected: boolean;
  shoe: Outfit['shoe'];
  color: Outfit['color'];
}

export interface Room {
  code: string;
  players: [Player, Player | null];
  phase: Phase;
  round: number;
  asker: Seat;
  question: string | null;
  /** answers[seat] = seat that player pointed at, or null until locked in */
  answers: [Seat | null, Seat | null];
  reveal: RevealEntry | null;
  matches: number;
  streak: number;
  bestStreak: number;
  history: RevealEntry[];
  lastActivity: number;
}

const rooms = new Map<string, Room>();

const ROOM_TTL_MS = 60 * 60 * 1000; // sweep rooms idle for an hour
const MAX_ROOMS = 500; // one instance, two players a room; plenty for a party game
const MAX_NAME_LEN = 20;
const MAX_QUESTION_LEN = 200;

// Unambiguous alphabet: no O/0, I/1, etc.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function makeCode(): string {
  let code: string;
  do {
    code = Array.from(randomBytes(4), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  } while (rooms.has(code));
  return code;
}

/** Collapse whitespace and drop control characters; anything that is not a string becomes empty. */
function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
}

export function cleanName(raw: unknown): string {
  return cleanText(raw, MAX_NAME_LEN);
}

export function cleanQuestion(raw: unknown): string {
  return cleanText(raw, MAX_QUESTION_LEN);
}

/** Validate a client-sent outfit; null means the ids aren't in the catalog. */
export function parseOutfit(raw: unknown): Outfit | null {
  const outfit = (raw ?? {}) as Partial<Outfit>;
  if (!isShoeStyle(outfit.shoe) || !isShoeColor(outfit.color)) return null;
  return { shoe: outfit.shoe, color: outfit.color };
}

const sameName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0;

export function createRoom(name: string, outfit: Outfit): { room: Room; playerId: string } | { error: string } {
  if (rooms.size >= MAX_ROOMS) return { error: 'The venue is full right now. Try again in a few minutes.' };
  const playerId = randomUUID();
  const room: Room = {
    code: makeCode(),
    players: [{ id: playerId, name, connected: true, ...outfit }, null],
    phase: 'lobby',
    round: 0,
    asker: 0,
    question: null,
    answers: [null, null],
    reveal: null,
    matches: 0,
    streak: 0,
    bestStreak: 0,
    history: [],
    lastActivity: Date.now(),
  };
  rooms.set(room.code, room);
  return { room, playerId };
}

export function getRoom(code: unknown): Room | undefined {
  if (typeof code !== 'string') return undefined;
  return rooms.get(code.trim().toUpperCase());
}

/**
 * Where a newcomer with this name would sit. The empty second seat wins,
 * unless the name belongs to a player who dropped off, in which case they
 * get their own seat back (a dead phone should not end the game). The
 * `partner` is whoever stays in the other seat, or null when a host reclaims
 * a room nobody has joined yet.
 */
export function seatFor(
  room: Room,
  name: string,
): { seat: Seat; partner: Player | null; resuming: boolean } | { error: string } {
  const [host, guest] = room.players;
  if (!host.connected && sameName(host.name, name)) {
    return { seat: 0, partner: guest, resuming: true };
  }
  if (guest && !guest.connected && sameName(guest.name, name)) {
    return { seat: 1, partner: host, resuming: true };
  }
  if (guest) return { error: 'This room is already full.' };
  if (sameName(host.name, name)) {
    return { error: `${host.name} is already using that name. Add a letter so we can tell you apart!` };
  }
  return { seat: 1, partner: host, resuming: false };
}

export function joinRoom(
  room: Room,
  name: string,
  outfit: Outfit,
): { playerId: string; seat: Seat } | { error: string } {
  const spot = seatFor(room, name);
  if ('error' in spot) return spot;
  if (spot.partner && spot.partner.shoe === outfit.shoe) {
    return { error: `${spot.partner.name} already picked that shoe. Choose another style!` };
  }
  const playerId = randomUUID();
  room.players[spot.seat] = { id: playerId, name, connected: true, ...outfit };
  if (room.phase === 'lobby' && room.players[1]) {
    room.phase = 'asking';
    room.round = 1;
  }
  touch(room);
  return { playerId, seat: spot.seat };
}

export function findSeat(room: Room, playerId: string): Seat | null {
  if (room.players[0].id === playerId) return 0;
  if (room.players[1]?.id === playerId) return 1;
  return null;
}

export function setConnected(room: Room, seat: Seat, connected: boolean): void {
  const player = room.players[seat];
  if (player) player.connected = connected;
  touch(room);
}

export function askQuestion(room: Room, seat: Seat, question: string): string | null {
  if (room.phase !== 'asking') return 'Not the time to ask a question.';
  if (seat !== room.asker) return "It's your partner's turn to ask.";
  if (!question) return 'The question cannot be empty.';
  room.question = question;
  room.answers = [null, null];
  room.phase = 'answering';
  touch(room);
  return null;
}

export function submitAnswer(room: Room, seat: Seat, choice: Seat): string | null {
  if (room.phase !== 'answering') return 'Not the time to answer.';
  if (choice !== 0 && choice !== 1) return 'Invalid answer.';
  if (room.answers[seat] !== null) return null; // already locked in; ignore
  room.answers[seat] = choice;
  touch(room);
  if (room.answers[0] !== null && room.answers[1] !== null) {
    const answers: [Seat, Seat] = [room.answers[0], room.answers[1]];
    const match = answers[0] === answers[1];
    room.reveal = { question: room.question ?? '', answers, match };
    if (match) {
      room.matches += 1;
      room.streak += 1;
      room.bestStreak = Math.max(room.bestStreak, room.streak);
    } else {
      room.streak = 0;
    }
    room.history.push(room.reveal);
    room.phase = 'reveal';
  }
  return null;
}

/**
 * Advance to the next asking phase. Both players see the button, so a second
 * tap that lands after the round already moved on is a no-op, not an error.
 */
export function nextRound(room: Room): string | null {
  if (room.phase === 'asking' && room.question === null) return null;
  if (room.phase !== 'reveal') return 'The round is not over yet.';
  room.round += 1;
  room.asker = room.asker === 0 ? 1 : 0;
  room.question = null;
  room.answers = [null, null];
  room.reveal = null;
  room.phase = 'asking';
  touch(room);
  return null;
}

/**
 * Wrap up: allowed between rounds once at least one round has been revealed.
 * Wrapping up from the reveal screen also passes the asking turn, the same
 * as "next" would, so a restart starts with the right player.
 */
export function finishGame(room: Room): string | null {
  if (room.phase === 'finished') return null;
  if (room.phase === 'answering') return 'Finish this round first, then wrap up.';
  if (room.phase === 'lobby' || room.history.length === 0) return 'Play at least one round first!';
  if (room.phase === 'reveal') room.asker = room.asker === 0 ? 1 : 0;
  room.question = null;
  room.answers = [null, null];
  room.reveal = null;
  room.phase = 'finished';
  touch(room);
  return null;
}

/** Fresh scoreboard with the same two players; whoever is due to ask next still asks first. */
export function restartGame(room: Room): string | null {
  if (room.phase === 'asking' && room.round === 1 && room.history.length === 0) return null;
  if (room.phase !== 'finished') return 'Wrap up the game before starting a new one.';
  room.round = 1;
  room.question = null;
  room.answers = [null, null];
  room.reveal = null;
  room.matches = 0;
  room.streak = 0;
  room.bestStreak = 0;
  room.history = [];
  room.phase = 'asking';
  touch(room);
  return null;
}

function toPlayerView(player: Player): PlayerView {
  return { name: player.name, connected: player.connected, shoe: player.shoe, color: player.color };
}

/** Build the personalized snapshot for one seat; never leaks the partner's live answer. */
export function viewFor(room: Room, seat: Seat): GameView {
  const partner: Seat = seat === 0 ? 1 : 0;
  return {
    code: room.code,
    phase: room.phase,
    you: seat,
    players: [toPlayerView(room.players[0]), room.players[1] ? toPlayerView(room.players[1]) : null],
    round: room.round,
    asker: room.asker,
    question: room.question,
    youAnswered: room.answers[seat] !== null,
    yourAnswer: room.answers[seat],
    partnerAnswered: room.answers[partner] !== null,
    reveal: room.phase === 'reveal' ? room.reveal : null,
    matches: room.matches,
    streak: room.streak,
    bestStreak: room.bestStreak,
    history: room.history,
  };
}

function touch(room: Room): void {
  room.lastActivity = Date.now();
}

export function deleteRoom(code: string): void {
  rooms.delete(code);
}

/** Sweep idle rooms, skipping any that still have connected sockets. */
export function sweepIdleRooms(activeCodes: Set<string>): string[] {
  const now = Date.now();
  const removed: string[] = [];
  for (const [code, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL_MS && !activeCodes.has(code)) {
      rooms.delete(code);
      removed.push(code);
    }
  }
  return removed;
}
