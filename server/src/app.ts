import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import type { ClientToServerEvents, Seat, ServerToClientEvents } from '../../shared/types.js';
import {
  askQuestion,
  cleanName,
  parseOutfit,
  cleanQuestion,
  createRoom,
  deleteRoom,
  findSeat,
  getRoom,
  joinRoom,
  nextRound,
  setConnected,
  submitAnswer,
  sweepIdleRooms,
  viewFor,
  type Room,
} from './game.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

// The client always connects with path /api/server/game (the Vercel function
// route, dot-free, because Vercel treats dotted path segments as file
// requests). Normalize the /api/server prefix away here so the same server
// code works on Vercel, in local dev, and self-hosted.
const normalizeUrl = (req: { url?: string }) => {
  if (req.url) req.url = req.url.replace(/^\/api\/server(?=\/|\?|$)/, '') || '/';
};
httpServer.prependListener('request', normalizeUrl);
httpServer.prependListener('upgrade', normalizeUrl);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  path: '/game',
  // In dev the Vite client runs on another port; same-origin in production.
  cors: { origin: true },
});

// Serve the built client when it exists (production).
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('/healthz', (_req, res) => res.send('ok'));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/game')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => err && next());
});

interface SocketSession {
  room: Room;
  seat: Seat;
}

const sessions = new Map<string, SocketSession>(); // socket.id -> session

function broadcast(room: Room): void {
  for (const [socketId, session] of sessions) {
    if (session.room === room) {
      io.to(socketId).emit('state', viewFor(room, session.seat));
    }
  }
}

/** Presence is derived from the sessions map: a seat is connected while ANY socket holds it. */
function seatConnected(room: Room, seat: Seat): boolean {
  for (const session of sessions.values()) {
    if (session.room === room && session.seat === seat) return true;
  }
  return false;
}

/** Remove a socket's session and recompute presence for the seat it held. */
function detach(socketId: string): void {
  const session = sessions.get(socketId);
  if (!session) return;
  sessions.delete(socketId);
  setConnected(session.room, session.seat, seatConnected(session.room, session.seat));
  broadcast(session.room);
}

io.on('connection', (socket) => {
  const attach = (room: Room, seat: Seat) => {
    const prev = sessions.get(socket.id);
    if (prev && prev.room !== room) detach(socket.id);
    sessions.set(socket.id, { room, seat });
    setConnected(room, seat, true);
    broadcast(room);
  };

  socket.on('create', (rawName, rawOutfit, ack) => {
    if (typeof ack !== 'function') return;
    const name = cleanName(rawName) || 'Player 1';
    const outfit = parseOutfit(rawOutfit);
    if (!outfit) return void ack({ ok: false, error: 'Pick a shoe and a colour first.' });
    const { room, playerId } = createRoom(name, outfit);
    attach(room, 0);
    ack({ ok: true, code: room.code, playerId });
  });

  socket.on('peek', (rawCode, ack) => {
    if (typeof ack !== 'function') return;
    const room = getRoom(rawCode);
    if (!room) return void ack({ ok: false, error: 'Room not found. Check the code!' });
    if (room.players[1]) return void ack({ ok: false, error: 'This room is already full.' });
    const host = room.players[0];
    ack({ ok: true, hostName: host.name, hostShoe: host.shoe, hostColor: host.color });
  });

  socket.on('join', (rawCode, rawName, rawOutfit, ack) => {
    if (typeof ack !== 'function') return;
    const name = cleanName(rawName);
    if (!name) return void ack({ ok: false, error: 'Please enter a name.' });
    const room = getRoom(rawCode);
    if (!room) return void ack({ ok: false, error: 'Room not found. Check the code!' });
    const outfit = parseOutfit(rawOutfit);
    if (!outfit) return void ack({ ok: false, error: 'Pick a shoe and a colour first.' });
    const result = joinRoom(room, name, outfit);
    if ('error' in result) return void ack({ ok: false, error: result.error });
    attach(room, 1);
    ack({ ok: true, playerId: result.playerId });
  });

  socket.on('rejoin', (rawCode, playerId, ack) => {
    if (typeof ack !== 'function') return;
    const room = getRoom(rawCode);
    const seat = room ? findSeat(room, String(playerId)) : null;
    if (!room || seat === null) return void ack({ ok: false, error: 'This game has ended.' });
    attach(room, seat);
    ack({ ok: true, playerId: String(playerId) });
  });

  socket.on('ask', (rawQuestion) => {
    const session = sessions.get(socket.id);
    if (!session) return;
    const error = askQuestion(session.room, session.seat, cleanQuestion(rawQuestion));
    if (error) return void socket.emit('errorMsg', error);
    broadcast(session.room);
  });

  socket.on('answer', (choice) => {
    const session = sessions.get(socket.id);
    if (!session) return;
    const error = submitAnswer(session.room, session.seat, choice);
    if (error) return void socket.emit('errorMsg', error);
    broadcast(session.room);
  });

  socket.on('next', () => {
    const session = sessions.get(socket.id);
    if (!session) return;
    const error = nextRound(session.room);
    if (error) return void socket.emit('errorMsg', error);
    broadcast(session.room);
  });

  socket.on('leave', () => {
    const session = sessions.get(socket.id);
    if (!session) return;
    const { room } = session;
    detach(socket.id);
    // A room abandoned before the partner arrives is dead, so free the code.
    if (room.phase === 'lobby') deleteRoom(room.code);
  });

  socket.on('disconnect', () => {
    detach(socket.id);
  });
});

setInterval(() => {
  const activeCodes = new Set(Array.from(sessions.values(), (s) => s.room.code));
  const removed = sweepIdleRooms(activeCodes);
  if (removed.length) console.log(`Swept idle rooms: ${removed.join(', ')}`);
}, 10 * 60 * 1000).unref();

export { httpServer };
