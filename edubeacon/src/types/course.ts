import type { LectureSummary } from './lecture';

export interface Course {
  _id: string;
  name: string;
  teacher?: { name: string } | null;
  price: number;
  lectures?: LectureSummary[];
}
