// ============================================================================
// Payment Types - API Request/Response Types
// ============================================================================

// ============================================================================
// Enums
// ============================================================================

export enum PaymentStatus {
  Pending = 0,
  Succeeded = 1,
  Failed = 2,
  Cancelled = 3,
}

export enum PaymentMethod {
  PayOS = 0,
  Cash = 1,
  BankTransfer = 2,
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Payment transaction result from API
 */
export interface PaymentTransactionResult {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  orderCode?: number;
  paidAt?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  order?: OrderSummary;
}

/**
 * Payment history result
 */
export interface PaymentHistoryResult {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  orderCode?: number;
  paidAt?: string;
  createdAt: string;
  order?: OrderSummary;
}

/**
 * Payment link result from PayOS
 */
export interface PaymentLinkResult {
  paymentUrl: string;
  orderCode: number;
  expiresAt: string;
  paymentLinkId: string;
}

/**
 * Order summary in payment context
 */
export interface OrderSummary {
  id: string;
  total: number;
  itemsCount: number;
  status: number;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Initiate payment request
 */
export interface InitiatePaymentRequest {
  paymentTransactionId: string;
  description: string;
}

/**
 * Get payment history request
 */
export interface GetPaymentHistoryRequest {
  page?: number;
  size?: number;
  orderId?: string;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

/**
 * Cancel payment request
 */
export interface CancelPaymentRequest {
  reason?: string;
}

/**
 * Payment callback query params (from PayOS)
 */
export interface PaymentCallbackParams {
  code?: string;
  id?: string;
  cancel?: string;
  status?: string;
  orderCode?: string;
}
