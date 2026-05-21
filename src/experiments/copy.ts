import { EXPERIMENTS } from './config';

const HINT_DEFAULT =
  'Form each word by tapping only boxes that are directly connected to each other';

const HINT_SHARP =
  'Form each word by tapping only boxes that are directly connected to each other, then press Submit';

export function getGameHint(): string {
  return EXPERIMENTS.sharpHint ? HINT_SHARP : HINT_DEFAULT;
}
