export interface Course {
  _id: string;
  name: string;
  teacher?: { name: string } | null;
  videoPath: string;
  description?: string;
  price: number;
}
