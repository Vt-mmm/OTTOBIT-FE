// ============================================================================
// Order Types - API Request/Response Types
// ============================================================================

import { PaymentMethod } from "./payment";

// ============================================================================
// Enums
// ============================================================================

export enum OrderStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Cancelled = 3,
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Order result from API
 */
export interface OrderResult {
  id: string;
  userId: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  itemsCount?: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItemResult[];
  paymentTransactions?: PaymentTransactionSummary[];
}

/**
 * Order item result
 */
export interface OrderItemResult {
  id: string;
  orderId: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  unitPrice: number;
  createdAt: string;
}

/**
 * Payment transaction summary (in order context)
 */
export interface PaymentTransactionSummary {
  id: string;
  orderId: string;
  amount: number;
  status: number;
  method: number;
  orderCode?: number;
  createdAt: string;
}

/**
 * Order summary result (for list views)
 */
export interface OrderSummaryResult {
  id: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Create order from cart request
 */
export interface CreateOrderFromCartRequest {
  cartId: string;
}

/**
 * Get orders request (pagination)
 */
export interface GetOrdersRequest {
  page?: number;
  size?: number;
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
}

/**
 * Update order status request (admin)
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
