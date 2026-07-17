import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from './socket';
import type { GameView, Outfit, PeekAck, Seat } from '../../shared/types';

const STORAGE_KEY = 'sole-mates-session';

interface StoredSession {
  code: string;
  playerId: string;
}

function readStored(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function storeSession(session: StoredSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function useGame() {
  const [view, setView] = useState<GameView | null>(null);
  const [booting, setBooting] = useState(() => readStored() !== null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const onState = (v: GameView) => setView(v);

    // Re-attach to the room on first connect and after any reconnect.
    const onConnect = () => {
      const stored = readStored();
      if (!stored) {
        setBooting(false);
        return;
      }
      socket.emit('rejoin', stored.code, stored.playerId, (res) => {
        if (!res.ok) {
          sessionStorage.removeItem(STORAGE_KEY);
          setView(null);
        }
        setBooting(false);
      });
    };

    socket.on('state', onState);
    socket.on('errorMsg', showToast);
    socket.on('connect', onConnect);
    if (socket.connected) onConnect();

    return () => {
      socket.off('state', onState);
      socket.off('errorMsg', showToast);
      socket.off('connect', onConnect);
    };
  }, [showToast]);

  // All lobby acks time out so a dropped packet can't leave a button stuck on "busy".
  const ACK_TIMEOUT_MS = 7000;
  const TIMEOUT_MSG = 'The connection hiccuped. Give it another go.';

  const create = useCallback(
    (name: string, outfit: Outfit) =>
      new Promise<string | null>((resolve) => {
        socket.timeout(ACK_TIMEOUT_MS).emit('create', name, outfit, (err, res) => {
          if (err || !res?.ok || !res.code || !res.playerId)
            return resolve(res?.error ?? TIMEOUT_MSG);
          storeSession({ code: res.code, playerId: res.playerId });
          resolve(null);
        });
      }),
    [],
  );

  const join = useCallback(
    (code: string, name: string, outfit: Outfit) =>
      new Promise<string | null>((resolve) => {
        socket.timeout(ACK_TIMEOUT_MS).emit('join', code, name, outfit, (err, res) => {
          if (err) return resolve(TIMEOUT_MSG);
          if (!res.ok || !res.playerId) return resolve(res.error ?? 'Could not join the room.');
          storeSession({ code: code.trim().toUpperCase(), playerId: res.playerId });
          resolve(null);
        });
      }),
    [],
  );

  /** Look at a room before joining, so the picker can grey out the host's shoe. */
  const peek = useCallback(
    (code: string) =>
      new Promise<PeekAck>((resolve) => {
        socket.timeout(ACK_TIMEOUT_MS).emit('peek', code, (err, res) => {
          resolve(err ? { ok: false, error: TIMEOUT_MSG } : res);
        });
      }),
    [],
  );

  const ask = useCallback((question: string) => socket.emit('ask', question), []);
  const answer = useCallback((choice: Seat) => socket.emit('answer', choice), []);
  const next = useCallback(() => socket.emit('next'), []);

  const leave = useCallback(() => {
    socket.emit('leave');
    sessionStorage.removeItem(STORAGE_KEY);
    setView(null);
  }, []);

  return { view, booting, toast, create, join, peek, ask, answer, next, leave };
}
