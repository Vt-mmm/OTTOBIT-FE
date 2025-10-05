// ============================================================================
// Cart Models - Domain Models for Shopping Cart
// ============================================================================

/**
 * Represents a shopping cart for a user
 */
export interface CartModel {
  id: string;
  userId: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
  items: CartItemModel[];
}

/**
 * Represents an item in the shopping cart
 */
export interface CartItemModel {
  id: string;
  cartId: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseImageUrl: string;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a summary of the cart (lightweight version)
 */
export interface CartSummaryModel {
  cartId: string;
  itemsCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  isEmpty: boolean;
  lastUpdated: string;
}

/**
 * Validation result for cart operations
 */
export interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Item existence check result
 */
export interface ItemExistsResult {
  exists: boolean;
  courseId: string;
}
