import type { PuzzleDef } from '../engine/types';
import './PhraseStrip.css';

interface PhraseStripProps {
  puzzle: PuzzleDef;
  revealedWords: boolean[];
}

export function PhraseStrip({ puzzle, revealedWords }: PhraseStripProps) {
  return (
    <div className="phrase-strip" aria-label="Hidden phrase">
      {puzzle.words.map((word, wordIndex) => (
        <div className="phrase-word-group" key={wordIndex}>
          {word.split('').map((_, letterIndex) => {
            const revealed = revealedWords[wordIndex];
            return (
              <div
                key={letterIndex}
                className={`phrase-tile ${revealed ? 'phrase-tile--revealed' : ''}`}
              >
                {revealed ? word[letterIndex] : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
