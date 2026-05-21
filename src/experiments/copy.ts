import type { GuessResult } from '../engine/types';
import { EXPERIMENTS } from './config';

const HINT_TEXT = 'Form each word by tapping boxes that are only directly connected';

const HINT_DEFAULT = HINT_TEXT;

const HINT_SHARP = HINT_TEXT;

export function getGameHint(): string {
  return EXPERIMENTS.sharpHint ? HINT_SHARP : HINT_DEFAULT;
}

export function getWrongGuessMessage(result: GuessResult): string | null {
  if (!EXPERIMENTS.clearWrongMessages) return 'Wrong.';
  if (result.phraseFeedback === 'notInPhrase') return 'Not in the phrase.';
  if (result.phraseFeedback === 'wrongChapter') return 'Wrong word order — try another.';
  if (result.revealedWordIndex !== null) return null;
  const hasPossible = result.tileFeedback.some((f) => f === 'perfect' || f === 'ghost');
  if (hasPossible) return 'Some tiles look right — adjust your path.';
  return 'Wrong.';
}
