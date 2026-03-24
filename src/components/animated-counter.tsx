"use client";

import { useEffect, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
};

export function AnimatedCounter({ value, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 700;
    const start = performance.now();

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <strong>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </strong>
  );
}
