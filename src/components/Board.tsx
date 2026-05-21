import { EXPERIMENTS } from '../experiments/config';
import { getLegalNextTiles } from '../engine/seamGraph';
import type { GuessResult, TileDef } from '../engine/types';
import type { PuzzleDef } from '../engine/types';
import './Board.css';
import '../experiments/onboarding/onboarding.css';

interface BoardProps {
  puzzle: PuzzleDef;
  path: TileDef[];
  onTileClick: (tile: TileDef) => void;
  lastResult: GuessResult | null;
  disabled?: boolean;
  wrongFeedbackActive?: boolean;
  demoPathIds?: string[];
  lost?: boolean;
  won?: boolean;
}

function tileFeedbackClass(
  tileId: string,
  path: TileDef[],
  lastResult: GuessResult | null,
): string {
  if (!lastResult) return '';
  const idx = path.findIndex((t) => t.id === tileId);
  if (idx === -1) return '';
  const fb = lastResult.tileFeedback[idx];
  if (!fb) return '';
  return `board-tile--${fb}`;
}

export function Board({
  puzzle,
  path,
  onTileClick,
  lastResult,
  disabled = false,
  wrongFeedbackActive = false,
  demoPathIds = [],
  lost = false,
  won = false,
}: BoardProps) {
  const demoIds = new Set(demoPathIds);
  const boardLocked = disabled || wrongFeedbackActive;
  const showLegalNext = EXPERIMENTS.legalNextHighlight && !boardLocked;
  const visited = new Set(path.map((t) => t.id));
  const lastTile = path[path.length - 1];
  const legalNext = lastTile
    ? getLegalNextTiles(lastTile, puzzle.tiles, visited)
    : puzzle.tiles;
  const legalIds = boardLocked
    ? new Set<string>()
    : new Set(
        path.length === 0 ? puzzle.tiles.map((t) => t.id) : legalNext.map((t) => t.id),
      );

  return (
    <div
      className={[
        'board-frame',
        boardLocked ? 'board-frame--locked' : '',
        lost ? 'board-frame--game-over' : '',
        won ? 'board-frame--won' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${puzzle.gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${puzzle.gridRows}, 1fr)`,
        }}
      >
      {puzzle.tiles.map((tile) => {
        const inPath = visited.has(tile.id);
        const pathIndex = path.findIndex((t) => t.id === tile.id);
        const canSelect = !boardLocked && !inPath && legalIds.has(tile.id);
        const isLast = path.length > 0 && path[path.length - 1]?.id === tile.id;
        const tileDisabled = boardLocked || (path.length > 0 && !inPath && !canSelect);

        const isDouble = tile.colSpan === 2 && tile.rowSpan === 2;
        const inDemo = demoIds.has(tile.id);
        const isLegalNext =
          showLegalNext && path.length > 0 && !inPath && legalIds.has(tile.id);

        return (
          <button
            key={tile.id}
            type="button"
            className={[
              'board-tile',
              isDouble ? 'board-tile--double' : '',
              inPath ? 'board-tile--in-path' : '',
              inDemo ? 'board-tile--demo' : '',
              !boardLocked && (canSelect || path.length === 0) ? 'board-tile--selectable' : '',
              isLegalNext ? 'board-tile--legal-next' : '',
              isLast ? 'board-tile--last' : '',
              wrongFeedbackActive && inPath ? 'board-tile--wrong-flash' : '',
              tileFeedbackClass(tile.id, path, lastResult),
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              gridColumn: `${tile.col + 1} / span ${tile.colSpan}`,
              gridRow: `${tile.row + 1} / span ${tile.rowSpan}`,
            }}
            onClick={() => onTileClick(tile)}
            disabled={tileDisabled}
            aria-label={`Tile ${tile.letters}${inPath ? `, position ${pathIndex + 1} in path` : ''}`}
          >
            <span className="board-tile__letters">{tile.letters}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
