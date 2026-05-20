import { canStep, pathToLetters } from '../engine/seamGraph';
import type { TileDef } from '../engine/types';

/** BFS all paths up to maxLen — for puzzle authoring. */
export function findPathsForWord(
  tiles: TileDef[],
  word: string,
  maxPaths = 50,
): string[][] {
  const upper = word.toUpperCase();
  const results: string[][] = [];

  function search(path: TileDef[]) {
    if (results.length >= maxPaths) return;
    const spelled = pathToLetters(path).toUpperCase();
    if (spelled === upper) {
      results.push(path.map((t) => t.id));
      return;
    }
    if (spelled.length >= upper.length) return;
    if (!upper.startsWith(spelled)) return;

    const last = path[path.length - 1]!;
    const visited = new Set(path.map((t) => t.id));
    for (const next of tiles) {
      if (visited.has(next.id)) continue;
      if (!canStep(last, next, tiles)) continue;
      search([...path, next]);
    }
  }

  for (const start of tiles) {
    if (start.letters.toUpperCase()[0] === upper[0]) {
      search([start]);
    }
    if (start.letters.toUpperCase() === upper.slice(0, start.letters.length)) {
      if (start.letters.toUpperCase() === upper.slice(0, start.letters.length)) {
        search([start]);
      }
    }
  }

  return results;
}
