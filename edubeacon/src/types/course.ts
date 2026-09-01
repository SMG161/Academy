import type { LectureSummary } from './lecture';

export interface Course {
  _id: string;
  name: string;
  description?: string;
  teacher?: { name: string } | null;
  price: number;
  lectures?: LectureSummary[];
  thumbnailUrl?: string | null;
}

export interface TeacherCourseSummary {
  _id: string;
  name: string;
  price: number;
  description: string;
  numLectures: number;
  createdAt: string;
}
