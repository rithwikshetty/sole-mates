import { useState } from 'react';
import type { GameView } from '../../../shared/types';
import { sfx } from '../sfx';
import { Bunting, PlayerShoe, ShoePic } from './Shoes';

interface Props {
  view: GameView;
  leave: () => void;
}

export default function Lobby({ view, leave }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${location.origin}/?code=${view.code}`;

  const copy = async () => {
    sfx.click();
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Sole Mates',
          text: `Play the shoe game with me! Room code: ${view.code}`,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled the share sheet */
    }
  };

  return (
    <main className="screen lobby">
      <Bunting className="bunting" />
      <h2 className="screen-title">Your room is ready!</h2>

      <div className="card ticket">
        <p className="ticket-label">ROOM CODE</p>
        <p className="ticket-code">
          {view.code.split('').map((ch, i) => (
            <span key={i} className="ticket-letter" style={{ animationDelay: `${i * 0.1}s` }}>
              {ch}
            </span>
          ))}
        </p>
        <button type="button" className="btn btn-gold" onClick={copy}>
          {copied ? 'Copied! ✅' : 'Share invite 📤'}
        </button>
      </div>

      <div className="lobby-wait">
        <PlayerShoe player={view.players[0]} className="lobby-shoe" />
        <div className="lobby-ghost">
          <ShoePic
            shoe={view.players[0].shoe === 'oxford' ? 'sneaker' : 'oxford'}
            color="slate"
            className="lobby-shoe lobby-shoe-ghost"
            flip
          />
        </div>
      </div>
      <p className="wait-text">
        Hey <strong>{view.players[0].name}</strong>! Waiting for your better half
        <span className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
      <p className="wait-hint">Send them the code. They can join from any phone or computer.</p>

      <button type="button" className="btn-link" onClick={leave}>
        ← back home
      </button>
    </main>
  );
}
