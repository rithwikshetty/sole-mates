import { useState, type FormEvent } from 'react';
import { SHOE_COLORS, SHOE_STYLES, type ShoeColor, type ShoeStyle } from '../../../shared/shoes';
import type { Outfit, PeekAck } from '../../../shared/types';
import { sfx } from '../sfx';
import { Bunting, ShoeDuo, ShoePic } from './Shoes';

interface Props {
  create: (name: string, outfit: Outfit) => Promise<string | null>;
  join: (code: string, name: string, outfit: Outfit) => Promise<string | null>;
  peek: (code: string, name: string) => Promise<PeekAck>;
}

const TITLE = 'Sole Mates';

/** The partner already in the room and their taken shoe, shown when joining. */
interface PartnerPick {
  name: string | null;
  shoe: ShoeStyle | null;
  color: ShoeColor | null;
  /** True when this join hands back a seat the same name dropped out of. */
  resuming: boolean;
}

/** Room codes arrive from links in any case and with stray whitespace. */
const normalizeCode = (raw: string) => raw.replace(/\s+/g, '').toUpperCase().slice(0, 4);

export default function Home({ create, join, peek }: Props) {
  const [name, setName] = useState('');
  // A shared link can prefill the room code (…/?code=ABCD).
  const [code, setCode] = useState(() => normalizeCode(new URLSearchParams(location.search).get('code') ?? ''));
  const [joining, setJoining] = useState(() => code.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Wardrobe step: null until the name/code step is done.
  const [wardrobe, setWardrobe] = useState<null | { partner: PartnerPick | null }>(null);
  const [shoe, setShoe] = useState<ShoeStyle | null>(null);
  const [color, setColor] = useState<ShoeColor>('rose');

  const requireName = (): string | null => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tell us your name first! 😄');
      return null;
    }
    return trimmed;
  };

  const onCreate = () => {
    if (!requireName()) return;
    sfx.click();
    setError(null);
    setWardrobe({ partner: null });
  };

  const onJoin = async (e: FormEvent) => {
    e.preventDefault();
    const n = requireName();
    if (!n) return;
    if (code.length < 4) {
      setError('That room code looks too short.');
      return;
    }
    sfx.click();
    setError(null);
    setBusy(true);
    const res = await peek(code, n);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Could not find that room.');
      return;
    }
    // A selection left over from an earlier visit may now clash with the partner.
    setShoe((s) => (s === res.partnerShoe ? null : s));
    setWardrobe({
      partner: {
        name: res.partnerName ?? null,
        shoe: res.partnerShoe ?? null,
        color: res.partnerColor ?? null,
        resuming: res.resuming ?? false,
      },
    });
  };

  const confirmOutfit = async () => {
    const n = requireName();
    if (!n || shoe === null || busy) return;
    if (wardrobe?.partner?.shoe && shoe === wardrobe.partner.shoe) {
      setShoe(null);
      setError(`${wardrobe.partner.name} already has that one. Pick another style!`);
      return;
    }
    sfx.lockIn();
    setError(null);
    const outfit: Outfit = { shoe, color };
    setBusy(true);
    const err = wardrobe?.partner ? await join(code, n, outfit) : await create(n, outfit);
    setBusy(false);
    if (err) setError(err);
  };

  if (wardrobe) {
    const partner = wardrobe.partner;
    return (
      <main className="screen home">
        <Bunting className="bunting" />
        <h2 className="screen-title">
          {partner?.resuming ? `Welcome back, ${name.trim()}!` : `Pick your shoe, ${name.trim()}!`}
        </h2>
        {partner && (
          <p className="wardrobe-host">
            {partner.resuming && partner.name ? (
              <>
                <strong>{partner.name}</strong> kept the game going. Pick a shoe and you are back in. 📶
              </>
            ) : partner.resuming ? (
              <>Your room is still open. Pick a shoe and you are back in. 📶</>
            ) : (
              <>
                Joining <strong>{partner.name}</strong>. Their shoe is off the rack. 🔒
              </>
            )}
          </p>
        )}

        <div className="card wardrobe-card">
          <div className="wardrobe-preview">
            {shoe ? (
              <ShoePic shoe={shoe} color={color} className="wardrobe-preview-shoe" />
            ) : (
              <p className="wardrobe-placeholder">Choose a style below 👇</p>
            )}
          </div>

          <div className="style-grid">
            {SHOE_STYLES.map((s) => {
              const taken = partner?.shoe === s.id;
              const picked = shoe === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`style-btn ${picked ? 'style-btn-picked' : ''} ${taken ? 'style-btn-taken' : ''}`}
                  disabled={taken}
                  aria-label={taken ? `${s.label}, taken by ${partner?.name}` : s.label}
                  onClick={() => {
                    sfx.select();
                    setShoe(s.id);
                  }}
                >
                  <ShoePic shoe={s.id} color={(taken && partner?.color) || color} className="style-btn-shoe" />
                  <span className="style-btn-label">{taken ? `${partner?.name}'s` : s.label}</span>
                  {taken && <span className="style-btn-lock">🔒</span>}
                </button>
              );
            })}
          </div>

          <div className="swatch-row" role="radiogroup" aria-label="Shoe colour">
            {SHOE_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={color === c.id}
                aria-label={c.label}
                className={`swatch ${color === c.id ? 'swatch-picked' : ''}`}
                style={{ background: c.hex }}
                onClick={() => {
                  sfx.select();
                  setColor(c.id);
                }}
              />
            ))}
          </div>

          <button
            type="button"
            className="btn btn-rose btn-big"
            disabled={shoe === null || busy}
            onClick={confirmOutfit}
          >
            {busy ? 'One sec…' : partner?.resuming ? 'Rejoin the game! 📶' : partner ? 'Join with this shoe! 🥂' : 'Open the room! 💍'}
          </button>
          {error && <p className="form-error">{error}</p>}
        </div>

        <button
          type="button"
          className="btn-link"
          onClick={() => {
            sfx.click();
            setWardrobe(null);
            setError(null);
          }}
        >
          ← back
        </button>
      </main>
    );
  }

  return (
    <main className="screen home">
      <Bunting className="bunting" />
      <ShoeDuo className="home-duo" />
      <h1 className="logo" aria-label={TITLE}>
        {TITLE.split('').map((ch, i) => (
          <span key={i} className="logo-letter" style={{ animationDelay: `${i * 0.06}s` }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </h1>
      <p className="tagline">The wedding shoe game. How well do you two really know each other?</p>

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
              onChange={(e) => setCode(normalizeCode(e.target.value))}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-slate btn-big" disabled={busy}>
              {busy ? 'Peeking in…' : 'Next: pick a shoe 👟'}
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
