// Certificate status enum - matches BE CertificateStatus
export enum CertificateStatus {
  DRAFT = 0,
  ISSUED = 1,
  REVOKED = 2,
  EXPIRED = 3,
}

// Status labels for UI
export const CERTIFICATE_STATUS_LABELS = {
  [CertificateStatus.DRAFT]: "Nháp",
  [CertificateStatus.ISSUED]: "Đã cấp",
  [CertificateStatus.REVOKED]: "Đã thu hồi",
  [CertificateStatus.EXPIRED]: "Hết hạn",
};

// Status colors for UI
export const CERTIFICATE_STATUS_COLORS = {
  [CertificateStatus.DRAFT]: "default",
  [CertificateStatus.ISSUED]: "success",
  [CertificateStatus.REVOKED]: "error",
  [CertificateStatus.EXPIRED]: "warning",
} as const;
