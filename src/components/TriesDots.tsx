import './TriesDots.css';

interface TriesDotsProps {
  triesLeft: number;
  maxTries: number;
  hidden?: boolean;
}

/** Lucide "x" icon (ISC) — https://lucide.dev/icons/x */
function TryXIcon() {
  return (
    <svg
      className="game__try-x"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function TriesDots({ triesLeft, maxTries, hidden = false }: TriesDotsProps) {
  const wrongCount = maxTries - triesLeft;
  const label =
    triesLeft === 1 ? '1 try remaining' : `${triesLeft} tries remaining`;

  return (
    <div
      className={`game__tries-dots ${hidden ? 'game__slot--hidden' : ''}`}
      role="status"
      aria-label={label}
    >
      {Array.from({ length: maxTries }, (_, i) => {
        const spent = i < wrongCount;
        return (
          <span
            key={i}
            className={`game__try-dot ${spent ? 'game__try-dot--spent' : ''}`}
            aria-hidden
          >
            {spent ? <TryXIcon /> : null}
          </span>
        );
      })}
    </div>
  );
}
