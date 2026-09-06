// Vercel Functions entry: exporting the Node http server lets Vercel route
// requests, including WebSocket upgrades on /api/server/game, to it.
// Needs Fluid compute (the default); WebSocket support is in public beta.
import { httpServer } from '../../server/src/app.js';

export default httpServer;
