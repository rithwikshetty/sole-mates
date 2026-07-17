import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from './socket';
import type { GameView, Seat } from '../../shared/types';

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

  const create = useCallback((name: string) => {
    socket.emit('create', name, (res) => {
      storeSession({ code: res.code, playerId: res.playerId });
    });
  }, []);

  const join = useCallback(
    (code: string, name: string) =>
      new Promise<string | null>((resolve) => {
        socket.emit('join', code, name, (res) => {
          if (!res.ok || !res.playerId) return resolve(res.error ?? 'Could not join the room.');
          storeSession({ code: code.trim().toUpperCase(), playerId: res.playerId });
          resolve(null);
        });
      }),
    [],
  );

  const ask = useCallback((question: string) => socket.emit('ask', question), []);
  const answer = useCallback((choice: Seat) => socket.emit('answer', choice), []);
  const next = useCallback(() => socket.emit('next'), []);

  const leave = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setView(null);
  }, []);

  return { view, booting, toast, create, join, ask, answer, next, leave };
}
