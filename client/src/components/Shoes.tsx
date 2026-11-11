// Hand-drawn SVG shoe mascots. Every player picks a style + colour from the
// wardrobe (shared/shoes.ts); each style here is drawn once and recoloured
// via props. Side views face right with the ground line near y=178; the
// flip-flop is a top view.

import { colorInfo, type ShoeColor, type ShoeStyle } from '../../../shared/shoes';
import type { PlayerView } from '../../../shared/types';

interface ArtProps {
  hex: string;
  deep: string;
}

const INK = 'var(--ink)';
const BLUSH = '#FFB1C1';

/**
 * Standard mascot face: two eyes (the second `slope` px lower), smile, blush.
 * `scale` shrinks the whole face for shallow shoes; `tight` pulls the blushes
 * inward for narrow bodies so they never cross the outline; `lashes` adds two
 * lashes per eye.
 */
function Face({
  x,
  y,
  slope = 0,
  scale = 1,
  tight = false,
  lashes = false,
}: {
  x: number;
  y: number;
  slope?: number;
  scale?: number;
  tight?: boolean;
  lashes?: boolean;
}) {
  const s = scale;
  const x2 = x + 32 * s;
  const y2 = y + slope;
  const mx = (x + x2) / 2;
  const my = y + slope / 2 + 22 * s;
  const bdx = tight ? 10 * s : 13 * s;
  const brx = tight ? 5 * s : 6 * s;
  const line = s < 0.8 ? 3.5 : 4;
  return (
    <g>
      <g className="shoe-eyes">
        <circle cx={x} cy={y} r={13 * s} fill="#fff" stroke={INK} strokeWidth={line} />
        <circle cx={x2} cy={y2} r={13 * s} fill="#fff" stroke={INK} strokeWidth={line} />
        <circle cx={x + 3 * s} cy={y + 2 * s} r={5.5 * s} fill={INK} />
        <circle cx={x2 + 3 * s} cy={y2 + 2 * s} r={5.5 * s} fill={INK} />
        <circle cx={x + 5 * s} cy={y - 0.5 * s} r={2.2 * s} fill="#fff" />
        <circle cx={x2 + 5 * s} cy={y2 - 0.5 * s} r={2.2 * s} fill="#fff" />
        {lashes && (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round">
            {[
              [x, y],
              [x2, y2],
            ].map(([ex, ey]) => (
              <g key={ex}>
                <line x1={ex - 8 * s} y1={ey - 12 * s} x2={ex - 13 * s} y2={ey - 18 * s} />
                <line x1={ex - 1 * s} y1={ey - 15 * s} x2={ex - 3 * s} y2={ey - 22 * s} />
              </g>
            ))}
          </g>
        )}
      </g>
      <path
        d={`M ${mx - 10 * s} ${my} Q ${mx} ${my + 8 * s} ${mx + 10 * s} ${my + 2 * s}`}
        fill="none"
        stroke={INK}
        strokeWidth={line}
        strokeLinecap="round"
      />
      <ellipse cx={x - bdx} cy={y + 14 * s} rx={brx} ry={4 * s} fill={BLUSH} opacity="0.85" />
      <ellipse cx={x2 + bdx} cy={y2 + 14 * s} rx={brx} ry={4 * s} fill={BLUSH} opacity="0.85" />
    </g>
  );
}

/** Laces: short white bars that wrap from an eyelet over the throat edge. */
function Laces({ bars }: { bars: [number, number, number, number][] }) {
  return (
    <g strokeLinecap="round">
      {bars.map(([x1, y1, x2, y2]) => (
        <g key={`${x1}-${y1}`}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="9" />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="3.5" />
        </g>
      ))}
    </g>
  );
}

/** Stiletto pump with a veil, lashes and a flower crown. */
function HeelArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* veil trailing off the back of the collar; the body covers its right edge */}
      <path
        d="M 62 46 C 38 42 18 60 12 88 C 9 102 9 114 12 126 Q 18 118 24 125 Q 30 117 36 124 Q 42 117 47 122 L 62 60 Z"
        fill="#fff"
        opacity="0.92"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M 40 58 C 28 68 22 84 20 102" fill="none" stroke={INK} strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
      {/* stiletto: top tucked under the heel seat, tip on the ground line */}
      <path
        d="M 35 106 L 44 171 C 44.6 175 47 177 50 177 L 54 177 C 56 158 61 138 72 122 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* far side of the opening, seen over the near topline */}
      <path
        d="M 78 52 C 106 62 124 108 154 138 C 128 132 110 110 100 84 C 96 70 90 56 78 52 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* body: tall heel cup, arched sole, low pointed toe */}
      <path
        d="M 44 52 C 36 54 32 62 32 74 C 31 90 33 104 38 114 C 62 118 96 138 120 158 C 130 166 144 172 160 173 L 194 173 C 204 173 209 167 205 161 C 196 150 172 142 152 138 C 128 132 110 110 100 84 C 96 68 90 54 78 52 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* toe shine */}
      <ellipse cx="176" cy="156" rx="10" ry="4.5" fill="#fff" opacity="0.6" transform="rotate(14 176 156)" />
      {/* flower crown on the collar */}
      <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <circle cx="52" cy="46" r="7" fill="var(--gold)" />
        <circle cx="66" cy="42" r="7" fill="var(--gold)" />
        <circle cx="61" cy="54" r="7" fill="var(--gold)" />
        <circle cx="60" cy="47" r="4.5" fill="#fff" />
      </g>
      <Face x={56} y={86} slope={7} scale={0.8} lashes />
    </>
  );
}

/** Cap-toe oxford with a stacked heel, a top hat and a bow tie. */
function OxfordArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* stacked heel and leather sole, with a gap under the arch */}
      <path
        d="M 30 150 L 30 173 C 30 176 32 178 35 178 L 66 178 C 69 178 71 176 71 173 L 72 166 C 90 166 106 171 120 178 L 198 178 C 206 178 210 172 209 164 L 205 152 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* upper: heel counter, dipped topline, long vamp, slim toe */}
      <path
        d="M 30 158 C 25 140 27 120 33 106 C 35 99 42 97 47 101 C 58 111 72 113 86 106 C 94 102 100 96 106 94 C 126 100 146 118 168 128 C 188 136 208 144 209 160 C 209 164 205 166 199 166 L 122 166 C 104 165 88 159 72 158 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* toe cap with a row of brogue dots */}
      <path
        d="M 168 128 C 188 136 208 144 209 160 C 209 164 205 166 199 166 L 158 166 C 156 152 160 138 168 128 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <g fill="#fff" opacity="0.8">
        <circle cx="170" cy="137" r="1.8" />
        <circle cx="166" cy="146" r="1.8" />
        <circle cx="165" cy="156" r="1.8" />
      </g>
      <Laces
        bars={[
          [131, 119, 138, 107],
          [144, 127, 151, 115],
        ]}
      />
      {/* top hat perched on the heel collar */}
      <g transform="rotate(-12 40 102)">
        <rect x="25" y="64" width="30" height="34" rx="4" fill={INK} />
        <rect x="25" y="84" width="30" height="8" fill="var(--gold)" />
        <rect x="16" y="94" width="48" height="10" rx="5" fill={INK} />
      </g>
      {/* bow tie where the lace bow would sit */}
      <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <path d="M 94 94 L 106 102 L 95 111 Z" fill={deep} />
        <path d="M 123 95 L 110 102 L 121 112 Z" fill={deep} />
        <circle cx="108" cy="102" r="4.5" fill="var(--gold)" />
      </g>
      <Face x={52} y={126} slope={3} scale={0.85} />
    </>
  );
}

/** Low-top sneaker with a rubber toe cap, laces and a heel tab. */
function SneakerArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* heel pull-tab and tongue, both poking out above the upper */}
      <path d="M 27 100 L 27 84 C 27 77 42 77 42 84 L 42 100 Z" fill={deep} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path
        d="M 84 98 C 84 80 92 66 104 62 C 111 60 117 65 115 73 L 108 98 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      {/* upper: heel counter, dipped collar, laced throat, toe box */}
      <path
        d="M 28 158 C 24 138 24 116 30 98 C 32 90 40 88 45 94 C 52 104 64 106 76 100 C 86 95 92 86 98 76 C 114 90 134 112 152 122 C 174 128 200 134 204 158 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* rubber toe cap */}
      <path
        d="M 204 158 C 200 136 180 128 162 125 C 153 132 149 146 150 158 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <Laces
        bars={[
          [102, 95, 112, 83],
          [118, 109, 128, 97],
          [134, 121, 143, 110],
        ]}
      />
      {/* chunky midsole with a slight toe spring */}
      <path
        d="M 26 152 L 198 150 C 206 150 210 155 209 162 C 208 170 200 178 186 178 L 30 178 C 23 178 19 173 19 166 L 19 160 C 19 155 22 152 26 152 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M 32 166 L 150 166" fill="none" stroke={deep} strokeWidth="5" strokeLinecap="round" />
      <Face x={50} y={122} slope={3} scale={0.8} />
    </>
  );
}

/** Canvas high-top with a collar band, laces and a heart ankle patch. */
function HightopArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* tongue poking out above the collar */}
      <path
        d="M 82 46 C 82 30 90 22 101 22 C 110 22 114 28 112 37 L 106 54 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      {/* tall shaft sweeping down the laced front to the toe */}
      <path
        d="M 28 158 C 26 130 30 90 34 52 C 35 44 40 40 48 40 L 92 34 C 100 33 104 38 105 46 C 108 80 128 108 152 122 C 174 128 200 134 204 158 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* collar band */}
      <path
        d="M 32.6 64 L 34 52 C 35 44 40 40 48 40 L 92 34 C 100 33 104 38 105 46 L 106.4 58 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* rubber toe cap */}
      <path
        d="M 204 158 C 200 136 180 128 162 125 C 153 132 149 146 150 158 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <Laces
        bars={[
          [96, 75, 113, 69.5],
          [109, 99.5, 123, 90],
          [125.5, 119.5, 137, 107],
        ]}
      />
      {/* heart ankle patch */}
      <circle cx="60" cy="84" r="12" fill="#fff" stroke={INK} strokeWidth="3.5" />
      <path d="M 60 91 C 51 85 52 78 56 78 C 58.5 78 60 80 60 81.5 C 60 80 61.5 78 64 78 C 68 78 69 85 60 91 Z" fill={deep} />
      {/* flat rubber sole with a foxing stripe */}
      <path
        d="M 26 152 L 196 152 C 204 152 208 157 208 165 C 208 173 203 178 195 178 L 30 178 C 23 178 19 173 19 166 L 19 160 C 19 155 22 152 26 152 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M 30 165 L 196 165" fill="none" stroke={deep} strokeWidth="4" strokeLinecap="round" />
      <Face x={56} y={118} slope={3} scale={0.85} />
    </>
  );
}

/** Cowboy boot with a scalloped top, a slanted heel and a pointed toe. */
function CowboyArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* slanted stacked heel and the forefoot sole */}
      <path
        d="M 46 146 L 53 175 C 53.6 177 55 178 57 178 L 84 178 C 86 178 87.4 177 88 175 L 96 152 C 120 166 152 175 190 176 C 203 176 211 169 210 161 L 200 146 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* one-piece silhouette: shaft, instep, upturned pointed toe */}
      <path
        d="M 48 36 C 60 48 70 50 84 50 C 98 50 110 46 122 34 C 124 58 120 86 122 104 C 124 120 142 130 162 136 C 182 142 202 146 207 154 C 209 160 204 164 194 164 C 160 165 124 161 94 152 L 50 152 C 44 144 46 128 50 116 C 54 90 46 60 48 36 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* top band following the scallop */}
      <path
        d="M 48 36 C 60 48 70 50 84 50 C 98 50 110 46 122 34 L 122.6 48 C 110 60 98 63 84 63 C 70 63 60 61 48.6 50 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* western stitching on the shaft and across the toe */}
      <path d="M 60 70 Q 85 86 110 70" fill="none" stroke={deep} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 7" />
      <path d="M 156 137 C 165 144 168 154 165 162" fill="none" stroke={deep} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 7" />
      {/* star on the foot */}
      <path d="M 132 135 L 134.4 140.2 L 140 140.8 L 135.8 144.5 L 137 150 L 132 147 L 127 150 L 128.2 144.5 L 124 140.8 L 129.6 140.2 Z" fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <Face x={71} y={98} scale={0.85} tight />
    </>
  );
}

/** Ballet flat: scooped opening, thin sole, a bow above the toe. */
function BalletArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* thin sole */}
      <rect x="24" y="166" width="186" height="12" rx="6" fill={deep} stroke={INK} strokeWidth="4.5" />
      {/* far side of the opening, seen over the near topline */}
      <path
        d="M 42 110 C 78 110 114 114 144 122 L 136 144 L 60 140 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* body: heel cup, low scooped side, round toe box */}
      <path
        d="M 28 170 C 23 150 25 126 31 112 C 33 105 41 105 45 111 C 58 134 84 146 108 146 C 122 146 130 134 142 126 C 168 104 208 124 208 160 C 208 168 204 171 199 171 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* bow at the throat */}
      <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <path d="M 106 128 L 123 138 L 110 150 Z" fill={deep} />
        <path d="M 141 124 L 125 138 L 140 147 Z" fill={deep} />
        <circle cx="124" cy="138" r="5" fill="var(--gold)" />
      </g>
      <Face x={158} y={138} slope={1} scale={0.8} tight />
    </>
  );
}

/** Mary Jane: round toe, buttoned strap over the opening, chunky heeled sole. */
function MaryjaneArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* far side of the opening, seen over the near topline */}
      <path
        d="M 46 112 C 80 110 116 114 146 122 L 138 142 L 60 138 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* body: heel cup, scooped side, big round toe */}
      <path
        d="M 30 168 C 26 148 28 128 34 114 C 36 108 44 108 48 114 C 60 134 84 144 108 144 C 122 144 130 132 142 124 C 168 104 208 124 208 158 L 208 168 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* strap arching from the near side over to the far topline */}
      <g fill="none">
        <path d="M 88 150 C 84 116 98 100 110 104 C 118 107 122 113 123 119" stroke={INK} strokeWidth="16" />
        <path d="M 88 148 C 84 116 98 100 110 104 C 118 107 122 113 123 117" stroke={deep} strokeWidth="8" />
      </g>
      <circle cx="88" cy="150" r="6" fill="var(--gold)" stroke={INK} strokeWidth="3.5" />
      {/* chunky sole with a heel and an arch notch */}
      <path
        d="M 27 162 L 205 162 C 209 162 211 165 211 169 C 211 175 207 178 201 178 L 108 178 L 102 172 L 78 172 L 72 178 L 31 178 C 26 178 23 175 23 170 L 23 166 C 23 163 25 162 27 162 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <Face x={158} y={133} slope={1} scale={0.78} tight />
    </>
  );
}

/** Flip-flop seen from above, tilted toe-up: foot-shaped deck, V-strap, toe post. */
function FlipflopArt({ hex, deep }: ArtProps) {
  const deck =
    'M 108 22 C 134 22 150 40 150 66 C 150 86 142 100 140 118 C 138 136 144 146 140 160 C 136 172 124 178 110 178 C 96 178 84 172 80 160 C 76 146 82 134 80 118 C 78 100 68 86 68 64 C 68 40 84 22 108 22 Z';
  return (
    <g transform="rotate(20 110 97)">
      {/* sole edge showing below the deck */}
      <path d={deck} transform="translate(-6 5)" fill={deep} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d={deck} fill={hex} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      {/* V-strap from the toe post out to both edges */}
      <g strokeLinecap="round" fill="none">
        <path d="M 106 58 C 94 70 82 88 78 110" stroke={INK} strokeWidth="14" />
        <path d="M 106 58 C 120 68 136 88 142 110" stroke={INK} strokeWidth="14" />
        <path d="M 106 58 C 94 70 82 88 78 110" stroke={deep} strokeWidth="7" />
        <path d="M 106 58 C 120 68 136 88 142 110" stroke={deep} strokeWidth="7" />
      </g>
      <circle cx="106" cy="57" r="6.5" fill="var(--gold)" stroke={INK} strokeWidth="3.5" />
      <Face x={98} y={140} scale={0.72} tight />
    </g>
  );
}

/** Rain welly: straight shaft, top band, side buckle, round toe, lug sole. */
function WellyArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* boot silhouette */}
      <path
        d="M 56 36 L 114 36 C 119 36 122 39 122 44 L 122 104 C 124 120 138 126 158 128 C 188 132 206 146 206 166 L 52 166 C 46 150 50 130 52 116 L 50 44 C 50 39 52 36 56 36 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* top band */}
      <path d="M 50.3 56 L 50 44 C 50 39 52 36 56 36 L 114 36 C 119 36 122 39 122 44 L 122 56 Z" fill={deep} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      {/* side strap and buckle */}
      <path d="M 96 66 L 126 66 L 126 77 L 96 77 Z" fill={deep} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="103" y="63" width="12" height="17" rx="3" fill="var(--gold)" stroke={INK} strokeWidth="3.5" />
      {/* polka dots */}
      <g fill="#fff" opacity="0.6">
        <circle cx="66" cy="72" r="5" />
        <circle cx="84" cy="88" r="5" />
        <circle cx="144" cy="146" r="5" />
        <circle cx="168" cy="150" r="5" />
      </g>
      {/* toe shine */}
      <ellipse cx="186" cy="141" rx="9" ry="4" fill="#fff" opacity="0.6" transform="rotate(26 186 141)" />
      {/* lug sole with a heel and an arch notch */}
      <path
        d="M 46 158 L 206 158 C 210 158 212 161 212 165 L 212 170 C 212 175 208 178 203 178 L 124 178 L 118 171 L 96 171 L 90 178 L 50 178 C 45 178 42 175 42 170 L 42 162 C 42 160 44 158 46 158 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <Face x={72} y={116} scale={0.85} tight />
    </>
  );
}

/** Tassel loafer: low heel, tongue lip, moc-toe seam. */
function LoaferArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* low heel and sole, with a gap under the arch */}
      <path
        d="M 30 152 L 30 174 C 30 177 32 178 35 178 L 64 178 C 67 178 68 177 68 174 L 69 169 C 88 169 106 173 120 178 L 196 178 C 204 178 208 173 207 167 L 204 154 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* upper: heel counter, dipped collar, tongue lip, round toe */}
      <path
        d="M 30 160 C 25 146 26 128 32 116 C 34 109 41 108 46 112 C 58 124 76 126 92 116 C 98 112 102 104 108 98 C 112 95 117 97 119 101 C 134 112 152 124 172 130 C 192 136 207 148 207 162 C 207 166 203 167 198 167 L 120 167 C 100 166 84 161 70 160 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* moc-toe seam */}
      <path d="M 150 124 C 168 134 190 138 196 156" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" opacity="0.6" />
      {/* tassels hanging from a knot on the vamp */}
      <g>
        <path d="M 124 114 L 118 128 M 124 114 L 133 132" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M 115 127 L 121 127 L 125 145 L 111 145 Z" fill={deep} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 130 131 L 136 131 L 140 149 L 126 149 Z" fill={deep} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="124" cy="114" r="4.5" fill="var(--gold)" stroke={INK} strokeWidth="3" />
      </g>
      <Face x={50} y={134} slope={3} scale={0.78} />
    </>
  );
}

const SHOE_ART: Record<ShoeStyle, (props: ArtProps) => React.JSX.Element> = {
  heel: HeelArt,
  oxford: OxfordArt,
  sneaker: SneakerArt,
  hightop: HightopArt,
  cowboy: CowboyArt,
  ballet: BalletArt,
  maryjane: MaryjaneArt,
  flipflop: FlipflopArt,
  welly: WellyArt,
  loafer: LoaferArt,
};

export interface ShoePicProps {
  shoe: ShoeStyle;
  color: ShoeColor;
  flip?: boolean;
  className?: string;
}

/** A shoe mascot in a given style + colour. Faces right; `flip` mirrors it. */
export function ShoePic({ shoe, color, flip = false, className }: ShoePicProps) {
  const Art = SHOE_ART[shoe] ?? HeelArt;
  const { hex, deep } = colorInfo(color);
  return (
    <svg
      viewBox="0 0 220 200"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <Art hex={hex} deep={deep} />
    </svg>
  );
}

/** The mascot for a player, wearing their chosen style + colour. */
export function PlayerShoe({
  player,
  flip,
  className,
}: {
  player: Pick<PlayerView, 'shoe' | 'color'> | null;
  flip?: boolean;
  className?: string;
}) {
  if (!player) return <ShoePic shoe="heel" color="rose" flip={flip} className={className} />;
  return <ShoePic shoe={player.shoe} color={player.color} flip={flip} className={className} />;
}

export function Heart({ className, color = 'var(--rose)' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 86 C12 58 8 28 30 18 C42 13 50 22 50 30 C50 22 58 13 70 18 C92 28 88 58 50 86 Z"
        fill={color}
        stroke="var(--ink)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <ellipse cx="35" cy="30" rx="6" ry="4" fill="#fff" opacity="0.7" transform="rotate(-30 35 30)" />
    </svg>
  );
}

/** Bunting garland for the top of celebratory screens. */
export function Bunting({ className }: { className?: string }) {
  const colors = ['var(--rose)', 'var(--gold)', 'var(--slate)', 'var(--rose)', 'var(--gold)', 'var(--slate)', 'var(--rose)'];
  return (
    <svg viewBox="0 0 700 90" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path d="M -10 12 Q 350 60 710 12" fill="none" stroke="var(--ink)" strokeWidth="5" />
      {colors.map((c, i) => {
        const x = 50 + i * 100;
        const y = 20 + Math.sin(((x - 50) / 600) * Math.PI) * 22;
        return (
          <path
            key={i}
            d={`M ${x - 26} ${y} L ${x + 26} ${y} L ${x} ${y + 44} Z`}
            fill={c}
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

/** Two mascots back to back with a heart between them, the logo lockup. */
export function ShoeDuo({ className }: { className?: string }) {
  return (
    <div className={`shoe-duo ${className ?? ''}`}>
      <ShoePic shoe="heel" color="rose" className="duo-shoe duo-left" flip />
      <Heart className="duo-heart" />
      <ShoePic shoe="oxford" color="slate" className="duo-shoe duo-right" />
    </div>
  );
}
