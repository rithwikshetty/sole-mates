import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import type { GameView, Seat } from '../../../shared/types';
import { colorInfo } from '../../../shared/shoes';
import { sfx } from '../sfx';
import { PlayerShoe } from './Shoes';

interface Props {
  view: GameView;
  next: () => void;
  finish: () => void;
}

/** Returns the follow-up burst timer so the caller can cancel it on unmount. */
function confettiBurst(): number {
  const colors = ['#F0688F', '#6188C6', '#E9BA4F', '#FFFDF8'];
  confetti({ particleCount: 90, spread: 75, origin: { x: 0.2, y: 0.7 }, colors });
  confetti({ particleCount: 90, spread: 75, origin: { x: 0.8, y: 0.7 }, colors });
  return window.setTimeout(
    () => confetti({ particleCount: 60, spread: 100, origin: { x: 0.5, y: 0.4 }, colors }),
    350,
  );
}

function streakLine(view: GameView): string | null {
  const { streak, bestStreak, history } = view;
  if (streak >= 5) return `🔥 ${streak} in a row. Are you the same person?`;
  if (streak >= 3) return `🔥 ${streak} in a row!`;
  if (streak === 2) return '🔥 Two in a row, keep it going!';
  const previous = history[history.length - 2];
  if (streak === 0 && previous?.match && bestStreak >= 2) return `Streak over. Best run this game: ${bestStreak}.`;
  return null;
}

export default function Reveal({ view, next, finish }: Props) {
  const [count, setCount] = useState(3);
  const roundKey = view.history.length;
  const reveal = view.reveal;

  useEffect(() => {
    setCount(3);
  }, [roundKey]);

  useEffect(() => {
    if (!reveal) return;
    if (count <= 0) {
      let burstTimer: number | undefined;
      if (reveal.match) {
        sfx.match();
        burstTimer = confettiBurst();
      } else {
        sfx.mismatch();
      }
      return () => window.clearTimeout(burstTimer);
    }
    sfx.tick();
    const t = setTimeout(() => setCount((c) => c - 1), 750);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, roundKey]);

  if (!reveal) return null;

  if (count > 0) {
    return (
      <section className="phase countdown">
        <p className="countdown-label">Answers in…</p>
        <div key={count} className="countdown-num">
          {count}
        </div>
      </section>
    );
  }

  const nextAsker = view.players[view.asker === 0 ? 1 : 0];
  const streak = streakLine(view);

  return (
    <section className="phase phase-reveal">
      <div className={`verdict ${reveal.match ? 'verdict-match' : 'verdict-miss'}`}>
        {reveal.match ? "IT'S A MATCH! 💍" : 'AGREE TO DISAGREE 😅'}
      </div>

      <p className="reveal-question">“{reveal.question}”</p>

      <div className="reveal-grid">
        {([0, 1] as const).map((seat) => {
          const chooser = view.players[seat];
          const chosenSeat: Seat = reveal.answers[seat];
          const chosen = view.players[chosenSeat];
          return (
            <div
              key={seat}
              className="reveal-card card"
              style={{ animationDelay: `${seat * 0.25}s`, borderColor: 'var(--ink)' }}
            >
              <p className="reveal-chooser">{chooser?.name} raised…</p>
              <PlayerShoe player={chosen} className="reveal-shoe" flip={chosenSeat === 0} />
              <p className="reveal-chosen" style={{ background: chosen ? colorInfo(chosen.color).hex : 'var(--rose)' }}>
                {chosen?.name}
              </p>
            </div>
          );
        })}
      </div>

      <p className="score-line">
        ❤️ {view.matches} match{view.matches === 1 ? '' : 'es'} in {view.history.length} round
        {view.history.length === 1 ? '' : 's'}
      </p>
      {streak && <p className="streak-line">{streak}</p>}

      <button
        type="button"
        className="btn btn-slate btn-big"
        onClick={() => {
          sfx.click();
          next();
        }}
      >
        Next round, {nextAsker?.name} asks! ➜
      </button>
      <button
        type="button"
        className="btn-link"
        onClick={() => {
          sfx.click();
          finish();
        }}
      >
        Wrap up and see the recap
      </button>
    </section>
  );
}
