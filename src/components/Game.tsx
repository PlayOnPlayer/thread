import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { applyGuessResult, createInitialState, scoreGuess } from '../engine/guessScorer';
import { getLegalNextTiles, isPathConnected, pathToLetters } from '../engine/seamGraph';
import type { GameState, GuessResult, PuzzleDef, TileDef } from '../engine/types';
import { getRandomPuzzle, puzzles } from '../puzzles';
import { Board } from './Board';
import { getPaginationItems } from './pagination';
import { PhraseStrip } from './PhraseStrip';
import { TriesDots } from './TriesDots';
import './Game.css';

const MAX_TRIES = 3;
const WRONG_FEEDBACK_MS = 3000;

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
  const totalLevels = puzzles.length;
  const [state, setState] = useState<GameState>(() => createInitialState(puzzle));
  const [path, setPath] = useState<TileDef[]>([]);
  const [feedbackPath, setFeedbackPath] = useState<TileDef[]>([]);
  const [triesLeft, setTriesLeft] = useState(MAX_TRIES);
  const [wrongFeedbackActive, setWrongFeedbackActive] = useState(false);
  const wrongFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lost = triesLeft === 0 && !state.won;
  const gameOver = state.won || lost;
  const pathLetters = pathToLetters(path);
  const paginationItems = useMemo(
    () => getPaginationItems(activeLevel, totalLevels),
    [activeLevel, totalLevels],
  );

  const dismissWrongFeedback = useCallback(() => {
    if (wrongFeedbackTimerRef.current) {
      clearTimeout(wrongFeedbackTimerRef.current);
      wrongFeedbackTimerRef.current = null;
    }
    setWrongFeedbackActive(false);
    setFeedbackPath([]);
    setState((s) => (s.lastResult ? { ...s, lastResult: null } : s));
  }, []);

  const startWrongFeedback = useCallback(() => {
    if (wrongFeedbackTimerRef.current) {
      clearTimeout(wrongFeedbackTimerRef.current);
    }
    setWrongFeedbackActive(true);
    wrongFeedbackTimerRef.current = setTimeout(() => {
      wrongFeedbackTimerRef.current = null;
      dismissWrongFeedback();
    }, WRONG_FEEDBACK_MS);
  }, [dismissWrongFeedback]);

  useEffect(() => {
    return () => {
      if (wrongFeedbackTimerRef.current) {
        clearTimeout(wrongFeedbackTimerRef.current);
      }
    };
  }, []);

  const handleTileClick = useCallback(
    (tile: TileDef) => {
      if (gameOver || wrongFeedbackActive) return;

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
    [gameOver, wrongFeedbackActive, puzzle.tiles],
  );

  const clearPath = useCallback(() => {
    if (wrongFeedbackActive) {
      dismissWrongFeedback();
    }
    setPath([]);
    setFeedbackPath([]);
  }, [wrongFeedbackActive, dismissWrongFeedback]);

  const submitGuess = () => {
    if (path.length === 0 || gameOver || wrongFeedbackActive) return;
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
      startWrongFeedback();
    }
  };

  const statusMessage = useMemo(() => {
    if (state.won) return null;
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

  const canClear = path.length > 0 || wrongFeedbackActive;
  const canSubmit = path.length > 0 && !gameOver && !wrongFeedbackActive;

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
        wrongFeedbackActive={wrongFeedbackActive}
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
        <TriesDots triesLeft={triesLeft} maxTries={MAX_TRIES} hidden={state.won} />
        {state.won ? (
          <p className="game__win-message" role="status">
            You Won!
          </p>
        ) : (
          <div className="game__buttons">
            <button type="button" onClick={clearPath} disabled={!canClear || gameOver}>
              Clear
            </button>
            <button
              type="button"
              className="game__submit"
              onClick={submitGuess}
              disabled={!canSubmit}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      <p className="game__status">{state.won ? '' : (statusMessage ?? '')}</p>

      <footer className="game__footer">
        <nav className="game__pagination" aria-label="Level pagination">
          {activeLevel > 1 ? (
            <a
              className="game__page-arrow"
              href={`?level=${activeLevel - 1}`}
              aria-label="Previous level"
            >
              &lt;
            </a>
          ) : (
            <span className="game__page-arrow game__page-arrow--disabled" aria-hidden>
              &lt;
            </span>
          )}
          {paginationItems.map((item, index) =>
            item.type === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="game__page-ellipsis" aria-hidden>
                …
              </span>
            ) : (
              <a
                key={item.level}
                className={`game__page-link ${item.level === activeLevel ? 'game__page-link--active' : ''}`}
                href={`?level=${item.level}`}
                aria-current={item.level === activeLevel ? 'page' : undefined}
                aria-label={`Level ${item.level}`}
              >
                {item.level}
              </a>
            ),
          )}
          {activeLevel < totalLevels ? (
            <a
              className="game__page-arrow"
              href={`?level=${activeLevel + 1}`}
              aria-label="Next level"
            >
              &gt;
            </a>
          ) : (
            <span className="game__page-arrow game__page-arrow--disabled" aria-hidden>
              &gt;
            </span>
          )}
        </nav>
      </footer>
    </div>
  );
}
