// Student entity interfaces based on BE models
export interface Student {
  id: string;
  userId: string;
  fullname: string;
  dateOfBirth: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  enrollmentsCount?: number;
  submissionsCount?: number;
}

// Request types
export interface CreateStudentRequest {
  fullname: string;
  dateOfBirth: string; // ISO date string
}

export interface UpdateStudentRequest {
  fullname: string;
  dateOfBirth: string; // ISO date string
}

export interface GetStudentsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  dateOfBirthFrom?: string; // ISO date string
  dateOfBirthTo?: string; // ISO date string
}

// Response types
export interface StudentResult extends Student {}

export interface StudentsResponse {
  data: StudentResult[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}