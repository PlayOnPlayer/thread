import { useCallback, useMemo, useState } from 'react';
import { applyGuessResult, createInitialState, scoreGuess } from '../engine/guessScorer';
import { getLegalNextTiles, isPathConnected, pathToLetters } from '../engine/seamGraph';
import type { GameState, GuessResult, PuzzleDef, TileDef } from '../engine/types';
import { getRandomPuzzle, puzzles } from '../puzzles';
import { Board } from './Board';
import { PhraseStrip } from './PhraseStrip';
import './Game.css';

const MAX_TRIES = 3;

function countsAsWrongTry(
  result: GuessResult,
  puzzle: PuzzleDef,
  revealedWords: boolean[],
): boolean {
  if (result.revealedWordIndex !== null) return false;
  if (result.phraseFeedback === 'notInPhrase') return true;

  return puzzle.words.some(
    (word, index) => !revealedWords[index] && word.toUpperCase() === result.letters,
  );
}

function getPuzzleFromQuery(): PuzzleDef {
  const params = new URLSearchParams(window.location.search);
  const level = Number(params.get('level'));
  if (Number.isInteger(level) && level >= 1 && level <= puzzles.length) {
    return puzzles[level - 1]!;
  }

  const id = params.get('puzzle');
  if (id) {
    const found = puzzles.find((p) => p.id === id);
    if (found) return found;
  }
  return getRandomPuzzle();
}

export function Game() {
  const puzzle = useMemo(() => getPuzzleFromQuery(), []);
  const puzzleIndex = puzzles.findIndex((p) => p.id === puzzle.id);
  const activeLevel = puzzleIndex + 1;
  const [state, setState] = useState<GameState>(() => createInitialState(puzzle));
  const [path, setPath] = useState<TileDef[]>([]);
  const [feedbackPath, setFeedbackPath] = useState<TileDef[]>([]);
  const [triesLeft, setTriesLeft] = useState(MAX_TRIES);

  const lost = triesLeft === 0 && !state.won;
  const gameOver = state.won || lost;
  const pathLetters = pathToLetters(path);

  const handleTileClick = useCallback(
    (tile: TileDef) => {
      if (gameOver) return;

      setFeedbackPath([]);
      setPath((prev) => {
        const idx = prev.findIndex((t) => t.id === tile.id);
        if (idx >= 0) {
          if (idx === prev.length - 1) {
            return prev.length === 1 ? [] : prev.slice(0, -1);
          }
          return prev.slice(0, idx + 1);
        }

        if (prev.length === 0) {
          return [tile];
        }

        const last = prev[prev.length - 1]!;
        const visited = new Set(prev.map((t) => t.id));
        const legal = getLegalNextTiles(last, puzzle.tiles, visited);
        if (!legal.some((t) => t.id === tile.id)) {
          return prev;
        }
        return [...prev, tile];
      });
    },
    [gameOver, puzzle.tiles],
  );

  const clearPath = useCallback(() => {
    setPath([]);
    setFeedbackPath([]);
  }, []);

  const submitGuess = () => {
    if (path.length === 0 || gameOver) return;
    if (!isPathConnected(path, puzzle.tiles)) return;

    const result = scoreGuess(state, path);
    setState((s) => applyGuessResult(s, result));

    if (countsAsWrongTry(result, puzzle, state.revealedWords)) {
      setTriesLeft((t) => Math.max(0, t - 1));
    }

    if (result.revealedWordIndex !== null) {
      setPath([]);
      setFeedbackPath([]);
    } else {
      setFeedbackPath([...path]);
      setPath([]);
    }
  };

  const statusMessage = useMemo(() => {
    if (state.won) return 'You Won!';
    if (lost) return 'Game over.';
    const last = state.lastResult;
    if (!last) return null;
    if (last.phraseFeedback === 'wrongChapter' || last.phraseFeedback === 'notInPhrase') {
      return 'Wrong.';
    }
    return null;
  }, [state.won, lost, state.lastResult]);

  const handleClearSelection = useCallback(
    (e: React.MouseEvent) => {
      if (gameOver) return;
      const target = e.target as HTMLElement;
      if (target.closest('.board-frame')) return;
      if (target.closest('button') || target.closest('a')) return;
      clearPath();
    },
    [gameOver, clearPath],
  );

  return (
    <div className="game" onClick={handleClearSelection}>
      <header className="game__header">
        <h1 className="game__title">PHRASE FINDER</h1>
        <p className={`game__hint ${gameOver ? 'game__slot--hidden' : ''}`}>
          connect the boxes to find the words
        </p>
      </header>

      <PhraseStrip puzzle={puzzle} revealedWords={state.revealedWords} lost={lost} />

      <Board
        puzzle={puzzle}
        path={path.length > 0 ? path : feedbackPath}
        onTileClick={handleTileClick}
        lastResult={path.length > 0 ? null : state.lastResult}
        disabled={gameOver}
        lost={lost}
        won={state.won}
      />

      <div className="game__controls">
        <div className="game__path-preview" aria-live="polite">
          {path.length > 0 ? (
            <>
              <span className="game__path-label">Path:</span> {pathLetters}
            </>
          ) : (
            <span className="game__slot--hidden" aria-hidden="true">
              {'\u00a0'}
            </span>
          )}
        </div>
        <p className={`game__tries ${state.won ? 'game__slot--hidden' : ''}`}>
          Tries Left: <span className="game__tries-count">{triesLeft}</span>
        </p>
        <div className="game__buttons-wrap">
          {state.won ? (
            <p className="game__solved">
              Solved in {state.guesses} {state.guesses === 1 ? 'try' : 'tries'}
            </p>
          ) : null}
          <div className="game__buttons">
            <button type="button" onClick={clearPath} disabled={path.length === 0 || gameOver}>
              Clear
            </button>
            <button
              type="button"
              className="game__submit"
              onClick={submitGuess}
              disabled={path.length === 0 || gameOver}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <p className="game__status">{statusMessage ?? ''}</p>

      <footer className="game__footer">
        <nav className="game__pagination" aria-label="Level pagination">
          {puzzles.map((p, index) => {
            const level = index + 1;
            return (
              <a
                key={p.id}
                className={`game__page-link ${level === activeLevel ? 'game__page-link--active' : ''}`}
                href={`?level=${level}`}
                aria-current={level === activeLevel ? 'page' : undefined}
                aria-label={`Level ${level}`}
              >
                {level}
              </a>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}
