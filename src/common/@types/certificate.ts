import { CertificateStatus } from "common/enums/certificate.enum";

// Certificate entity from BE
export interface Certificate {
  id: string;
  studentId: string;
  studentFullname: string;
  courseId: string;
  courseTitle: string;
  enrollmentId?: string;
  templateId: string;
  certificateNo: string; // Mã chứng chỉ
  verificationCode: string; // Mã xác thực
  issuedAt: string;
  expiresAt?: string;
  status: CertificateStatus;
  createdAt: string;
  updatedAt: string;
}

// Same as Certificate for result type
export type CertificateResult = Certificate;

// Request types
export interface GetCertificatesRequest {
  page?: number;
  size?: number;
  searchTerm?: string;
  studentId?: string;
  courseId?: string;
  status?: CertificateStatus;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

export interface IssueCertificateRequest {
  studentId: string;
  courseId: string;
  enrollmentId?: string;
  templateId: string;
  expiresAt?: string;
}

export interface RevokeCertificateRequest {
  reason?: string;
}

// Response types
export interface CertificatesResponse {
  items: CertificateResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
