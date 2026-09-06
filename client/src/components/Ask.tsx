import { useState } from 'react';
import { FLAVOURS, randomQuestion, remaining, type Flavour } from '../../../shared/deck';
import type { GameView } from '../../../shared/types';
import { sfx } from '../sfx';
import { PlayerShoe } from './Shoes';

interface Props {
  view: GameView;
  ask: (question: string) => void;
  finish: () => void;
}

type Pick = Flavour | 'any';

export default function Ask({ view, ask, finish }: Props) {
  const [question, setQuestion] = useState('');
  const [flavour, setFlavour] = useState<Pick>('any');
  const youAsk = view.asker === view.you;
  const asker = view.players[view.asker];
  const canWrapUp = view.history.length > 0;

  const wrapUp = () => {
    sfx.click();
    finish();
  };

  const wrapUpLink = canWrapUp && (
    <button type="button" className="btn-link" onClick={wrapUp}>
      Wrap up and see the recap
    </button>
  );

  if (!youAsk) {
    return (
      <section className="phase phase-wait">
        <p className="round-pill">Round {view.round}</p>
        <div className="writer">
          <PlayerShoe player={asker} className="writer-shoe" flip={view.asker === 0} />
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
        {wrapUpLink}
      </section>
    );
  }

  // Skip anything already asked this game, and whatever is on screen right now,
  // so a redraw never repeats a question or falls back to an answered one.
  const used = new Set(view.history.map((h) => h.question));
  const left = remaining(used, flavour);
  const skip = new Set(used);
  skip.add(question.trim());
  const alternatives = remaining(skip, flavour);

  const surprise = () => {
    if (alternatives === 0) return;
    sfx.select();
    setQuestion(randomQuestion(skip, flavour));
  };

  const pickFlavour = (id: Pick) => {
    sfx.select();
    setFlavour(id);
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
        <div className="flavour-row" role="radiogroup" aria-label="Question flavour">
          <button
            type="button"
            role="radio"
            aria-checked={flavour === 'any'}
            className={`flavour-chip ${flavour === 'any' ? 'flavour-chip-picked' : ''}`}
            onClick={() => pickFlavour('any')}
          >
            ✨ Any
          </button>
          {FLAVOURS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={flavour === f.id}
              className={`flavour-chip ${flavour === f.id ? 'flavour-chip-picked' : ''}`}
              onClick={() => pickFlavour(f.id)}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
        <div className="ask-actions">
          <button type="button" className="btn btn-gold" onClick={surprise} disabled={alternatives === 0}>
            🎲 Surprise me
          </button>
          <button type="button" className="btn btn-rose" disabled={!question.trim()} onClick={submit}>
            Ask it! 📣
          </button>
        </div>
        <p className="deck-count">
          {left === 0 ? 'You have asked every question in this pile!' : `${left} unasked in this pile`}
        </p>
      </div>
      <p className="phase-hint">You both answer it, even you!</p>
      {wrapUpLink}
    </section>
  );
}
