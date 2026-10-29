import type { LectureSummary } from './lecture';

export interface Course {
  _id: string;
  name: string;
  description?: string;
  teacher?: { _id?: string; name: string } | null;
  price: number;
  subject?: string;
  grade?: string;
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
