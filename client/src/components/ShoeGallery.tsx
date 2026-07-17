// Dev-only gallery (open /?gallery) to eyeball every shoe style and colour.
import { SHOE_COLORS, SHOE_STYLES } from '../../../shared/shoes';
import { ShoePic } from './Shoes';

export default function ShoeGallery() {
  const colorFor = (i: number) => SHOE_COLORS[i % SHOE_COLORS.length].id;
  return (
    <main style={{ padding: 24, background: 'var(--ivory)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {SHOE_STYLES.map((s, i) => (
          <figure key={s.id} id={`g-${s.id}`} style={{ textAlign: 'center', margin: 0 }}>
            <ShoePic shoe={s.id} color={colorFor(i)} className="" />
            <figcaption style={{ fontFamily: 'sans-serif' }}>
              {s.label} · {colorFor(i)}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
