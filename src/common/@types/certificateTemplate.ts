// CertificateTemplate entity from BE
export interface CertificateTemplate {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  backgroundImageUrl: string;
  bodyHtml: string; // HTML content với placeholders: {{studentName}}, {{courseName}}, {{issueDate}}, {{certificateNo}}
  issuerName: string;
  issuerTitle: string;
  signatureImageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Same as CertificateTemplate for result type
export type CertificateTemplateResult = CertificateTemplate;

// Request types
export interface GetCertificateTemplatesRequest {
  page?: number;
  size?: number;
  searchTerm?: string;
  courseId?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

export interface CreateCertificateTemplateRequest {
  courseId: string;
  name: string;
  backgroundImageUrl: string;
  bodyHtml: string;
  issuerName: string;
  issuerTitle: string;
  signatureImageUrl: string;
  isActive?: boolean;
}

export interface UpdateCertificateTemplateRequest {
  courseId?: string;
  name?: string;
  backgroundImageUrl?: string;
  bodyHtml?: string;
  issuerName?: string;
  issuerTitle?: string;
  signatureImageUrl?: string;
  isActive?: boolean;
}

// Response types
export interface CertificateTemplatesResponse {
  items: CertificateTemplateResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
