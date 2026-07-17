import { sfx } from '../sfx';
import { ShoeDuo } from './Shoes';

interface Props {
  onClose: () => void;
}

const RULES: Array<{ emoji: string; title: string; text: string }> = [
  {
    emoji: '💌',
    title: 'Make a room',
    text: 'One of you creates a room and shares the 4-letter code. The other joins from any phone or computer.',
  },
  {
    emoji: '🎤',
    title: 'Take turns asking',
    text: 'Each round one of you asks a "who" question — write your own or hit 🎲 Surprise me for one of ours.',
  },
  {
    emoji: '🤫',
    title: 'Answer in secret',
    text: 'You BOTH answer the same question by raising a shoe — yours or theirs. No peeking! You only see that your partner has locked in, never what they picked.',
  },
  {
    emoji: '🥁',
    title: '3… 2… 1… reveal!',
    text: 'When both answers are locked, the shoes go up at the same time. Same shoe = a match and a point. Different shoes = time to argue about it. 😄',
  },
  {
    emoji: '♾️',
    title: 'Keep going',
    text: 'The asking turn swaps every round. Play to 10, play all night — the score keeps count of your matches.',
  },
];

export default function HowToPlay({ onClose }: Props) {
  const close = () => {
    sfx.click();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal card" role="dialog" aria-modal="true" aria-label="How to play" onClick={(e) => e.stopPropagation()}>
        <ShoeDuo className="modal-duo" />
        <h2 className="modal-title">How to play</h2>
        <ol className="rules">
          {RULES.map((rule) => (
            <li key={rule.title} className="rule">
              <span className="rule-emoji">{rule.emoji}</span>
              <div>
                <p className="rule-title">{rule.title}</p>
                <p className="rule-text">{rule.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="rule-footnote">
          House rule: the player with fewer matched answers makes breakfast. 🥞
          <br />
          <a className="rule-link" href="/how-to-play.html" target="_blank" rel="noreferrer">
            Full guide ↗
          </a>
        </p>
        <button type="button" className="btn btn-rose btn-big" onClick={close}>
          Got it — let’s play!
        </button>
      </div>
    </div>
  );
}
