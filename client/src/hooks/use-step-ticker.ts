"use client";

import { useEffect, useState } from "react";

export function useStepTicker(count: number, intervalMs: number): number {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((value) => Math.min(value + 1, count - 1)),
      intervalMs,
    );

    return () => clearInterval(timer);
  }, [count, intervalMs]);

  return step;
}
