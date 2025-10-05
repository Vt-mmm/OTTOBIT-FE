// ============================================================================
// Cart Types - API Request/Response Types
// ============================================================================

import { CartModel, CartItemModel, CartSummaryModel } from "common/models";

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Cart response from API
 */
export interface CartResult extends CartModel {}

/**
 * Cart summary response from API
 */
export interface CartSummaryResult extends CartSummaryModel {}

/**
 * Cart item response from API
 */
export interface CartItemResult extends CartItemModel {}

/**
 * Validation result response
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  message?: string;
}

/**
 * Item exists check response
 */
export interface ItemExistsResponse {
  exists: boolean;
  courseId: string;
  message?: string;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Add item to cart request
 */
export interface AddCartItemRequest {
  courseId: string;
  unitPrice: number;
}

/**
 * Update cart item price request
 */
export interface UpdateCartItemPriceRequest {
  newPrice: number;
}

/**
 * Apply discount request
 */
export interface ApplyDiscountRequest {
  discountAmount: number;
}

/**
 * Validate cart item request
 */
export interface ValidateCartItemRequest {
  courseId: string;
}

// ============================================================================
// Admin Cart Management Types
// ============================================================================
