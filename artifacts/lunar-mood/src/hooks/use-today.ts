import { useEffect, useState } from "react";

import { getLocalStartOfDay } from "../data/calendar";

function getMillisecondsUntilNextDay(from: Date): number {
  const nextDay = new Date(from);
  nextDay.setDate(from.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);

  return Math.max(1_000, nextDay.getTime() - from.getTime());
}

export function useToday(): Date {
  const [today, setToday] = useState(() => getLocalStartOfDay());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextUpdate = () => {
      const now = new Date();
      const delay = getMillisecondsUntilNextDay(now);

      timeoutId = setTimeout(() => {
        setToday(getLocalStartOfDay());
        scheduleNextUpdate();
      }, delay);
    };

    setToday(getLocalStartOfDay());
    scheduleNextUpdate();

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return today;
}
