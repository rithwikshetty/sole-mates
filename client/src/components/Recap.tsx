import { useState } from 'react';
import type { GameView, Seat } from '../../../shared/types';
import { colorInfo } from '../../../shared/shoes';
import { sfx } from '../sfx';
import { PlayerShoe } from './Shoes';

interface Props {
  view: GameView;
  restart: () => void;
  leave: () => void;
}

function verdictFor(rate: number): { title: string; blurb: string } {
  if (rate >= 0.8) return { title: 'Sole mates, confirmed 💍', blurb: 'You two share a brain. Slightly unsettling, mostly lovely.' };
  if (rate >= 0.6) return { title: 'Same page, mostly 📖', blurb: 'Plenty of matches, with a few rounds worth arguing about.' };
  if (rate >= 0.4) return { title: 'Two very different memories 🤔', blurb: 'Half the time you agree. The other half is where the stories come from.' };
  return { title: 'Agree to disagree 😅', blurb: 'You see each other very differently. That is either a problem or the whole point.' };
}

export default function Recap({ view, restart, leave }: Props) {
  const [shared, setShared] = useState(false);
  const rounds = view.history.length;
  const rate = rounds ? view.matches / rounds : 0;
  const verdict = verdictFor(rate);
  const [a, b] = view.players;

  // How often each shoe went up, and how often each player pointed at themselves.
  const raised: [number, number] = [0, 0];
  const selfPicks: [number, number] = [0, 0];
  for (const entry of view.history) {
    for (const seat of [0, 1] as const) {
      raised[entry.answers[seat]] += 1;
      if (entry.answers[seat] === seat) selfPicks[seat] += 1;
    }
  }
  const mostRaised: Seat | null = raised[0] === raised[1] ? null : raised[0] > raised[1] ? 0 : 1;

  const summary = [
    `Sole Mates: ${a.name} & ${b?.name ?? '?'} matched ${view.matches} of ${rounds} round${rounds === 1 ? '' : 's'}.`,
    view.bestStreak >= 2 ? `Best streak: ${view.bestStreak} in a row.` : null,
    mostRaised !== null ? `${view.players[mostRaised]?.name}'s shoe went up ${raised[mostRaised]} times.` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const share = async () => {
    sfx.click();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Sole Mates', text: summary });
        return;
      }
      await navigator.clipboard.writeText(summary);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* user cancelled the share sheet */
    }
  };

  return (
    <section className="phase phase-recap">
      <p className="round-pill">Recap</p>
      <h2 className="phase-title">{verdict.title}</h2>
      <p className="phase-hint">{verdict.blurb}</p>

      <div className="stat-row">
        <div className="card stat">
          <span className="stat-num">
            {view.matches}/{rounds}
          </span>
          <span className="stat-label">matched</span>
        </div>
        <div className="card stat">
          <span className="stat-num">{Math.round(rate * 100)}%</span>
          <span className="stat-label">in sync</span>
        </div>
        <div className="card stat">
          <span className="stat-num">{view.bestStreak}</span>
          <span className="stat-label">best streak</span>
        </div>
      </div>

      <div className="card recap-card">
        <p className="recap-fact">
          {mostRaised !== null
            ? `${view.players[mostRaised]?.name}'s shoe went up the most: ${raised[mostRaised]} of ${rounds * 2} raises.`
            : 'Both shoes went up exactly the same number of times. Balanced.'}
        </p>
        <p className="recap-fact">
          {a.name} pointed at themselves {selfPicks[0]} time{selfPicks[0] === 1 ? '' : 's'}, {b?.name} {selfPicks[1]} time
          {selfPicks[1] === 1 ? '' : 's'}.
        </p>
      </div>

      <ol className="scrapbook">
        {view.history.map((entry, i) => (
          <li key={i} className={`scrap ${entry.match ? 'scrap-match' : 'scrap-miss'}`}>
            <span className="scrap-num">{i + 1}</span>
            <div className="scrap-body">
              <p className="scrap-question">{entry.question}</p>
              <div className="scrap-answers">
                {([0, 1] as const).map((seat) => {
                  const chooser = view.players[seat];
                  const chosen = view.players[entry.answers[seat]];
                  return (
                    <span key={seat} className="scrap-answer">
                      <PlayerShoe player={chosen} className="scrap-shoe" flip={entry.answers[seat] === 0} />
                      <span className="scrap-answer-text">
                        {chooser?.name} said{' '}
                        <strong style={{ color: chosen ? colorInfo(chosen.color).deep : 'inherit' }}>{chosen?.name}</strong>
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
            <span className="scrap-mark" aria-label={entry.match ? 'match' : 'mismatch'}>
              {entry.match ? '💍' : '😅'}
            </span>
          </li>
        ))}
      </ol>

      <div className="recap-actions">
        <button
          type="button"
          className="btn btn-rose btn-big"
          onClick={() => {
            sfx.lockIn();
            restart();
          }}
        >
          Play again 🔁
        </button>
        <button type="button" className="btn btn-gold" onClick={share}>
          {shared ? 'Copied! ✅' : 'Share the score 📤'}
        </button>
      </div>
      <button
        type="button"
        className="btn-link"
        onClick={() => {
          sfx.click();
          leave();
        }}
      >
        Leave the room
      </button>
    </section>
  );
}
