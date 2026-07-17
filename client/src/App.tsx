import { useEffect, useRef, useState } from 'react';
import Game from './components/Game';
import Home from './components/Home';
import HowToPlay from './components/HowToPlay';
import Lobby from './components/Lobby';
import { BrideShoe } from './components/Shoes';
import { isMuted, sfx, startMusic, syncMutedFromStorage, toggleMuted } from './sfx';
import { useGame } from './useGame';

export default function App() {
  const { view, booting, toast, create, join, ask, answer, next, leave } = useGame();
  const [showHelp, setShowHelp] = useState(false);
  const [muted, setMuted] = useState(isMuted());

  // Browsers require a user gesture before audio — arm the music on first tap.
  useEffect(() => {
    const arm = () => startMusic();
    window.addEventListener('pointerdown', arm, { once: true });
    return () => window.removeEventListener('pointerdown', arm);
  }, []);

  // Keep mute in sync across tabs (the 'storage' event fires in other tabs).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sole-mates-muted') setMuted(syncMutedFromStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // A little jingle when your partner locks in their answer.
  const prevPartnerReady = useRef(false);
  useEffect(() => {
    const ready = view?.phase === 'answering' && view.partnerAnswered;
    if (ready && !prevPartnerReady.current) sfx.partnerReady();
    prevPartnerReady.current = !!ready;
  }, [view?.phase, view?.partnerAnswered]);

  // And one when your partner joins the room.
  const prevPlayers = useRef(1);
  useEffect(() => {
    const count = view ? (view.players[1] ? 2 : 1) : 1;
    if (count === 2 && prevPlayers.current === 1) sfx.join();
    prevPlayers.current = count;
  }, [view]);

  if (booting) {
    return (
      <div className="boot">
        <BrideShoe className="boot-shoe" />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="corner-btns">
        <button
          type="button"
          className="icon-btn"
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          onClick={() => setMuted(toggleMuted())}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="How to play"
          onClick={() => {
            sfx.click();
            setShowHelp(true);
          }}
        >
          ?
        </button>
      </div>

      {!view ? (
        <Home create={create} join={join} />
      ) : view.phase === 'lobby' ? (
        <Lobby view={view} leave={leave} />
      ) : (
        <Game view={view} ask={ask} answer={answer} next={next} />
      )}

      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
      {toast && (
        <div className="toast" role="alert">
          {toast}
        </div>
      )}
    </div>
  );
}
