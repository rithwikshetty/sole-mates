// Built-in question deck. Questions are phrased so the answer is one of the
// two players ("who ..."), matching the shoe-game format.

export const DECK: string[] = [
  'Who is the better cook?',
  'Who takes longer to get ready?',
  'Who said "I love you" first?',
  'Who is more likely to forget an anniversary?',
  'Who is the better driver?',
  'Who falls asleep first?',
  'Who is more stubborn?',
  'Who spends more money on silly things?',
  'Who is the funnier one?',
  'Who apologizes first after an argument?',
  'Who is more likely to get lost, even with a map?',
  'Who hogs the blanket?',
  'Who is the bigger foodie?',
  'Who is more dramatic when they are sick?',
  'Who has the better taste in music?',
  'Who is more likely to cry during a movie?',
  'Who takes more photos of the other?',
  'Who is the messier one?',
  'Who would survive longer in a zombie apocalypse?',
  'Who is more addicted to their phone?',
  'Who is the better dancer?',
  'Who made the first move?',
  'Who is more likely to talk to strangers?',
  'Who is the bigger overthinker?',
  'Who wins most of your arguments?',
  'Who is more competitive?',
  'Who is more likely to laugh at the wrong moment?',
  'Who has the weirder sleeping habits?',
  'Who is the better gift-giver?',
  'Who would eat dessert for every meal if they could?',
  'Who is more patient?',
  'Who takes the longer showers?',
  'Who is more likely to become famous?',
  'Who is the early bird?',
  'Who cares more about what other people think?',
  'Who is more romantic?',
  'Who would win a karaoke contest?',
  'Who forgets things more often?',
  'Who is the bigger baby about the cold?',
  'Who loves the other more? (Careful now!)',
];

export function randomQuestion(exclude: Set<string> = new Set()): string {
  const available = DECK.filter((q) => !exclude.has(q));
  const pool = available.length > 0 ? available : DECK;
  return pool[Math.floor(Math.random() * pool.length)];
}
