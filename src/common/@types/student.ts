// Student entity interfaces based on BE models
// Matched with BE StudentResult model
export interface Student {
  id: string;
  userId: string;
  fullname: string;
  phoneNumber: string; // Added from BE
  address: string; // Added from BE
  state: string; // Added from BE
  city: string; // Added from BE
  dateOfBirth: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  enrollmentsCount?: number;
  submissionsCount?: number;
}

// Request types - Matched with BE Commands
export interface CreateStudentRequest {
  fullname: string;
  phoneNumber?: string; // Added from BE
  address?: string; // Added from BE
  state?: string; // Added from BE
  city?: string; // Added from BE
  dateOfBirth: string; // ISO date string
}

export interface UpdateStudentRequest {
  fullname?: string;
  phoneNumber?: string; // Added from BE
  address?: string; // Added from BE
  state?: string; // Added from BE
  city?: string; // Added from BE
  dateOfBirth?: string; // ISO date string
}

export interface GetStudentsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  phoneNumber?: string; // Added from BE filter
  state?: string; // Added from BE filter
  city?: string; // Added from BE filter
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
