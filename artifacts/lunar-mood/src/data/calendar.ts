import { MoonPhase } from "./day-entry.types";

export function getLocalStartOfDay(input?: Date): Date {
  const date = input ? new Date(input) : new Date();

  if (isNaN(date.getTime())) {
    return new Date();
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

export function toLocalNoon(input?: Date): Date {
  const date = input ? new Date(input) : new Date();

  if (isNaN(date.getTime())) {
    return new Date();
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  );
}

export function formatDate(date: Date): string {
  const localDate = getLocalStartOfDay(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);

  return getLocalStartOfDay(new Date(year, month - 1, day));
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  // Padding début
  for (let i = 0; i < first.getDay(); i++) {
    days.push(new Date(year, month, -i));
  }
  days.reverse();

  // Jours du mois
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

export function isCurrentMonth(
  date: Date,
  year: number,
  month: number,
): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}
