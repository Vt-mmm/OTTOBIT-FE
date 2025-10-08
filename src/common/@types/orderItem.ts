// OrderItem Types - Matches Backend OrderItemResult
export interface OrderItem {
  id: string;
  orderId: string;
  courseId: string;
  courseTitle: string; // Backend field name
  courseDescription?: string;
  courseImageUrl?: string; // Backend field name
  unitPrice: number; // Backend field name
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemsResponse {
  items: OrderItem[];
  totalItems: number;
  orderId: string;
}

// Request types
export interface GetOrderItemsRequest {
  orderId: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ValidateOrderItemRequest {
  courseId: string;
  orderId: string;
}
