// Import PaymentTransactionResult from payment.ts
import type { PaymentTransactionResult } from "./payment";

// Order Status Enum
export enum OrderStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Cancelled = 3,
  Refunded = 4,
}

// Re-export PaymentStatus and PaymentTransactionResult from payment.ts for convenience
export { PaymentStatus } from "./payment";
export type { PaymentTransactionResult } from "./payment";

// Order Item Result
export interface OrderItemResult {
  id: string;
  orderId: string;
  courseId: string;
  courseTitle: string;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

// Order Result
export interface OrderResult {
  id: string;
  userId: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  orderCode?: string; // Added for user-facing order reference
  createdAt: string;
  updatedAt: string;
  items: OrderItemResult[];
  paymentTransactions: PaymentTransactionResult[];
  // Admin fields
  userFullName?: string;
  userEmail?: string;
}

// Pagination Response
export interface OrdersResponse {
  items: OrderResult[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Request Types
export interface GetOrdersRequest {
  page?: number;
  size?: number;
  searchTerm?: string;
  status?: OrderStatus;
  orderBy?: string;
  orderDirection?: string;
}

export interface GetOrdersForAdminRequest extends GetOrdersRequest {
  userId?: string;
  includeDeleted?: boolean;
}

export interface CreateOrderFromCartRequest {
  // No fields needed, uses current user's cart
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface CancelOrderRequest {
  // No fields needed, uses orderId from URL
}
