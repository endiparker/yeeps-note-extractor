/** Yeeps paint names indexed by MIDI (E0=16 … A6=93). Contiguous, no gaps. */
const PAINT_MIDI_MIN = 16;
const PAINTS = [
  "BASS: Light Steel-Turtle",
  "BASS: MISSING",
  "BASS: Steel-Turtle",
  "BASS: Cadet-Turtle",
  "BASS: Rose-Turtle",
  "BASS: Light Steel",
  "BASS: Midnight-Turtle",
  "BASS: Steel",
  "BASS: Cadet",
  "BASS: Rose",
  "BASS: Dark Maroon",
  "BASS: Midnight",
  "BASS: Turquoise",
  "BASS: Dark Purple",
  "BASS: Gray",
  "BASS: Blurple",
  "BASS: Green",
  "BASS: Black",
  "BASS: Light Olive",
  "BASS: White",
  "BASS: Light Mocha",
  "BASS: Dark Red",
  "BASS: Red",
  "BASS: Mocha",
  "Light Steel OR BASS: Orange",
  "MISSING OR BASS: Light Brown",
  "Steel-Turtle OR BASS: Light Yellow",
  "Cadet-Turtle OR BASS: Light Teal",
  "Rose-Turtle OR BASS: Olive",
  "Light Steel OR BASS: Dark Green",
  "Midnight-Turtle OR BASS: Cyan",
  "Steel OR BASS: Dark Blue",
  "Cadet OR BASS: Light Blue",
  "Rose OR BASS: Blue",
  "Dark Maroon OR BASS: Purple",
  "Midnight OR BASS: Dark Gray",
  "Turquoise OR BASS: Brown",
  "Dark Purple OR BASS: Lavender",
  "Gray OR BASS: Dark Brown",
  "Blurple OR BASS: Orchid",
  "Green OR BASS: Teal",
  "Black OR BASS: Pink",
  "Light Olive OR BASS: Periwinkle",
  "White OR BASS: Yellow",
  "Light Mocha OR BASS: Guac",
  "Dark Red OR BASS: Lime",
  "Red OR BASS: Maroon",
  "Mocha OR BASS: Beige",
  "Orange OR BASS: Light Orange",
  "Light Brown",
  "Light Yellow",
  "Light Teal",
  "Olive",
  "Dark Green",
  "Cyan",
  "Dark Blue",
  "Light Blue",
  "Blue",
  "Purple",
  "Dark Gray",
  "Brown",
  "Lavender",
  "Dark Brown",
  "Orchid",
  "Teal",
  "Pink",
  "Periwinkle",
  "Yellow",
  "Guac",
  "Lime",
  "Maroon",
  "Beige",
  "Light Orange",
  "Amber",
  "Maroon-Rabbit",
  "Beige-Rabbit",
  "Light Orange-Rabbit",
  "Amber-Rabbit",
];

/** @type {Record<number, string>} */
export const delayBlocks = {
  200: "Big Delay",
  20: "Small Delay",
  2: "Tiny Delay",
  1: "Straight Wire",
};

/** Ordered delay sizes for packing space gaps (largest first). */
export const DELAY_SIZES = [200, 20, 2, 1];

const STEP_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/**
 * Parse music21-style pitch name to MIDI number (C4 = 60).
 * Supports # / ## / b / bb / - / -- (and longer) accidentals.
 * @param {string} pitch
 * @returns {number | null}
 */
export function pitchToMidi(pitch) {
  const m = /^([A-G])([#-]*)(-?\d+)$/.exec(pitch);
  if (!m) return null;
  const step = m[1];
  const acc = m[2];
  const octave = Number(m[3]);
  let alter = 0;
  for (const ch of acc) {
    if (ch === "#") alter += 1;
    else if (ch === "-") alter -= 1;
  }
  return (octave + 1) * 12 + STEP_PC[step] + alter;
}

/**
 * Resolve paint name for a pitch spelling via MIDI (enharmonic-safe).
 * @param {string} pitch
 * @returns {string | null}
 */
export function paintForPitch(pitch) {
  const midi = pitchToMidi(pitch);
  if (midi == null) return null;
  const i = midi - PAINT_MIDI_MIN;
  if (i < 0 || i >= PAINTS.length) return null;
  return PAINTS[i];
}

/**
 * Pack a space count into Yeeps delay/wire block names.
 * @param {number} spaces
 * @returns {string[]}
 */
export function packDelays(spaces) {
  /** @type {string[]} */
  const delays = [];
  let remainder = spaces;
  for (const size of DELAY_SIZES) {
    if (remainder < size) continue;
    const n = Math.floor(remainder / size);
    const name = delayBlocks[size];
    for (let i = 0; i < n; i++) delays.push(name);
    remainder %= size;
  }
  return delays;
}
