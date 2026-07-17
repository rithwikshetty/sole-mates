# Sole Mates 👠🎩

The wedding shoe game, online — a two-player game for couples. One of you creates a
room, the other joins with a 4-letter code from any device. Take turns asking "who"
questions, both secretly raise a shoe, then the answers reveal simultaneously after a
3-2-1 countdown. Matches score points; mismatches start arguments (the fun kind).

**How to play:** see [`client/public/how-to-play.html`](client/public/how-to-play.html)
(served at `/how-to-play.html` in the app, also linked from the in-app "?" modal).

## Stack

- `client/` — Vite + React 19 + TypeScript. Sticker-book wedding theme, hand-drawn SVG
  mascots (`src/components/Shoes.tsx`), Web Audio sound effects and generative music
  (`src/sfx.ts`), canvas-confetti on matches.
- `server/` — Node + Express + Socket.IO (TypeScript, run with `tsx`). Authoritative
  game state, rooms held in memory, personalized state snapshots that never leak the
  partner's answer before the reveal.
- `shared/` — types and the built-in question deck, imported by both sides.
- `api/server.ts` — Vercel Functions entry (WebSockets public beta, Fluid compute).

## Develop

```bash
npm install
npm run dev        # server on :3001, Vite client on :5173
npm run typecheck  # both workspaces
```

## Run production build locally

```bash
npm run build
npm start          # serves client/dist + game socket on :3001
```

## Deploy (Vercel)

```bash
vercel deploy --prod
```

Notes:

- The Socket.IO client connects with `path: /api/server/socket.io` and the
  `websocket` transport only (required on Vercel). The server normalizes the
  `/api/server` prefix away, so the same code runs locally and on Vercel.
- Rooms are **in-memory**: on Vercel, a reconnect can land on a different function
  instance and lose the room (public-beta caveat). Fine for casual play; for durable
  rooms, add a Marketplace Redis and move room state there.
- WebSocket connections are capped at `maxDuration` (300s); the client reconnects
  and rejoins automatically via the session stored in `sessionStorage`.
