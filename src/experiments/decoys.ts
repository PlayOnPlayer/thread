import { EXPERIMENTS } from './config';

const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';
const VOWELS = 'AEIOU';
/** ~English letter frequency for decoy singles when vowelAwareDecoys is on */
const VOWEL_CHANCE = 0.38;

const LEGACY_DECOY_SINGLES = CONSONANTS;

export function pickDecoySingle(seed: number): string {
  if (!EXPERIMENTS.vowelAwareDecoys) {
    return LEGACY_DECOY_SINGLES[Math.abs(seed) % LEGACY_DECOY_SINGLES.length]!;
  }
  const pool =
    Math.abs(seed) % 100 < VOWEL_CHANCE * 100 ? VOWELS : CONSONANTS;
  return pool[Math.abs(seed >> 3) % pool.length]!;
}
