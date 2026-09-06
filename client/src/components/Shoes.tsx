// Hand-drawn SVG shoe mascots. Every player picks a style + colour from the
// wardrobe (shared/shoes.ts); each style here is drawn once and recoloured
// via props. All face right by default; ground line sits near y=175.

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
 * inward for narrow bodies so they never cross the outline.
 */
function Face({
  x,
  y,
  slope = 0,
  scale = 1,
  tight = false,
}: {
  x: number;
  y: number;
  slope?: number;
  scale?: number;
  tight?: boolean;
}) {
  const s = scale;
  const x2 = x + 32 * s;
  const y2 = y + slope;
  const mx = (x + x2) / 2;
  const my = y + slope / 2 + 22 * s;
  const bdx = tight ? 10 : 13 * s;
  const brx = tight ? 5 : 6 * s;
  return (
    <g>
      <g className="shoe-eyes">
        <circle cx={x} cy={y} r={13 * s} fill="#fff" stroke={INK} strokeWidth="4" />
        <circle cx={x2} cy={y2} r={13 * s} fill="#fff" stroke={INK} strokeWidth="4" />
        <circle cx={x + 3 * s} cy={y + 2 * s} r={5.5 * s} fill={INK} />
        <circle cx={x2 + 3 * s} cy={y2 + 2 * s} r={5.5 * s} fill={INK} />
        <circle cx={x + 5 * s} cy={y - 0.5 * s} r={2.2 * s} fill="#fff" />
        <circle cx={x2 + 5 * s} cy={y2 - 0.5 * s} r={2.2 * s} fill="#fff" />
      </g>
      <path
        d={`M ${mx - 10 * s} ${my} Q ${mx} ${my + 8 * s} ${mx + 10 * s} ${my + 2 * s}`}
        fill="none"
        stroke={INK}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx={x - bdx} cy={y + 14 * s} rx={brx} ry={4 * s} fill={BLUSH} opacity="0.85" />
      <ellipse cx={x2 + bdx} cy={y2 + 14 * s} rx={brx} ry={4 * s} fill={BLUSH} opacity="0.85" />
    </g>
  );
}

/** Stiletto heel with a veil, lashes and a flower crown. */
function HeelArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* veil: drawn first, its right side extends well under the body */}
      <path
        d="M 86 52 C 64 52 48 66 40 88 C 36 100 36 114 40 126 Q 47 118 53 125 Q 59 117 65 124 Q 71 116 77 122 C 80 104 82 72 90 58 Z"
        fill="#fff"
        opacity="0.92"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M 68 62 C 56 72 49 88 47 104" fill="none" stroke={INK} strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
      {/* stiletto: top tucked inside the body, tip on the toe's ground line */}
      <path
        d="M 77 138 L 73 166 C 72.4 171 75 174 80 174 L 86 174 C 88 162 89 150 89 138 Z"
        fill={deep}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* body: ankle column, sweeping topline, pointed toe, arched sole */}
      <path
        d="M 84 54 C 94 56 100 64 104 78 C 114 106 140 122 170 129 C 191 135 203 147 198 159 C 194 167 186 170 176 170 C 146 170 116 162 98 150 C 90 148 80 148 73 150 C 70 128 72 90 74 72 C 75 60 78 54 84 54 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* pointed white toe cap */}
      <path
        d="M 198 159 C 203 147 191 135 170 129 C 162 133 156 142 154 152 C 158 162 166 170 176 170 C 186 170 194 167 198 159 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* flower crown */}
      <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <circle cx="76" cy="46" r="7" fill="var(--gold)" />
        <circle cx="90" cy="42" r="7" fill="var(--gold)" />
        <circle cx="84" cy="54" r="7" fill="var(--gold)" />
        <circle cx="83" cy="47" r="4.5" fill="#fff" />
      </g>
      {/* bespoke face with lashes */}
      <g className="shoe-eyes">
        <circle cx="95" cy="104" r="13" fill="#fff" stroke={INK} strokeWidth="4" />
        <circle cx="127" cy="112" r="13" fill="#fff" stroke={INK} strokeWidth="4" />
        <circle cx="98" cy="106" r="5.5" fill={INK} />
        <circle cx="130" cy="114" r="5.5" fill={INK} />
        <circle cx="100" cy="103.5" r="2.2" fill="#fff" />
        <circle cx="132" cy="111.5" r="2.2" fill="#fff" />
        <g stroke={INK} strokeWidth="3" strokeLinecap="round">
          <line x1="87" y1="92" x2="82" y2="86" />
          <line x1="94" y1="89" x2="92" y2="82" />
          <line x1="120" y1="100" x2="116" y2="94" />
          <line x1="127" y1="98" x2="125" y2="91" />
        </g>
      </g>
      <path d="M 103 126 Q 113 134 123 128" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="83" cy="118" rx="6" ry="4" fill={BLUSH} opacity="0.9" />
      <ellipse cx="139" cy="126" rx="6" ry="4" fill={BLUSH} opacity="0.9" />
      <ellipse cx="180" cy="146" rx="9" ry="5" fill="#fff" opacity="0.6" transform="rotate(18 180 146)" />
    </>
  );
}

/** Fancy oxford with a top hat and bow tie. */
function OxfordArt({ hex, deep }: ArtProps) {
  return (
    <>
      <rect x="24" y="152" width="182" height="26" rx="13" fill="#fff" stroke={INK} strokeWidth="5" />
      <line x1="38" y1="165" x2="192" y2="165" stroke={INK} strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" opacity="0.5" />
      <path
        d="M 48 154 L 45 106 C 44 88 56 78 74 76 C 100 73 118 84 132 98 C 146 112 164 124 184 130 C 198 134 203 142 203 154 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M 203 154 C 203 140 192 132 176 128 C 162 134 152 142 150 154 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <g fill={INK} opacity="0.55">
        <circle cx="176" cy="134" r="1.8" />
        <circle cx="168" cy="140" r="1.8" />
        <circle cx="162" cy="147" r="1.8" />
      </g>
      {/* top hat: brim overlaps the shoe's top ridge so it reads as worn */}
      <g transform="rotate(-5 78 78)">
        <rect x="58" y="40" width="40" height="38" rx="5" fill={INK} />
        <rect x="58" y="64" width="40" height="9" fill="var(--gold)" />
        <rect x="47" y="72" width="62" height="11" rx="5.5" fill={INK} />
      </g>
      <Face x={76} y={110} />
      {/* bow tie under the chin */}
      <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <path d="M 78 141 L 89 145 L 78 151 Z" fill={deep} />
        <path d="M 106 141 L 95 145 L 106 151 Z" fill={deep} />
        <circle cx="92" cy="146" r="4" fill="var(--gold)" />
      </g>
    </>
  );
}

/** Everyday sneaker with a lace bow and heel pull-tab. */
function SneakerArt({ hex, deep }: ArtProps) {
  return (
    <>
      <rect x="30" y="148" width="168" height="28" rx="14" fill="#fff" stroke={INK} strokeWidth="5" />
      <line x1="44" y1="162" x2="184" y2="162" stroke={INK} strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" opacity="0.5" />
      {/* body: heel counter, low ankle opening, slope to the toe */}
      <path
        d="M 50 150 L 47 96 C 47 84 55 78 68 78 L 94 78 C 100 78 104 82 106 88 C 116 112 148 128 180 134 C 194 138 198 144 197 150 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* white toe cap */}
      <path
        d="M 197 150 C 198 143 193 137 182 134 C 170 138 161 144 159 150 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* heel pull-tab */}
      <path d="M 52 78 L 64 78 L 62 92 L 52 92 Z" fill={deep} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {/* side stripe along the sole line */}
      <path d="M 58 132 C 96 144 124 146 150 146" fill="none" stroke={deep} strokeWidth="6" strokeLinecap="round" />
      {/* eyelets just inside the instep edge */}
      <g fill={INK} opacity="0.5">
        <circle cx="110" cy="106" r="2.2" />
        <circle cx="121" cy="116" r="2.2" />
      </g>
      {/* lace bow sitting on the opening edge */}
      <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <path d="M 86 76 L 98 81 L 86 87 Z" fill={deep} />
        <path d="M 116 74 L 104 81 L 116 84 Z" fill={deep} />
        <circle cx="101" cy="82" r="4" fill="var(--gold)" />
      </g>
      <Face x={78} y={110} slope={5} />
    </>
  );
}

/** High-top with criss-cross laces and a star patch. */
function HightopArt({ hex, deep }: ArtProps) {
  return (
    <>
      <rect x="32" y="150" width="166" height="26" rx="13" fill="#fff" stroke={INK} strokeWidth="5" />
      <line x1="46" y1="163" x2="184" y2="163" stroke={INK} strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" opacity="0.5" />
      {/* tall shaft down to the toe */}
      <path
        d="M 54 152 L 50 66 C 50 58 56 54 64 54 L 92 54 C 98 54 102 58 104 64 C 112 100 144 124 178 132 C 192 136 197 143 196 152 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* collar band */}
      <path d="M 52 60 C 52 56 56 54 64 54 L 92 54 C 98 54 101 57 102 61 L 102 66 L 51 66 Z" fill="#fff" opacity="0.9" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {/* white toe cap */}
      <path
        d="M 196 152 C 197 144 192 138 180 134 C 168 139 160 145 158 152 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* criss-cross laces down the front, kept inside the shaft edge */}
      <g stroke={INK} strokeWidth="3.5" strokeLinecap="round">
        <line x1="88" y1="72" x2="102" y2="82" />
        <line x1="102" y1="72" x2="88" y2="82" />
        <line x1="90" y1="88" x2="104" y2="98" />
        <line x1="104" y1="88" x2="90" y2="98" />
      </g>
      {/* star patch near the collar */}
      <circle cx="70" cy="78" r="11" fill="#fff" stroke={INK} strokeWidth="3.5" />
      <path d="M 70 71 L 72.2 75.8 L 77.5 76.3 L 73.6 79.8 L 74.8 85 L 70 82.2 L 65.2 85 L 66.4 79.8 L 62.5 76.3 L 67.8 75.8 Z" fill={deep} />
      <Face x={74} y={112} slope={5} />
    </>
  );
}

/** Cowboy boot with swoopy stitching, a star, and a stacked heel. */
function CowboyArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* stacked heel under the shaft */}
      <path d="M 74 162 L 72 178 L 98 178 L 98 162 Z" fill={deep} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
      {/* one-piece silhouette: shaft, instep, slightly upturned pointed toe */}
      <path
        d="M 62 44 C 62 40 66 38 72 38 L 120 38 C 126 38 130 40 130 44 L 130 112 C 140 128 162 136 188 142 C 202 146 206 152 200 158 C 188 166 160 168 134 167 L 80 165 C 68 164 61 157 62 146 L 62 116 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* top band */}
      <path d="M 63 52 L 129 52 L 128.8 62 L 63.2 62 Z" fill={deep} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {/* western stitching swoop, above the eyes */}
      <path d="M 68 68 Q 96 78 124 68" fill="none" stroke={deep} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 7" />
      {/* star on the foot */}
      <path d="M 116 138 L 118.4 143.2 L 124 143.8 L 119.8 147.5 L 121 153 L 116 150 L 111 153 L 112.2 147.5 L 108 143.8 L 113.6 143.2 Z" fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <Face x={79} y={94} tight />
    </>
  );
}

/** Ballet flat with a ribbon bow on the toe. */
function BalletArt({ hex, deep }: ArtProps) {
  return (
    <>
      <rect x="42" y="166" width="158" height="12" rx="6" fill="#fff" stroke={INK} strokeWidth="4.5" />
      {/* scooped body: heel cup on the left, round toe on the right */}
      <path
        d="M 48 106 C 66 116 96 132 128 136 C 150 139 168 132 182 136 C 196 140 202 150 200 160 C 198 169 188 172 174 172 L 64 172 C 52 172 45 164 45 152 C 45 136 46 118 48 106 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* inner-edge shadow along the scoop */}
      <path d="M 58 117 C 80 127 96 134 116 139" fill="none" stroke={deep} strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
      {/* toe bow */}
      <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <path d="M 158 128 L 172 133 L 160 141 Z" fill={deep} />
        <path d="M 190 126 L 176 133 L 188 139 Z" fill={deep} />
        <circle cx="174" cy="133" r="4.5" fill="var(--gold)" />
      </g>
      <Face x={94} y={146} slope={4} scale={0.85} />
    </>
  );
}

/** Mary Jane with an instep strap and gold button. */
function MaryjaneArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* block heel */}
      <path d="M 54 164 L 54 178 L 82 178 L 82 164 Z" fill={deep} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
      {/* body: heel cup, mild scoop, big round toe */}
      <path
        d="M 52 104 C 76 118 106 130 134 132 C 158 134 178 128 190 136 C 200 143 203 154 200 162 C 197 171 186 175 172 175 L 66 175 C 54 175 47 167 47 152 C 47 136 49 118 52 104 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* instep strap wrapping over the topline, with a gold button */}
      <path d="M 100 122 L 114 126 L 107 154 L 93 148 Z" fill={deep} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="103" cy="138" r="4.5" fill="var(--gold)" stroke={INK} strokeWidth="3" />
      {/* toe shine */}
      <ellipse cx="186" cy="152" rx="8" ry="4.5" fill="#fff" opacity="0.6" transform="rotate(14 186 152)" />
      <Face x={124} y={149} slope={0} scale={0.9} />
    </>
  );
}

/** Flip-flop seen from above: long footbed, Y-strap from the toe post. */
function FlipflopArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* footbed: wider at the toe (top), tapering to the heel */}
      <path
        d="M 110 28 C 145 28 162 52 160 92 C 159 120 150 150 132 168 C 120 180 100 180 88 168 C 70 150 61 120 60 92 C 58 52 75 28 110 28 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* deck inset line */}
      <path
        d="M 110 38 C 138 38 152 58 150 92 C 149 116 141 144 126 160 C 116 170 104 170 94 160 C 79 144 71 116 70 92 C 68 58 82 38 110 38 Z"
        fill="none"
        stroke={INK}
        strokeWidth="2.5"
        opacity="0.25"
      />
      {/* Y-strap: toe post up to the toe edge, two straps out to the sides */}
      <g strokeLinecap="round" fill="none">
        <path d="M 110 70 L 110 44" stroke={INK} strokeWidth="14" />
        <path d="M 110 70 C 98 82 80 96 63 110" stroke={INK} strokeWidth="14" />
        <path d="M 110 70 C 122 82 140 96 157 110" stroke={INK} strokeWidth="14" />
        <path d="M 110 70 L 110 44" stroke={deep} strokeWidth="7" />
        <path d="M 110 70 C 98 82 80 96 63 110" stroke={deep} strokeWidth="7" />
        <path d="M 110 70 C 122 82 140 96 157 110" stroke={deep} strokeWidth="7" />
      </g>
      {/* hibiscus on the toe post */}
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <circle cx="103" cy="60" r="6.5" fill="var(--gold)" />
        <circle cx="117" cy="60" r="6.5" fill="var(--gold)" />
        <circle cx="110" cy="69" r="6.5" fill="var(--gold)" />
        <circle cx="110" cy="61" r="4" fill="#fff" />
      </g>
      <Face x={94} y={132} slope={0} />
    </>
  );
}

/** Tall rain welly with polka dots and a chunky sole. */
function WellyArt({ hex, deep }: ArtProps) {
  return (
    <>
      {/* boot silhouette */}
      <path
        d="M 60 44 C 60 40 64 38 70 38 L 118 38 C 124 38 128 40 128 44 L 128 108 C 136 126 158 134 182 140 C 196 144 202 152 199 160 C 196 170 184 174 166 174 L 78 174 C 64 174 57 166 58 152 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* top band */}
      <path d="M 60 44 C 60 40 64 38 70 38 L 118 38 C 124 38 128 40 128 44 L 128 54 L 60 54 Z" fill={deep} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      {/* chunky sole strip */}
      <path d="M 61 156 L 198.5 154 C 197 166 186 173 166 173 L 78 173 C 66 173 61 166 61 156 Z" fill={deep} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      {/* polka dots */}
      <g fill="#fff" opacity="0.55">
        <circle cx="76" cy="68" r="5" />
        <circle cx="102" cy="62" r="5" />
        <circle cx="118" cy="80" r="5" />
        <circle cx="88" cy="88" r="5" />
      </g>
      <Face x={84} y={116} slope={5} />
    </>
  );
}

/** Tassel loafer on a stitched sole. */
function LoaferArt({ hex, deep }: ArtProps) {
  return (
    <>
      <rect x="26" y="152" width="178" height="26" rx="13" fill="#fff" stroke={INK} strokeWidth="5" />
      <line x1="40" y1="165" x2="190" y2="165" stroke={INK} strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" opacity="0.5" />
      {/* low sleek body */}
      <path
        d="M 50 154 L 48 118 C 48 102 60 94 78 92 C 104 89 120 100 134 112 C 148 124 166 130 184 134 C 198 138 203 145 203 154 Z"
        fill={hex}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* moc-toe stitching */}
      <path d="M 140 114 C 154 124 170 130 186 134" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" opacity="0.6" />
      {/* tassels hanging from the instep, clear of the face */}
      <g>
        <path d="M 122 102 L 120 124 M 130 108 L 132 128" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M 114 126 C 114 122 126 122 126 126 L 122 140 C 121 143 119 143 118 140 Z" fill={deep} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M 126 130 C 126 126 138 126 138 130 L 134 144 C 133 147 131 147 130 144 Z" fill={deep} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <Face x={66} y={118} slope={4} tight />
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
