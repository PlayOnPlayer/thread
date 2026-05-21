import type { GuessResult } from '../engine/types';
import { EXPERIMENTS } from './config';

const HINT_DEFAULT =
  'Form each word by tapping only boxes that are directly connected to each other';

const HINT_SHARP =
  'Form each word by tapping only boxes that are directly connected to each other, then press Submit';

export function getGameHint(): string {
  return EXPERIMENTS.sharpHint ? HINT_SHARP : HINT_DEFAULT;
}

export function getWordProgressLabel(
  revealedWords: boolean[],
  hidden: boolean,
): string | null {
  if (!EXPERIMENTS.wordProgressLabel || hidden) return null;
  const nextIndex = revealedWords.findIndex((revealed) => !revealed);
  if (nextIndex === -1) return null;
  return `Word ${nextIndex + 1} of ${revealedWords.length}`;
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
