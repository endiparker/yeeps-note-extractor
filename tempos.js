/**
 * Yeeps timing patterns keyed by quarter-note BPM (♩).
 * spacesPerDivision = spaces in the Wire/Note loop (including the note wire).
 * every-division spacers are packDelays(spacesPerDivision - 1).join(" + ").
 */
export const TEMPO_PATTERNS = [
  { tempo: 300, spacesPerDivision: 1 },
  { tempo: 150, spacesPerDivision: 2 },
  { tempo: 100, spacesPerDivision: 3 },
  { tempo: 75, spacesPerDivision: 4 },
  { tempo: 60, spacesPerDivision: 5 },
  { tempo: 50, spacesPerDivision: 6 },
  { tempo: 43, spacesPerDivision: 7 },
  { tempo: 38, spacesPerDivision: 8 },
  { tempo: 33, spacesPerDivision: 9 },
];

/** @type {number[]} */
export const YEEPS_TEMPOS = TEMPO_PATTERNS.map((p) => p.tempo);

/**
 * @param {number} tempo
 * @returns {{ tempo: number, spacesPerDivision: number }}
 */
export function getTempoPattern(tempo) {
  const found = TEMPO_PATTERNS.find((p) => p.tempo === tempo);
  if (!found) {
    throw new Error(
      `Unsupported tempo ${tempo}. Use one of: ${YEEPS_TEMPOS.join(", ")}`,
    );
  }
  return found;
}

/**
 * Snap a BPM to the nearest Yeeps quarter-note tempo.
 * @param {number} bpm
 * @returns {number}
 */
export function snapYeepsTempo(bpm) {
  let best = YEEPS_TEMPOS[0];
  let bestDist = Math.abs(bpm - best);
  for (const t of YEEPS_TEMPOS) {
    const d = Math.abs(bpm - t);
    if (d < bestDist) {
      best = t;
      bestDist = d;
    }
  }
  return best;
}
