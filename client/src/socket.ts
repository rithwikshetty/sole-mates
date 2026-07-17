import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';

// In dev the Vite client runs on :5173 and the game server on :3001;
// in production (Vercel or self-hosted) the client is served same-origin.
// The path matches the Vercel function route (/api/server) everywhere, and
// the websocket transport is required on Vercel Functions.
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.DEV ? 'http://localhost:3001' : '/',
  {
    // Dot-free path: Vercel routes dotted segments (like socket.io) to files.
    path: '/api/server/game',
    transports: ['websocket'],
  },
);
