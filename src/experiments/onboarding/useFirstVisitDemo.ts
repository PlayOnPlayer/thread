import { useEffect, useState } from 'react';
import type { PuzzleDef } from '../../engine/types';
import { EXPERIMENTS } from '../config';
import { isOnboardingComplete, markOnboardingComplete } from './storage';

const STEP_MS = 550;

export function useFirstVisitDemo(puzzle: PuzzleDef, paused: boolean) {
  const [demoPathIds, setDemoPathIds] = useState<string[]>([]);
  const [demoActive, setDemoActive] = useState(false);

  useEffect(() => {
    if (!EXPERIMENTS.firstVisitDemo || paused) {
      setDemoActive(false);
      setDemoPathIds([]);
      return;
    }
    if (isOnboardingComplete()) return;

    const fullPath = puzzle.solutions[0]?.path ?? [];
    if (fullPath.length === 0) return;

    setDemoActive(true);
    setDemoPathIds([]);
    let step = 0;
    let cancelled = false;

    const timer = window.setInterval(() => {
      if (cancelled) return;
      step += 1;
      if (step <= fullPath.length) {
        setDemoPathIds(fullPath.slice(0, step));
        return;
      }
      window.clearInterval(timer);
      markOnboardingComplete();
      setDemoActive(false);
      setDemoPathIds([]);
    }, STEP_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [puzzle.id, paused]);

  return { demoPathIds, demoActive };
}
