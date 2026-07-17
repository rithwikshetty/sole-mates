// Shared game types used by both the server (authoritative) and the client (display).

import type { ShoeColor, ShoeStyle } from './shoes.js';

export type Phase =
  | 'lobby' // waiting for the second player to join
  | 'asking' // the current asker is writing/picking a question
  | 'answering' // both players privately pick who the answer is
  | 'reveal'; // both answers are shown (client animates the 3-2-1 first)

/** A player's answer is the seat index (0 or 1) of the person they raised the shoe for. */
export type Seat = 0 | 1;

export interface PlayerView {
  name: string;
  connected: boolean;
  shoe: ShoeStyle;
  color: ShoeColor;
}

/** What a player wears into the room. */
export interface Outfit {
  shoe: ShoeStyle;
  color: ShoeColor;
}

export interface RevealEntry {
  question: string;
  /** answers[seat] = which seat that player pointed at */
  answers: [Seat, Seat];
  match: boolean;
}

/**
 * The personalized snapshot each client receives. During 'answering' the
 * partner's choice is never included, only whether they have locked in.
 */
export interface GameView {
  code: string;
  phase: Phase;
  /** Your seat at the table. */
  you: Seat;
  players: [PlayerView, PlayerView | null];
  round: number; // 1-based, valid from the first 'asking' phase
  asker: Seat;
  question: string | null;
  /** Whether you have locked in an answer this round. */
  youAnswered: boolean;
  /** What you answered, echoed back so the UI can keep it highlighted. */
  yourAnswer: Seat | null;
  partnerAnswered: boolean;
  /** Only present in the 'reveal' phase. */
  reveal: RevealEntry | null;
  /** Rounds where both pointed at the same person. */
  matches: number;
  history: RevealEntry[];
}

export interface CreateAck {
  ok: boolean;
  error?: string;
  code?: string;
  playerId?: string;
}

export interface JoinAck {
  ok: boolean;
  error?: string;
  playerId?: string;
}

/** A pre-join look at a room, so the join screen can grey out the host's shoe. */
export interface PeekAck {
  ok: boolean;
  error?: string;
  hostName?: string;
  hostShoe?: ShoeStyle;
  hostColor?: ShoeColor;
}

export interface ClientToServerEvents {
  create: (name: string, outfit: Outfit, ack: (res: CreateAck) => void) => void;
  join: (code: string, name: string, outfit: Outfit, ack: (res: JoinAck) => void) => void;
  peek: (code: string, ack: (res: PeekAck) => void) => void;
  rejoin: (code: string, playerId: string, ack: (res: JoinAck) => void) => void;
  ask: (question: string) => void;
  answer: (choice: Seat) => void;
  next: () => void;
  leave: () => void;
}

export interface ServerToClientEvents {
  state: (view: GameView) => void;
  errorMsg: (message: string) => void;
}
