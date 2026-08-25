export interface Course {
  _id: string;
  name: string;
  teacher?: { name: string } | null;
  description?: string;
  price: number;
}
