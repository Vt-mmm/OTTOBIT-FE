import { CertificateStatus } from "common/enums/certificate.enum";

// Certificate entity from BE - Matches CertificateResult
export interface Certificate {
  id: string;
  studentId: string;
  studentFullname: string; // Flat field from BE mapping
  courseId: string;
  courseTitle: string; // Flat field from BE mapping
  enrollmentId?: string;
  templateId: string;
  certificateNo: string; // Mã chứng chỉ
  verificationCode: string; // Mã xác thực
  issuedAt: string; // DateTime from BE
  expiresAt?: string; // Nullable DateTime from BE
  status: CertificateStatus; // Enum: Draft=0, Issued=1, Revoked=2, Expired=3
  createdAt: string; // DateTime from BE
  updatedAt: string; // DateTime from BE
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
