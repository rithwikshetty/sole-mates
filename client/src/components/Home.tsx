import { useState, type FormEvent } from 'react';
import { sfx } from '../sfx';
import { Bunting, ShoeDuo } from './Shoes';

interface Props {
  create: (name: string) => void;
  join: (code: string, name: string) => Promise<string | null>;
}

const TITLE = 'Sole Mates';

export default function Home({ create, join }: Props) {
  const [name, setName] = useState('');
  // A shared link can prefill the room code (…/?code=ABCD).
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get('code') ?? '');
  const [joining, setJoining] = useState(() => code.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const requireName = (): string | null => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tell us your name first! 😄');
      return null;
    }
    return trimmed;
  };

  const onCreate = () => {
    const n = requireName();
    if (!n) return;
    sfx.click();
    setError(null);
    create(n);
  };

  const onJoin = async (e: FormEvent) => {
    e.preventDefault();
    const n = requireName();
    if (!n) return;
    if (code.trim().length < 4) {
      setError('That room code looks too short.');
      return;
    }
    sfx.click();
    setError(null);
    setBusy(true);
    const err = await join(code, n);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <main className="screen home">
      <Bunting className="bunting" />
      <ShoeDuo className="home-duo" />
      <h1 className="logo" aria-label={TITLE}>
        {TITLE.split('').map((ch, i) => (
          <span key={i} className="logo-letter" style={{ animationDelay: `${i * 0.06}s` }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </h1>
      <p className="tagline">The wedding shoe game — how well do you two really know each other?</p>

      <form className="card home-card" onSubmit={onJoin}>
        <label className="field-label" htmlFor="name">
          Your name
        </label>
        <input
          id="name"
          className="text-input"
          value={name}
          maxLength={20}
          placeholder="e.g. Rithwik"
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
        />

        {joining ? (
          <>
            <label className="field-label" htmlFor="code">
              Room code
            </label>
            <input
              id="code"
              className="text-input code-input"
              value={code}
              maxLength={4}
              placeholder="ABCD"
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-slate btn-big" disabled={busy}>
              {busy ? 'Joining…' : 'Jump in! 🏃'}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                sfx.click();
                setJoining(false);
                setError(null);
              }}
            >
              ← or start a new room
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-rose btn-big" onClick={onCreate}>
              Create a room 💍
            </button>
            <button
              type="button"
              className="btn btn-slate btn-big"
              onClick={() => {
                sfx.click();
                setJoining(true);
                setError(null);
              }}
            >
              I have a code 🎟️
            </button>
          </>
        )}

        {error && <p className="form-error">{error}</p>}
      </form>
    </main>
  );
}
