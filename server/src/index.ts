// Local / self-hosted entry point. On Vercel, api/server.ts exports the same
// server for the Functions runtime instead.
import { httpServer } from './app.js';

const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, () => {
  console.log(`Sole Mates server listening on http://localhost:${PORT}`);
});
