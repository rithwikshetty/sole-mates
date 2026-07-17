// Vercel Functions entry: exporting the Node http server lets Vercel route
// requests (including WebSocket upgrades on /api/server/socket.io) to it.
// Requires Fluid compute (default) — WebSocket support is in public beta.
import { httpServer } from '../../server/src/app.js';

export default httpServer;
