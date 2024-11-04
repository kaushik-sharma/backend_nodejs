import { subYears } from "date-fns";

export function getMidnightDate(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(year, month, day);
}

export function subtractYearsFromDate(date: Date, years: number): Date {
  return subYears(date, years);
}
