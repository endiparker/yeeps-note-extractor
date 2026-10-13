import { packDelays, paintForPitch } from "./paints.js";
import { getTempoPattern } from "./tempos.js";

/**
 * Format like Python repr of a list of strings.
 * @param {string[]} items
 */
function pyList(items) {
  return `[${items.map((s) => `'${s}'`).join(", ")}]`;
}

/**
 * @param {string} pitch
 * @returns {string}
 */
function paintLabel(pitch) {
  const paint = paintForPitch(pitch);
  if (paint) {
    const display = pitch.replaceAll("-", "♭").replaceAll("#", "♯");
    return `${paint} (${display})`;
  }
  return `No Paint (${pitch})`;
}

/** Musical symbol sixteenth note (matches NoteExtractor.py output). */
const SIXTEENTH = "\u{1D161}";

/**
 * Prefix sums of measure lengths so absoluteOffset is O(1).
 * cumBefore[n] = sixteenths before measure n (sparse object keyed by measure #).
 * @param {Record<number, number>} measureDivisions
 * @param {number | null} forceDivisions
 * @returns {Record<number, number>}
 */
function buildCumBefore(measureDivisions, forceDivisions) {
  const sorted = Object.keys(measureDivisions)
    .map(Number)
    .sort((a, b) => a - b);
  /** @type {Record<number, number>} */
  const cumBefore = {};
  let total = 0;
  for (const n of sorted) {
    cumBefore[n] = total;
    total += forceDivisions ?? measureDivisions[n] ?? 16;
  }
  return cumBefore;
}

/**
 * @param {Record<number, Record<number, string[]>>} measuresData
 * @param {{
 *   tempo: number,
 *   everyDivision: boolean,
 *   measureDivisions: Record<number, number>,
 *   forceDivisions: number | null,
 * }} options
 * @returns {string}
 */
export function formatYeepsText(measuresData, options) {
  const { tempo, everyDivision, measureDivisions, forceDivisions = null } = options;
  const { spacesPerDivision } = getTempoPattern(tempo);
  const everySpacer =
    spacesPerDivision <= 1
      ? ""
      : packDelays(spacesPerDivision - 1).join(" + ");
  const cumBefore = buildCumBefore(measureDivisions, forceDivisions);

  /** @type {string[]} */
  const lines = [];
  let blockCount = 0;
  /** @type {[number, number] | null} */
  let previousDivision = null;

  const measureKeys = Object.keys(measuresData)
    .map(Number)
    .sort((a, b) => a - b);

  /**
   * @param {number} measure
   */
  const slotsFor = (measure) =>
    forceDivisions ?? measureDivisions[measure] ?? 16;

  /**
   * @param {number} measure
   * @param {number} divisionBased
   */
  const absoluteOffset = (measure, divisionBased) =>
    (cumBefore[measure] ?? 0) + divisionBased - 1;

  for (const measure of measureKeys) {
    lines.push(`Measure ${measure}:`);
    const divisions = measuresData[measure];
    const divisionKeys = Object.keys(divisions)
      .map(Number)
      .sort((a, b) => a - b);
    const numDivisions = slotsFor(measure);

    if (everyDivision) {
      for (let i = 0; i < numDivisions; i++) {
        const division = i + 1;
        const pitches = divisions[i] || [];
        const colored = pitches.map(paintLabel);
        const spacer = everySpacer
          ? `\n  ${division}b ${everySpacer}`
          : "";

        if (!pitches.length) {
          lines.push(`  ${division}a AllWire : --No notes--${spacer}`);
        } else {
          lines.push(`  ${division}a AllWire + Note Blocks: ${pyList(colored)}${spacer}`);
        }
        blockCount += 2 + colored.length;
      }
    } else {
      for (const divIndex of divisionKeys) {
        const division = divIndex + 1;
        const pitches = divisions[divIndex] || [];
        const colored = pitches.map(paintLabel);
        /** @type {string[]} */
        let delays = [];
        let spacer = "";

        if (previousDivision === null) {
          previousDivision = [measure, division];
        } else {
          const [pM, pD] = previousDivision;
          previousDivision = [measure, division];
          const gap =
            absoluteOffset(measure, division) - absoluteOffset(pM, pD);
          const spaces = gap * spacesPerDivision - 1;

          lines.push(`  # spaces: ${spaces}`);
          delays = packDelays(spaces);
          spacer = `  - ${pyList(delays)}\n`;
        }

        lines.push(
          `${spacer}  ${SIXTEENTH} beat ${division}/${numDivisions} AllWire + Note Blocks (${colored.length})`,
        );
        lines.push(`  - ${pyList(colored)}`);
        blockCount += delays.length + colored.length + 1;
      }
    }
  }

  lines.push("");
  lines.push(`Total blocks: ${blockCount}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}
