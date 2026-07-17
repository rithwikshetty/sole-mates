// Hand-drawn SVG wedding mascots: a bride's heel and a groom's oxford,
// sitting back to back — just like the real shoe game.
// Seat 0 is the rose heel, seat 1 is the slate oxford, everywhere in the app.

export const SEAT_COLORS = ['var(--rose)', 'var(--slate)'] as const;

interface ShoeProps {
  flip?: boolean;
  className?: string;
}

/** Bride: a rose high heel with a veil, lashes and a flower crown. Faces right. */
export function BrideShoe({ flip = false, className }: ShoeProps) {
  return (
    <svg
      viewBox="0 0 220 200"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      {/* veil: drawn first, its right side extends well under the body */}
      <path
        d="M 86 52 C 64 52 48 66 40 88 C 36 100 36 114 40 126 Q 47 118 53 125 Q 59 117 65 124 Q 71 116 77 122 C 80 104 82 72 90 58 Z"
        fill="#fff"
        opacity="0.92"
        stroke="var(--ink)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M 68 62 C 56 72 49 88 47 104"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.5"
        opacity="0.3"
        strokeLinecap="round"
      />
      {/* stiletto: top tucked inside the body, tip on the toe's ground line */}
      <path
        d="M 77 138 L 73 166 C 72.4 171 75 174 80 174 L 86 174 C 88 162 89 150 89 138 Z"
        fill="var(--rose-deep)"
        stroke="var(--ink)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* body: ankle column, sweeping topline, pointed toe, arched sole */}
      <path
        d="M 84 54 C 94 56 100 64 104 78 C 114 106 140 122 170 129 C 191 135 203 147 198 159 C 194 167 186 170 176 170 C 146 170 116 162 98 150 C 90 148 80 148 73 150 C 70 128 72 90 74 72 C 75 60 78 54 84 54 Z"
        fill="var(--rose)"
        stroke="var(--ink)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* pointed white toe cap */}
      <path
        d="M 198 159 C 203 147 191 135 170 129 C 162 133 156 142 154 152 C 158 162 166 170 176 170 C 186 170 194 167 198 159 Z"
        fill="#fff"
        stroke="var(--ink)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* flower crown: a sticker over the top corner, drawn last */}
      <g stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round">
        <circle cx="76" cy="46" r="7" fill="var(--gold)" />
        <circle cx="90" cy="42" r="7" fill="var(--gold)" />
        <circle cx="84" cy="54" r="7" fill="var(--gold)" />
        <circle cx="83" cy="47" r="4.5" fill="#fff" />
      </g>
      {/* face */}
      <g className="shoe-eyes">
        <circle cx="95" cy="104" r="13" fill="#fff" stroke="var(--ink)" strokeWidth="4" />
        <circle cx="127" cy="112" r="13" fill="#fff" stroke="var(--ink)" strokeWidth="4" />
        <circle cx="98" cy="106" r="5.5" fill="var(--ink)" />
        <circle cx="130" cy="114" r="5.5" fill="var(--ink)" />
        <circle cx="100" cy="103.5" r="2.2" fill="#fff" />
        <circle cx="132" cy="111.5" r="2.2" fill="#fff" />
        <g stroke="var(--ink)" strokeWidth="3" strokeLinecap="round">
          <line x1="87" y1="92" x2="82" y2="86" />
          <line x1="94" y1="89" x2="92" y2="82" />
          <line x1="120" y1="100" x2="116" y2="94" />
          <line x1="127" y1="98" x2="125" y2="91" />
        </g>
      </g>
      <path
        d="M 103 126 Q 113 134 123 128"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx="83" cy="118" rx="6" ry="4" fill="#FFB1C1" opacity="0.9" />
      <ellipse cx="139" cy="126" rx="6" ry="4" fill="#FFB1C1" opacity="0.9" />
      {/* toe gloss */}
      <ellipse cx="180" cy="146" rx="9" ry="5" fill="#fff" opacity="0.6" transform="rotate(18 180 146)" />
    </svg>
  );
}

/** Groom: a slate-blue oxford with a top hat and bow tie. Faces right. */
export function GroomShoe({ flip = false, className }: ShoeProps) {
  return (
    <svg
      viewBox="0 0 220 200"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      {/* sole */}
      <rect x="24" y="152" width="182" height="26" rx="13" fill="#fff" stroke="var(--ink)" strokeWidth="5" />
      <line
        x1="38"
        y1="165"
        x2="192"
        y2="165"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeDasharray="1 9"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* body */}
      <path
        d="M 48 154 L 45 106 C 44 88 56 78 74 76 C 100 73 118 84 132 98 C 146 112 164 124 184 130 C 198 134 203 142 203 154 Z"
        fill="var(--slate)"
        stroke="var(--ink)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* smooth white toe cap with brogue dots */}
      <path
        d="M 203 154 C 203 140 192 132 176 128 C 162 134 152 142 150 154 Z"
        fill="#fff"
        stroke="var(--ink)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <g fill="var(--ink)" opacity="0.55">
        <circle cx="176" cy="134" r="1.8" />
        <circle cx="168" cy="140" r="1.8" />
        <circle cx="162" cy="147" r="1.8" />
      </g>
      {/* top hat: brim overlaps the shoe's top ridge so it reads as worn */}
      <g transform="rotate(-5 78 78)">
        <rect x="58" y="40" width="40" height="38" rx="5" fill="var(--ink)" />
        <rect x="58" y="64" width="40" height="9" fill="var(--gold)" />
        <rect x="47" y="72" width="62" height="11" rx="5.5" fill="var(--ink)" />
      </g>
      {/* face */}
      <g className="shoe-eyes">
        <circle cx="76" cy="110" r="13" fill="#fff" stroke="var(--ink)" strokeWidth="4" />
        <circle cx="108" cy="110" r="13" fill="#fff" stroke="var(--ink)" strokeWidth="4" />
        <circle cx="79" cy="112" r="5.5" fill="var(--ink)" />
        <circle cx="111" cy="112" r="5.5" fill="var(--ink)" />
        <circle cx="81" cy="109.5" r="2.2" fill="#fff" />
        <circle cx="113" cy="109.5" r="2.2" fill="#fff" />
      </g>
      <path
        d="M 84 130 Q 92 137 100 130"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* bow tie under the chin */}
      <g stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round">
        <path d="M 78 141 L 89 145 L 78 151 Z" fill="var(--rose)" />
        <path d="M 106 141 L 95 145 L 106 151 Z" fill="var(--rose)" />
        <circle cx="92" cy="146" r="4" fill="var(--gold)" />
      </g>
      <ellipse cx="58" cy="122" rx="6" ry="4" fill="#FFB1C1" opacity="0.7" />
      <ellipse cx="126" cy="122" rx="6" ry="4" fill="#FFB1C1" opacity="0.7" />
    </svg>
  );
}

/** The mascot for a given seat. */
export function SeatShoe({ seat, flip, className }: ShoeProps & { seat: 0 | 1 }) {
  return seat === 0 ? (
    <BrideShoe flip={flip} className={className} />
  ) : (
    <GroomShoe flip={flip} className={className} />
  );
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

/** Interlocked wedding rings. */
export function Rings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 90" className={className} aria-hidden="true">
      <g fill="none">
        <circle cx="42" cy="52" r="24" stroke="var(--ink)" strokeWidth="15" />
        <circle cx="42" cy="52" r="24" stroke="var(--gold)" strokeWidth="8" />
        <circle cx="70" cy="52" r="24" stroke="var(--ink)" strokeWidth="15" />
        <circle cx="70" cy="52" r="24" stroke="var(--gold)" strokeWidth="8" />
      </g>
      {/* diamond on the left ring */}
      <path
        d="M 34 16 L 50 16 L 54 24 L 42 36 L 30 24 Z"
        fill="#CFEFF7"
        stroke="var(--ink)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M 34 16 L 42 24 L 50 16 M 30 24 L 54 24 M 42 24 L 42 35" fill="none" stroke="var(--ink)" strokeWidth="2.5" />
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

/** The two mascots back to back with a heart between them — the logo lockup. */
export function ShoeDuo({ className }: { className?: string }) {
  return (
    <div className={`shoe-duo ${className ?? ''}`}>
      <BrideShoe className="duo-shoe duo-left" flip />
      <Heart className="duo-heart" />
      <GroomShoe className="duo-shoe duo-right" />
    </div>
  );
}
