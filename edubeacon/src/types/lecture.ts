export interface LectureSummary {
  _id: string;
  name: string;
  price: number;
}

export interface Lecture {
  _id: string;
  name: string;
  course: { _id: string; name: string };
  teacher?: { name: string } | null;
  description?: string;
  price: number;
}
