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

export enum PaymentTransactionType {
  Charge = 0,
  Refund = 1,
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Payment transaction result from API
 * Matches backend: Ottobit.Service.Models.Payment.PaymentTransactionResult
 */
export interface PaymentTransactionResult {
  id: string;
  orderId: string;
  type: PaymentTransactionType; // Backend uses 'Type' (PaymentTransactionType)
  method: PaymentMethod;        // Backend uses 'Method' (PaymentMethod)
  orderCode?: number;           // Backend: long? OrderCode
  amount: number;
  status: PaymentStatus;
  errorCode?: string;
  errorMessage?: string;
  paidAt?: string;              // Backend: DateTime? PaidAt
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
