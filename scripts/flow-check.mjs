// End-to-end check of the game protocol against a running server.
// Start the server first (npm run dev, or PORT=3999 npm start -w server),
// then: GAME_URL=http://localhost:3999 npm run check:flow
// Exits non-zero on the first failing assertion group.
import { io } from 'socket.io-client';
const URL = process.env.GAME_URL ?? 'http://localhost:3001';
const opts = { path: '/api/server/game', transports: ['websocket'] };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (cond, label) => { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) failures++; };
const emitAck = (s, ev, ...args) => new Promise((r) => s.emit(ev, ...args, r));
const latest = new Map();
const track = (s) => s.on('state', (v) => latest.set(s, v));
const nextState = (s, pred = () => true) => new Promise((r) => {
  const cur = latest.get(s);
  if (cur && pred(cur)) return r(cur);
  const h = (v) => { if (pred(v)) { s.off('state', h); r(v); } };
  s.on('state', h);
});
const errors = (s) => { const list = []; s.on('errorMsg', (m) => list.push(m)); return list; };

const a = io(URL, opts); const b = io(URL, opts); track(a); track(b);
const aErr = errors(a), bErr = errors(b);
await Promise.all([new Promise((r) => a.on('connect', r)), new Promise((r) => b.on('connect', r))]);

// create with bad payloads
let r = await emitAck(a, 'create', 'Rithwik', { shoe: 'nope', color: 'rose' });
check(!r.ok, 'create rejects unknown shoe');
r = await emitAck(a, 'create', 12345, { shoe: 'heel', color: 'rose' });
check(r.ok, 'create with non-string name falls back to Player 1');
let v = await nextState(a);
check(v.players[0].name === 'Player 1', 'non-string name becomes Player 1, not "12345"');
// new room for the real run
latest.delete(a);
r = await emitAck(a, 'create', '  Rithwik   Shetty  ', { shoe: 'heel', color: 'rose' });
const code = r.code; const aId = r.playerId;
v = await nextState(a);
check(v.players[0].name === 'Rithwik Shetty', 'name whitespace collapsed: ' + JSON.stringify(v.players[0].name));

// peek/join validation
r = await emitAck(b, 'peek', code, '');
check(!r.ok, 'peek requires a name');
r = await emitAck(b, 'peek', code, 'rithwik shetty');
check(!r.ok && /already using that name/.test(r.error), 'peek rejects same name (case-insensitive)');
r = await emitAck(b, 'peek', code, 'Neha');
check(r.ok && r.partnerName === 'Rithwik Shetty' && r.partnerShoe === 'heel' && r.resuming === false, 'peek returns partner and resuming=false');
r = await emitAck(b, 'join', code, 'Neha', { shoe: 'heel', color: 'teal' });
check(!r.ok && /already picked/.test(r.error), 'join rejects partner style');
r = await emitAck(b, 'join', code, 'Neha', { shoe: 'oxford', color: 'teal' });
check(r.ok, 'join ok');
const bId = r.playerId;
v = await nextState(a, (x) => x.phase === 'asking');
check(v.round === 1 && v.asker === 0, 'phase asking, round 1, host asks');

// ask with a non-string payload -> empty -> error
a.emit('ask', undefined);
await wait(100);
check(aErr.some((m) => /cannot be empty/.test(m)), 'ask with undefined is rejected as empty');
b.emit('ask', 'Who cooks?');
await wait(100);
check(bErr.some((m) => /partner's turn/.test(m)), 'non-asker cannot ask');

// play round 1: match
a.emit('ask', 'Who is the better cook?');
v = await nextState(b, (x) => x.phase === 'answering');
check(v.question === 'Who is the better cook?' && v.reveal === null, 'b sees question in answering');
a.emit('answer', 1);
v = await nextState(b, (x) => x.partnerAnswered);
check(v.partnerAnswered === true && v.reveal === null && v.yourAnswer === null, 'b sees partnerAnswered only, no answer leak');
b.emit('answer', 1);
v = await nextState(a, (x) => x.phase === 'reveal');
check(v.reveal.match && v.matches === 1 && v.streak === 1 && v.bestStreak === 1, 'round 1 match, streak 1');

// double next: both tap
a.emit('next'); b.emit('next'); a.emit('next');
await wait(200);
check(!aErr.some((m) => /not over yet/.test(m)) && !bErr.some((m) => /not over yet/.test(m)), 'double next produces no error toast');
v = latest.get(a);
check(v.phase === 'asking' && v.round === 2 && v.asker === 1, 'round 2, guest asks (double next did not skip a round)');

// finish in answering is refused
b.emit('ask', 'Who snores?');
await nextState(a, (x) => x.phase === 'answering');
a.emit('finish'); await wait(100);
check(aErr.some((m) => /Finish this round first/.test(m)), 'finish refused during answering');
a.emit('answer', 0); b.emit('answer', 1);
v = await nextState(a, (x) => x.phase === 'reveal');
check(!v.reveal.match && v.streak === 0 && v.bestStreak === 1 && v.matches === 1, 'round 2 mismatch resets streak');

// finish -> recap (from reveal: asker 1 just asked, so the turn passes to 0)
b.emit('finish');
v = await nextState(a, (x) => x.phase === 'finished');
check(v.history.length === 2 && v.reveal === null, 'finished phase with 2 rounds of history');
check(v.asker === 0, 'finishing from reveal passes the asking turn');
a.emit('finish'); await wait(100);
check(!aErr.some((m) => /Wrap up|Play at least/.test(m)), 'second finish is a silent no-op');

// restart
a.emit('restart');
v = await nextState(b, (x) => x.phase === 'asking');
check(v.round === 1 && v.history.length === 0 && v.matches === 0 && v.asker === 0, 'restart resets score, asker alternates back to host');
b.emit('restart'); await wait(100);
check(!bErr.some((m) => /Wrap up the game/.test(m)), 'double restart is silent');

// finish from the asking screen after "next": asker must not flip twice on restart
a.emit('ask', 'Who laughs first?');
await nextState(b, (x) => x.phase === 'answering');
a.emit('answer', 0); b.emit('answer', 0);
await nextState(a, (x) => x.phase === 'reveal');
a.emit('next');
v = await nextState(a, (x) => x.phase === 'asking' && x.round === 2);
check(v.asker === 1, 'after next, guest is due to ask');
a.emit('finish');
v = await nextState(a, (x) => x.phase === 'finished');
check(v.asker === 1, 'finishing from asking keeps the pending asker');
a.emit('restart');
v = await nextState(a, (x) => x.phase === 'asking' && x.history.length === 0);
check(v.asker === 1 && v.round === 1, 'restart after asking-screen wrap-up keeps the guest as asker');

// host reclaims an empty lobby from a new device
const h1 = io(URL, opts); track(h1); await new Promise((r) => h1.on('connect', r));
r = await emitAck(h1, 'create', 'Solo', { shoe: 'loafer', color: 'plum' });
const lobbyCode = r.code;
const h2 = io(URL, opts); track(h2); await new Promise((r) => h2.on('connect', r));
r = await emitAck(h2, 'peek', lobbyCode, 'solo');
check(!r.ok, 'connected host cannot be displaced');
h1.disconnect(); await wait(150);
r = await emitAck(h2, 'peek', lobbyCode, 'solo');
check(r.ok && r.resuming === true && r.partnerShoe === undefined, 'disconnected host can reclaim an empty lobby');
r = await emitAck(h2, 'join', lobbyCode, 'solo', { shoe: 'loafer', color: 'sky' });
check(r.ok, 'host reclaim join ok (same style allowed, nobody else has it)');
v = await nextState(h2, (x) => x.players[0].connected);
check(v.phase === 'lobby' && v.players[1] === null && v.players[0].name === 'solo', 'reclaimed room stays in lobby');
h2.close();

// seat takeover: b drops, rejoins from a "new device" with same name
b.disconnect();
v = await nextState(a, (x) => x.players[1] && !x.players[1].connected);
check(v.players[1].connected === false, 'a sees b offline');
const b2 = io(URL, opts); track(b2);
await new Promise((r) => b2.on('connect', r));
r = await emitAck(b2, 'peek', code, 'neha');
check(r.ok && r.resuming === true && r.partnerName === 'Rithwik Shetty', 'peek from new device sees resuming seat');
r = await emitAck(b2, 'join', code, 'neha', { shoe: 'sneaker', color: 'sage' });
check(r.ok && r.playerId !== bId, 'takeover join issues a fresh playerId');
v = await nextState(a, (x) => x.players[1]?.connected);
check(v.players[1].name === 'neha' && v.players[1].shoe === 'sneaker' && v.round === 1 && v.phase === 'asking', 'game continued with rejoined guest');
// old playerId is dead
const b3 = io(URL, opts); await new Promise((r) => b3.on('connect', r));
r = await emitAck(b3, 'rejoin', code, bId);
check(!r.ok, 'stale playerId cannot rejoin');
r = await emitAck(b3, 'rejoin', code, { evil: true });
check(!r.ok, 'non-string playerId rejected');
// stranger cannot take a connected seat
r = await emitAck(b3, 'peek', code, 'Someone');
check(!r.ok && /full/.test(r.error), 'room full for a third name');

// host takeover while guest connected
a.disconnect();
await nextState(b2, (x) => !x.players[0].connected);
const a2 = io(URL, opts); track(a2); await new Promise((r) => a2.on('connect', r));
r = await emitAck(a2, 'peek', code, 'RITHWIK SHETTY');
check(r.ok && r.resuming && r.partnerShoe === 'sneaker', 'host can resume their seat too');
r = await emitAck(a2, 'join', code, 'RITHWIK SHETTY', { shoe: 'sneaker', color: 'rose' });
check(!r.ok, 'resuming host cannot take the guest style');
r = await emitAck(a2, 'join', code, 'RITHWIK SHETTY', { shoe: 'welly', color: 'rose' });
check(r.ok, 'host resumed');
v = await nextState(b2, (x) => x.players[0].connected);
check(v.players[0].name === 'RITHWIK SHETTY' && v.players[0].shoe === 'welly', 'guest sees resumed host');

// rejoin with the original stored id still works when connected (normal reload path)
const a3 = io(URL, opts); await new Promise((r) => a3.on('connect', r));
r = await emitAck(a3, 'rejoin', code, aId);
check(!r.ok, 'old host id invalid after takeover');

console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS');
for (const s of [a, b, b2, b3, a2, a3]) s.close();
process.exit(failures ? 1 : 0);
