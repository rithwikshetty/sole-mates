import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import type { GameView, Seat } from '../../../shared/types';
import { sfx } from '../sfx';
import { SeatShoe, SEAT_COLORS } from './Shoes';

interface Props {
  view: GameView;
  next: () => void;
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

export default function Reveal({ view, next }: Props) {
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
              <SeatShoe seat={chosenSeat} className="reveal-shoe" flip={chosenSeat === 0} />
              <p className="reveal-chosen" style={{ background: SEAT_COLORS[chosenSeat] }}>
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

      <button
        type="button"
        className="btn btn-slate btn-big"
        onClick={() => {
          sfx.click();
          next();
        }}
      >
        Next round — {nextAsker?.name} asks! ➜
      </button>
    </section>
  );
}
