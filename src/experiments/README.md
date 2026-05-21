# Experiments (easy to remove)

Optional UX tweaks. To disable everything at once, set all flags to `false` in [`config.ts`](config.ts).

| Flag | What it does | Remove by |
|------|----------------|-----------|
| `sharpHint` | Stronger subtitle under title | `config.ts` + delete [`copy.ts`](copy.ts) import in Game |
| `legalNextHighlight` | Blue ring on tiles you can tap next | `config.ts` + Board highlight block |
| `firstVisitDemo` | Auto-plays first word path once | `config.ts` + delete [`onboarding/`](onboarding/) + Game hook |
| `vowelAwareDecoys` | Vowels on decoy tiles in generator | `config.ts` + regen catalog without [`decoys.ts`](decoys.ts) |
| `wordProgressLabel` | “Word 2 of 4” above phrase strip | `config.ts` + Game progress line |
| `clearWrongMessages` | Specific lines after bad submits | `config.ts` + [`copy.ts`](copy.ts) `getWrongGuessMessage` |

After changing `vowelAwareDecoys`, run: `npm run generate`
