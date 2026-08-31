export interface StudentSummary {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CourseGrant {
  grantId: string;
  course: { _id: string; name: string; price: number };
  expiresAt: string;
}

export interface LectureGrant {
  grantId: string;
  lecture: { _id: string; name: string; price: number; course?: { _id: string; name: string } };
  expiresAt: string;
}

export interface StudentDetailResponse {
  student: { _id: string; name: string; email: string };
  courses: CourseGrant[];
  lectures: LectureGrant[];
}
