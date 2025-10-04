// CodeStatus enum from backend
export enum CodeStatus {
  Active = 1,
  Used = 2,
  Expired = 3,
  Revoked = 4,
  Suspended = 5,
}

// ActivationCode entity interfaces - Codes for activating robot ownership
export interface ActivationCode {
  id: string;
  code: string;
  robotId: string;
  status: CodeStatus; // Backend trả về status (enum: 1=Active, 2=Used, 3=Expired, 4=Revoked, 5=Suspended)
  usedAt?: string;
  studentId?: string; // Backend field name (changed from UsedById)
  expiresAt?: string;
  batchId: string; // Backend trả về batchId
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;

  // Flat fields from backend (not nested objects)
  robotName?: string; // Backend trả về flat field
  studentFullname?: string; // Backend trả về flat field (changed from UsedByFullname)

  // Navigation properties (if populated by BE) - DEPRECATED, backend không dùng
  robot?: {
    id: string;
    name: string;
    model: string;
    brand: string;
    imageUrl?: string;
  };
  student?: {
    // Changed from usedByStudent
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Request types
export interface ValidateActivationCodeRequest {
  code: string;
}

export interface ActivateRobotRequest {
  activationCode: string;
}

export interface CreateActivationCodeBatchRequest {
  robotId: string;
  quantity: number;
  expiresAt?: string;
  batchId: string; // ID nhóm mã (bắt buộc)
  codeLength?: number; // Độ dài mã (6-64, mặc định 16)
  codePrefix?: string; // Tiền tố mã (optional)
}

// Response types
export interface ActivationCodeResult extends ActivationCode {}

export interface ActivationCodesResponse {
  items: ActivationCodeResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ValidateActivationCodeResponse {
  isValid: boolean;
  message: string;
  robot?: {
    id: string;
    name: string;
    model: string;
    brand: string;
    imageUrl?: string;
  };
  expiresAt?: string;
}

export interface ActivateRobotResponse {
  success: boolean;
  message: string;
  studentRobotId?: string;
  studentRobot?: {
    id: string;
    robotId: string;
    activationDate: string;
  };
  robot?: {
    id: string;
    name: string;
    model: string;
    brand: string;
    imageUrl?: string;
  };
}

export interface CreateActivationCodeBatchResponse {
  success: boolean;
  message: string;
  codes: string[];
  quantity: number;
}

export interface RedeemActivationCodeRequest {
  code: string;
}

export interface RedeemActivationCodeResponse {
  success: boolean;
  message: string;
  activationCodeId?: string;
  robotId?: string;
  robot?: {
    id: string;
    name: string;
    model: string;
    brand: string;
    imageUrl?: string;
  };
}

// Admin list filter request
export interface GetActivationCodesRequest {
  robotId?: string;
  studentId?: string; //  NEW: Filter by student (changed from UsedById)
  batchId?: string;
  status?: CodeStatus;
  searchTerm?: string;
  includeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: number;
  sortDirection?: number;
}
