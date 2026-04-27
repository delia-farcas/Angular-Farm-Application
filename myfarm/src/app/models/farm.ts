export type FarmProductCategory = 'lapte' | 'oua' | 'lana' | 'ore_munca' | 'carne';

export interface DailyLogEntry {
  /** ISO date string, e.g. 2026-03-31 */
  date: string;
  milk: number;
  eggs: number;
  wool: number;
  workHours: number;
  meat: number;
}

export interface Animal {
  id: number;
  name: string;
  icon: string;
  count: number;
  logs: DailyLogEntry[];
}
