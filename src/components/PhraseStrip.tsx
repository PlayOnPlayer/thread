import type { PuzzleDef } from '../engine/types';
import './PhraseStrip.css';

interface PhraseStripProps {
  puzzle: PuzzleDef;
  revealedWords: boolean[];
  lost?: boolean;
}

export function PhraseStrip({ puzzle, revealedWords, lost = false }: PhraseStripProps) {
  return (
    <div className="phrase-strip" aria-label={lost ? 'Answer' : 'Hidden phrase'}>
      {puzzle.words.map((word, wordIndex) => {
        const wordRevealed = revealedWords[wordIndex];
        return (
          <div className="phrase-word-group" key={wordIndex}>
            {word.split('').map((letter, letterIndex) => {
              const isFirstTile = letterIndex === 0;
              const showLetter = wordRevealed || lost;
              const missed = lost && !wordRevealed;
              return (
                <div
                  key={letterIndex}
                  className={[
                    'phrase-tile',
                    wordRevealed ? 'phrase-tile--revealed' : '',
                    missed ? 'phrase-tile--missed' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isFirstTile && (
                    <span className="phrase-tile__word-num" aria-hidden>
                      {wordIndex + 1}
                    </span>
                  )}
                  {showLetter ? letter : ''}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
