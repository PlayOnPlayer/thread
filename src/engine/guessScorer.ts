import { isPathConnected, pathToLetters } from './seamGraph';
import type {
  GameState,
  GuessResult,
  PuzzleDef,
  SeamFeedback,
  TileDef,
  TileFeedback,
  WordSolution,
} from './types';
import { canStep } from './seamGraph';

function findSolutionForWord(solutions: WordSolution[], word: string): WordSolution | undefined {
  const upper = word.toUpperCase();
  return solutions.find((s) => s.word.toUpperCase() === upper);
}

function findUnrevealedWordIndex(
  puzzle: PuzzleDef,
  word: string,
  revealedWords: boolean[],
): number | null {
  const upper = word.toUpperCase();
  const index = puzzle.words.findIndex(
    (phraseWord, wordIndex) => !revealedWords[wordIndex] && phraseWord.toUpperCase() === upper,
  );

  return index === -1 ? null : index;
}

function scoreTiles(
  path: TileDef[],
  target: WordSolution | undefined,
  candidateSolutions: WordSolution[],
): TileFeedback[] {
  const solutionTiles = new Set(
    candidateSolutions.flatMap((s) => s.path),
  );

  if (!target) {
    return path.map((t) => (solutionTiles.has(t.id) ? 'ghost' : 'dead'));
  }

  const targetPath = target.path;
  const targetIds = new Set(targetPath);

  return path.map((tile, i) => {
    if (!targetIds.has(tile.id)) return 'dead';
    const solutionIndex = targetPath.indexOf(tile.id);
    if (solutionIndex === i && targetPath[i] === tile.id) return 'perfect';
    if (targetIds.has(tile.id)) return 'ghost';
    return 'dead';
  });
}

function scoreSeams(
  path: TileDef[],
  target: WordSolution | undefined,
  tiles: TileDef[],
): SeamFeedback[] {
  if (path.length < 2) return [];

  return path.slice(1).map((to, i) => {
    const from = path[i]!;
    if (!target || target.path.length < 2) {
      return canStep(from, to, tiles) ? 'fractured' : 'fractured';
    }
    const targetPath = target.path;
    const idx = target.path.indexOf(to.id);
    if (idx <= 0) return 'fractured';
    if (targetPath[idx - 1] === from.id && targetPath[idx] === to.id) {
      return 'perfect';
    }
    if (targetPath.includes(from.id) && targetPath.includes(to.id)) {
      return 'fractured';
    }
    return 'fractured';
  });
}

export function scoreGuess(
  state: GameState,
  path: TileDef[],
): GuessResult {
  const { puzzle, revealedWords } = state;
  const letters = pathToLetters(path).toUpperCase();
  const connected = isPathConnected(path, puzzle.tiles);
  const unrevealedSolutions = puzzle.solutions.filter((_, index) => !revealedWords[index]);
  const matchingWordIndex = connected
    ? findUnrevealedWordIndex(puzzle, letters, revealedWords)
    : null;
  const acceptedPathSolution =
    matchingWordIndex === null
      ? undefined
      : { word: puzzle.words[matchingWordIndex]!, path: path.map((tile) => tile.id) };
  const solutionForGuess = findSolutionForWord(unrevealedSolutions, letters);
  const feedbackSolution = acceptedPathSolution ?? solutionForGuess;

  const tileFeedback = scoreTiles(
    path,
    connected ? feedbackSolution : undefined,
    unrevealedSolutions,
  );
  const seamFeedback = scoreSeams(path, connected ? feedbackSolution : undefined, puzzle.tiles);

  let phraseFeedback: GuessResult['phraseFeedback'] = null;
  let revealedWordIndex: number | null = null;
  let isWin = false;

  const wordInPhrase = puzzle.words.some((w) => w.toUpperCase() === letters);

  if (matchingWordIndex !== null) {
    phraseFeedback = 'solved';
    revealedWordIndex = matchingWordIndex;
    const newRevealed = [...revealedWords];
    newRevealed[matchingWordIndex] = true;
    isWin = newRevealed.every(Boolean);
  } else if (wordInPhrase) {
    phraseFeedback = null;
  } else if (!wordInPhrase && letters.length > 0) {
    phraseFeedback = 'notInPhrase';
  }

  return {
    letters,
    tileFeedback,
    seamFeedback,
    phraseFeedback,
    revealedWordIndex,
    isWin,
  };
}

export function applyGuessResult(state: GameState, result: GuessResult): GameState {
  const revealedWords = [...state.revealedWords];
  if (result.revealedWordIndex !== null) {
    revealedWords[result.revealedWordIndex] = true;
  }
  const firstHiddenIndex = revealedWords.findIndex((isRevealed) => !isRevealed);
  const currentWordIndex = firstHiddenIndex === -1 ? state.puzzle.words.length : firstHiddenIndex;

  return {
    ...state,
    revealedWords,
    currentWordIndex,
    guesses: state.guesses + 1,
    lastResult: result,
    won: result.isWin,
  };
}

export function createInitialState(puzzle: PuzzleDef): GameState {
  return {
    puzzle,
    currentWordIndex: 0,
    revealedWords: puzzle.words.map(() => false),
    guesses: 0,
    lastResult: null,
    won: false,
  };
}
