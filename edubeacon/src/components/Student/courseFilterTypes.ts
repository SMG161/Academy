export interface CourseFilterValues {
  search: string;
  teacher: string;
  subject: string;
  grade: string;
}

export const EMPTY_COURSE_FILTERS: CourseFilterValues = {
  search: '',
  teacher: '',
  subject: '',
  grade: '',
};
