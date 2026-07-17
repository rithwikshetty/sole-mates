import { randomBytes, randomUUID } from 'node:crypto';
import type { GameView, Phase, RevealEntry, Seat } from '../../shared/types.js';

interface Player {
  id: string;
  name: string;
  connected: boolean;
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
  history: RevealEntry[];
  lastActivity: number;
}

const rooms = new Map<string, Room>();

const ROOM_TTL_MS = 60 * 60 * 1000; // sweep rooms idle for an hour
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

export function cleanName(raw: string): string {
  return String(raw).trim().slice(0, MAX_NAME_LEN);
}

export function cleanQuestion(raw: string): string {
  return String(raw).trim().slice(0, MAX_QUESTION_LEN);
}

export function createRoom(name: string): { room: Room; playerId: string } {
  const playerId = randomUUID();
  const room: Room = {
    code: makeCode(),
    players: [{ id: playerId, name, connected: true }, null],
    phase: 'lobby',
    round: 0,
    asker: 0,
    question: null,
    answers: [null, null],
    reveal: null,
    matches: 0,
    history: [],
    lastActivity: Date.now(),
  };
  rooms.set(room.code, room);
  return { room, playerId };
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(String(code).trim().toUpperCase());
}

export function joinRoom(room: Room, name: string): { playerId: string } | { error: string } {
  if (room.players[1]) return { error: 'This room is already full.' };
  const playerId = randomUUID();
  room.players[1] = { id: playerId, name, connected: true };
  room.phase = 'asking';
  room.round = 1;
  touch(room);
  return { playerId };
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
    room.reveal = {
      question: room.question ?? '',
      answers,
      match: answers[0] === answers[1],
    };
    if (room.reveal.match) room.matches += 1;
    room.history.push(room.reveal);
    room.phase = 'reveal';
  }
  return null;
}

export function nextRound(room: Room): string | null {
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

/** Build the personalized snapshot for one seat; never leaks the partner's live answer. */
export function viewFor(room: Room, seat: Seat): GameView {
  const partner: Seat = seat === 0 ? 1 : 0;
  return {
    code: room.code,
    phase: room.phase,
    you: seat,
    players: [
      { name: room.players[0].name, connected: room.players[0].connected },
      room.players[1] ? { name: room.players[1].name, connected: room.players[1].connected } : null,
    ],
    round: room.round,
    asker: room.asker,
    question: room.question,
    youAnswered: room.answers[seat] !== null,
    yourAnswer: room.answers[seat],
    partnerAnswered: room.answers[partner] !== null,
    reveal: room.phase === 'reveal' ? room.reveal : null,
    matches: room.matches,
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
