// The shoe wardrobe: every player picks a style + colour when they enter a
// room. The server validates ids against this catalog; the client owns the
// actual SVG artwork (client/src/components/Shoes.tsx).

export const SHOE_STYLES = [
  { id: 'heel', label: 'Stiletto' },
  { id: 'oxford', label: 'Oxford' },
  { id: 'sneaker', label: 'Sneaker' },
  { id: 'hightop', label: 'High-top' },
  { id: 'cowboy', label: 'Cowboy boot' },
  { id: 'ballet', label: 'Ballet flat' },
  { id: 'maryjane', label: 'Mary Jane' },
  { id: 'flipflop', label: 'Flip-flop' },
  { id: 'welly', label: 'Rain welly' },
  { id: 'loafer', label: 'Loafer' },
] as const;

export type ShoeStyle = (typeof SHOE_STYLES)[number]['id'];

// Each colour has a main fill and a deeper shade for heels/soles/accents.
export const SHOE_COLORS = [
  { id: 'rose', label: 'Rose', hex: '#F0688F', deep: '#C94A70' },
  { id: 'coral', label: 'Coral', hex: '#F58B67', deep: '#D2653F' },
  { id: 'sunny', label: 'Sunny', hex: '#E9BA4F', deep: '#C4942E' },
  { id: 'sage', label: 'Sage', hex: '#93BE7A', deep: '#6F9C57' },
  { id: 'teal', label: 'Teal', hex: '#57B7A5', deep: '#3B9483' },
  { id: 'sky', label: 'Sky', hex: '#6FB5E1', deep: '#4A8FC0' },
  { id: 'slate', label: 'Slate', hex: '#6188C6', deep: '#4568A5' },
  { id: 'lavender', label: 'Lavender', hex: '#A88FD8', deep: '#8468B5' },
  { id: 'plum', label: 'Plum', hex: '#C06CA8', deep: '#9C4A85' },
  { id: 'cocoa', label: 'Cocoa', hex: '#A97B54', deep: '#855C3B' },
] as const;

export type ShoeColor = (typeof SHOE_COLORS)[number]['id'];

export function isShoeStyle(value: unknown): value is ShoeStyle {
  return SHOE_STYLES.some((s) => s.id === value);
}

export function isShoeColor(value: unknown): value is ShoeColor {
  return SHOE_COLORS.some((c) => c.id === value);
}

export function colorInfo(id: ShoeColor) {
  return SHOE_COLORS.find((c) => c.id === id) ?? SHOE_COLORS[0];
}
