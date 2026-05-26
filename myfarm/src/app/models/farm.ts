export type FarmProductCategory =
  | 'lapte'
  | 'lapte_vaca'
  | 'lapte_capra'
  | 'lapte_oaie'
  | 'oua'
  | 'lana'
  | 'ore_munca'
  | 'carne';

export interface DailyLogEntry {
  date: string;
  milkCow?: number;
  milkGoat?: number;
  milkSheep?: number;
  milk?: number;
  eggs?: number;
  wool?: number;
  workHours?: number;
  meat?: number;
}

export interface Animal {
  id: number;
  name: string;
  icon: string;
  count: number;
  logs: DailyLogEntry[];
}
