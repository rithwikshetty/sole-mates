import { useState } from 'react';
import { randomQuestion } from '../../../shared/deck';
import type { GameView } from '../../../shared/types';
import { sfx } from '../sfx';
import { SeatShoe } from './Shoes';

interface Props {
  view: GameView;
  ask: (question: string) => void;
}

export default function Ask({ view, ask }: Props) {
  const [question, setQuestion] = useState('');
  const youAsk = view.asker === view.you;
  const asker = view.players[view.asker];

  if (!youAsk) {
    return (
      <section className="phase phase-wait">
        <p className="round-pill">Round {view.round}</p>
        <div className="writer">
          <SeatShoe seat={view.asker} className="writer-shoe" flip={view.asker === 0} />
          <span className="writer-pencil">✏️</span>
        </div>
        <h2 className="phase-title">
          {asker?.name} is cooking up a question
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </h2>
        <p className="phase-hint">Get your answer face ready!</p>
      </section>
    );
  }

  const surprise = () => {
    sfx.select();
    const used = new Set(view.history.map((h) => h.question));
    setQuestion(randomQuestion(used));
  };

  const submit = () => {
    if (!question.trim()) return;
    sfx.lockIn();
    ask(question.trim());
  };

  return (
    <section className="phase phase-ask">
      <p className="round-pill">Round {view.round}</p>
      <h2 className="phase-title">Your turn to ask! 🎤</h2>
      <div className="card ask-card">
        <textarea
          className="question-input"
          value={question}
          maxLength={200}
          rows={3}
          placeholder={'Ask a "who" question…\ne.g. Who takes longer to get ready?'}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="ask-actions">
          <button type="button" className="btn btn-gold" onClick={surprise}>
            🎲 Surprise me
          </button>
          <button type="button" className="btn btn-rose" disabled={!question.trim()} onClick={submit}>
            Ask it! 📣
          </button>
        </div>
      </div>
      <p className="phase-hint">You both answer it — even you!</p>
    </section>
  );
}
