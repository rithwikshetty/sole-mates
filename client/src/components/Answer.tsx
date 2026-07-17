import { useEffect, useState } from 'react';
import type { GameView, Seat } from '../../../shared/types';
import { colorInfo } from '../../../shared/shoes';
import { sfx } from '../sfx';
import { PlayerShoe } from './Shoes';

interface Props {
  view: GameView;
  answer: (choice: Seat) => void;
}

export default function Answer({ view, answer }: Props) {
  const [selected, setSelected] = useState<Seat | null>(view.yourAnswer);
  const partnerSeat: Seat = view.you === 0 ? 1 : 0;
  const partner = view.players[partnerSeat];

  // A new round resets the local selection.
  useEffect(() => {
    setSelected(view.yourAnswer);
  }, [view.round, view.yourAnswer]);

  const pick = (seat: Seat) => {
    if (view.youAnswered) return;
    sfx.select();
    setSelected(seat);
  };

  const lockIn = () => {
    if (selected === null || view.youAnswered) return;
    sfx.lockIn();
    answer(selected);
  };

  return (
    <section className="phase phase-answer">
      <p className="round-pill">Round {view.round}</p>
      <div className="card question-card">
        <p className="question-mark">“</p>
        <p className="question-text">{view.question}</p>
      </div>

      <p className="answer-prompt">{view.youAnswered ? 'You’re locked in!' : 'Raise a shoe! Who is it?'}</p>

      <div className="answer-grid">
        {([0, 1] as const).map((seat) => {
          const p = view.players[seat];
          const isPicked = selected === seat;
          const dimmed = selected !== null && !isPicked;
          return (
            <button
              key={seat}
              type="button"
              className={`answer-btn ${isPicked ? 'answer-btn-picked' : ''} ${dimmed ? 'answer-btn-dim' : ''} ${
                view.youAnswered && isPicked ? 'answer-btn-locked' : ''
              }`}
              style={{ '--seat-color': p ? colorInfo(p.color).hex : 'var(--rose)' } as React.CSSProperties}
              onClick={() => pick(seat)}
              disabled={view.youAnswered}
            >
              <PlayerShoe player={p} className="answer-shoe" flip={seat === 0} />
              <span className="answer-name">{p?.name}</span>
              {view.youAnswered && isPicked && <span className="locked-stamp">LOCKED ✔</span>}
            </button>
          );
        })}
      </div>

      {!view.youAnswered && (
        <button type="button" className="btn btn-rose btn-big lock-btn" disabled={selected === null} onClick={lockIn}>
          Lock it in! 🔒
        </button>
      )}

      <p className={`partner-status ${view.partnerAnswered ? 'partner-status-ready' : ''}`}>
        {view.partnerAnswered
          ? `${partner?.name} has locked in! 🎉`
          : `${partner?.name} is thinking… 🤔`}
      </p>
      {view.youAnswered && !view.partnerAnswered && (
        <p className="phase-hint">The big reveal happens when you’re both locked in.</p>
      )}
    </section>
  );
}
