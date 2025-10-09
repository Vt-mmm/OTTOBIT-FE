export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  type: number; // 1: Fixed amount, 2: Percentage
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usageCount: number;
  usageLimitPerUser: number;
  startDate: string;
  endDate: string;
  applicableCourseIds: string[] | null;
  target: number; // 1: All courses, 2: Specific courses
  createdById: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  voucherUsagesCount: number;
  createdByName: string;
  isExpired: boolean;
  isAvailable: boolean;
}

export interface VoucherCreateRequest {
  code: string;
  name: string;
  description: string;
  type: number; // 1: Fixed amount only
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usageLimitPerUser: number;
  startDate: string;
  endDate: string;
  target: number; // 1: All users only
  note?: string;
}

export interface VoucherUpdateRequest {
  code?: string;
  name?: string;
  description?: string;
  type?: number;
  discountValue?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startDate?: string;
  endDate?: string;
  applicableCourseIds?: string[];
  target?: number;
  note?: string;
}

export interface VoucherListResponse {
  message: string;
  data: {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: Voucher[];
  };
  errors: any;
  errorCode: any;
  timestamp: string;
}

export interface VoucherListParams {
  SearchTerm?: string;
  IncludeDeleted?: boolean;
  PageNumber?: number;
  PageSize?: number;
}
