# CLAUDE.md

Sole Mates is the wedding shoe game as a two-player web app: one player hosts a
room, the other joins with a 4-letter code, both answer "who" questions in
secret, and the answers reveal together after a countdown.

## Commands

```bash
npm install
npm run dev        # server on :3001, Vite client on :5173
npm run typecheck  # both workspaces; run after every change
npm run build      # client production build
vercel deploy --prod --yes
```

There is no test suite. Verify changes by playing a round across two browser
tabs (Playwright works well) and running typecheck.

## Layout

- `shared/` types (`types.ts`), shoe catalog (`shoes.ts`), question deck
  (`deck.ts`). Imported by both sides via relative paths, no build step.
- `server/src/game.ts` pure game logic and room state. `server/src/app.ts`
  Express + Socket.IO wiring and sessions. `server/src/index.ts` local entry.
- `client/src/` React 19 + Vite. `useGame.ts` is the only socket surface;
  screens live in `components/`. All mascots are hand-drawn SVG in
  `components/Shoes.tsx`. Sound is synthesized in `sfx.ts`, no audio files.
- `api/server/index.ts` Vercel Functions entry (exports the same httpServer).

## Invariants

- The server owns all game state. Clients only render `GameView` snapshots.
- `viewFor()` must never include the partner's answer during the answering
  phase, only the `partnerAnswered` boolean. Keep it that way.
- Each player picks a shoe style + colour on entry. The joiner cannot take the
  host's style; the server enforces this in `joinRoom`, the greyed-out picker
  tile is just courtesy.
- Rooms live in memory and are swept after an hour idle. No database.
- Validate every client payload on the server (see `cleanName`,
  `cleanQuestion`, `parseOutfit`). Lobby acks on the client use timeouts so a
  lost packet can't freeze a button.

## Vercel quirks (learned the hard way)

- Runs on the Vercel Functions WebSockets beta with Fluid compute. The client
  connects websocket-only to `/api/server/game`. The path must stay dot-free:
  Vercel treats dotted segments like `socket.io` as file requests.
- Plain GETs against the socket route can 404 at the platform while real
  WebSocket upgrades work fine. Do not "fix" routing based on curl probes;
  verify with a socket.io client instead.
- In-memory rooms mean two connections can land on different function
  instances. Players joining seconds apart share a warm instance in practice.

## Style

- SVG mascots get reviewed zoomed-in. After touching `Shoes.tsx`, open
  `/?gallery` (dev-only route) and screenshot it large before calling it done.
  No overlapping or misaligned strokes.
- All user-facing text follows a plain-writing rule: no em dashes, no "not X,
  but Y" constructions, no hype words, contractions where a person would use
  them. Deck questions should be thinkers, not the clichés on every wedding
  listicle.
- Keep the sticker-book look: 3px ink borders, hard offset shadows, the
  palette in `styles.css` variables.
