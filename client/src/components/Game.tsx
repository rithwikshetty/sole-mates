import type { GameView, Seat } from '../../../shared/types';
import Answer from './Answer';
import Ask from './Ask';
import Reveal from './Reveal';
import { colorInfo } from '../../../shared/shoes';
import { Heart } from './Shoes';

interface Props {
  view: GameView;
  ask: (question: string) => void;
  answer: (choice: Seat) => void;
  next: () => void;
}

export default function Game({ view, ask, answer, next }: Props) {
  const partnerSeat: Seat = view.you === 0 ? 1 : 0;
  const partner = view.players[partnerSeat];

  return (
    <main className="screen game">
      <header className="game-header">
        <div className="header-names">
          {([0, 1] as const).map((seat) => {
            const p = view.players[seat];
            return (
              <span
                key={seat}
                className={`name-chip ${p && !p.connected ? 'name-chip-offline' : ''}`}
                style={{ background: p ? colorInfo(p.color).hex : 'var(--rose)' }}
              >
                {p ? p.name : '…'}
                {seat === view.you && <em> (you)</em>}
              </span>
            );
          })}
        </div>
        <div className="header-score" title={`${view.matches} matching answers so far`}>
          <Heart className="score-heart" />
          <span className="score-num">{view.matches}</span>
        </div>
      </header>

      {partner && !partner.connected && (
        <div className="offline-banner">
          {partner.name} lost connection… hang tight, they can rejoin! 📶
        </div>
      )}

      {view.phase === 'asking' && <Ask view={view} ask={ask} />}
      {view.phase === 'answering' && <Answer view={view} answer={answer} />}
      {view.phase === 'reveal' && <Reveal view={view} next={next} />}
    </main>
  );
}
