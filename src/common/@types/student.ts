// Student entity interfaces based on BE models
export interface Student {
  id: string;
  userId: string;
  fullname: string;
  email: string;
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
  items: StudentResult[];  // Backend trả về 'items' thay vì 'data'
  page: number;            // Backend trả về 'page' thay vì 'pageNumber'
  size: number;            // Backend trả về 'size' thay vì 'pageSize'
  total: number;           // Backend trả về 'total' thay vì 'totalCount'
  totalPages: number;
}
