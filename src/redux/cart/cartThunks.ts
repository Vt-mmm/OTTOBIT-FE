import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { axiosClient } from "axiosClient/axiosClient";
import { ROUTES_API_CART, ROUTES_API_CART_ITEM } from "constants/routesApiKeys";
import {
  CartResult,
  CartSummaryResult,
  CartItemResult,
  ValidationResult,
  ItemExistsResponse,
  AddCartItemRequest,
  ApplyDiscountRequest,
  ValidateCartItemRequest,
} from "common/@types/cart";
import { extractApiErrorMessage } from "utils/errorHandler";

// API Response wrapper interface
interface ApiResponse<T> {
  message: string;
  data: T;
  errors?: string[] | null;
  errorCode?: string | null;
  timestamp?: string;
}

// Helper function for API calls with retry logic
async function callApiWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
      return await apiCall();
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;
      // Don't retry on 401 (unauthorized) or 404 (not found)
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 404
      ) {
        break;
      }
    }
  }
  throw lastError;
}

// ============================================================================
// CART MANAGEMENT THUNKS
// ============================================================================

/**
 * Get current user's cart
 * GET /api/v1/cart
 */
export const getCartThunk = createAsyncThunk<
  CartResult,
  void,
  { rejectValue: string }
>("cart/getCart", async (_, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CartResult>>(ROUTES_API_CART.GET_CART)
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch cart"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No cart data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to fetch cart");
    return rejectWithValue(errorMessage);
  }
});

/**
 * Create new cart for user
 * POST /api/v1/cart
 */
export const createCartThunk = createAsyncThunk<
  CartResult,
  void,
  { rejectValue: string }
>("cart/createCart", async (_, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<CartResult>>(ROUTES_API_CART.CREATE_CART)
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to create cart"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No cart data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to create cart");
    return rejectWithValue(errorMessage);
  }
});

/**
 * Clear all items from cart
 * DELETE /api/v1/cart
 */
export const clearCartThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("cart/clearCart", async (_, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<void>>(ROUTES_API_CART.CLEAR_CART)
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to clear cart"
      );
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(error, "Failed to clear cart");
    return rejectWithValue(errorMessage);
  }
});

/**
 * Get cart summary (lightweight)
 * GET /api/v1/cart/summary
 */
export const getCartSummaryThunk = createAsyncThunk<
  CartSummaryResult,
  void,
  { rejectValue: string }
>("cart/getSummary", async (_, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CartSummaryResult>>(
        ROUTES_API_CART.GET_SUMMARY,
        {
          // Prevent 404 from appearing in console
          validateStatus: (status) => {
            return (status >= 200 && status < 300) || status === 404;
          },
        }
      )
    );

    // Handle 404 case silently - cart not found is expected for new users
    if (response.status === 404) {
      return rejectWithValue('CART_NOT_FOUND');
    }

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch cart summary"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No cart summary data received");
    }

    return response.data.data;
  } catch (error: any) {
    // Additional fallback for 404
    if (error?.response?.status === 404) {
      return rejectWithValue('CART_NOT_FOUND');
    }
    
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch cart summary"
    );
    return rejectWithValue(errorMessage);
  }
});

/**
 * Validate cart before checkout
 * POST /api/v1/cart/validate
 * Note: Backend returns Result.Ok with message only (no data object)
 */
export const validateCartThunk = createAsyncThunk<
  ValidationResult,
  void,
  { rejectValue: string }
>("cart/validateCart", async (_, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<null>>(ROUTES_API_CART.VALIDATE_CART)
    );

    // Backend returns success with message only, no data
    // If we reach here without error, validation passed
    if (response.data.errors || response.data.errorCode) {
      return {
        isValid: false,
        errors: response.data.errors || [response.data.message],
        message: response.data.message,
      };
    }

    // Validation successful
    return {
      isValid: true,
      errors: undefined,
      warnings: undefined,
      message: response.data.message || "Cart validation successful",
    };
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to validate cart"
    );
    return rejectWithValue(errorMessage);
  }
});

/**
 * Apply discount to cart
 * POST /api/v1/cart/discount
 */
export const applyDiscountThunk = createAsyncThunk<
  CartResult,
  ApplyDiscountRequest,
  { rejectValue: string }
>("cart/applyDiscount", async (request, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<CartResult>>(
        ROUTES_API_CART.APPLY_DISCOUNT,
        request
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to apply discount"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No cart data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to apply discount"
    );

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

/**
 * Remove discount from cart
 * DELETE /api/v1/cart/discount
 */
export const removeDiscountThunk = createAsyncThunk<
  CartResult,
  void,
  { rejectValue: string }
>("cart/removeDiscount", async (_, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<CartResult>>(
        ROUTES_API_CART.REMOVE_DISCOUNT
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to remove discount"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No cart data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to remove discount"
    );

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// ============================================================================
// CART ITEM MANAGEMENT THUNKS
// ============================================================================

/**
 * Get all items in cart
 * GET /api/v1/cart/items
 */
export const getCartItemsThunk = createAsyncThunk<
  CartItemResult[],
  void,
  { rejectValue: string }
>("cart/getItems", async (_, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<CartItemResult[]>>(
        ROUTES_API_CART_ITEM.GET_ITEMS
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to fetch cart items"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No cart items data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to fetch cart items"
    );
    return rejectWithValue(errorMessage);
  }
});

/**
 * Add item to cart
 * POST /api/v1/cart/items
 */
export const addCartItemThunk = createAsyncThunk<
  CartItemResult,
  AddCartItemRequest,
  { rejectValue: string }
>("cart/addItem", async (request, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<CartItemResult>>(
        ROUTES_API_CART_ITEM.ADD_ITEM,
        request
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to add item to cart"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No cart item data received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to add item to cart"
    );

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

/**
 * Remove item from cart
 * DELETE /api/v1/cart/items/{courseId}
 */
export const removeCartItemThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("cart/removeItem", async (courseId, thunkAPI) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.delete<ApiResponse<void>>(
        ROUTES_API_CART_ITEM.REMOVE_ITEM(courseId)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to remove item from cart"
      );
      throw new Error(errorMessage);
    }

    return courseId;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to remove item from cart"
    );

    return thunkAPI.rejectWithValue(errorMessage);
  }
});

/**
 * Update cart item quantity
 * PATCH /api/v1/cart/items/{id}
 */
export const updateCartItemPriceThunk = createAsyncThunk<
  CartResult,
  { courseId: string; newPrice: number },
  { rejectValue: string }
>(
  "cart/updateItemPrice",
  async ({ courseId, newPrice }, { rejectWithValue }) => {
    try {
      const response = await callApiWithRetry(() =>
        axiosClient.put<ApiResponse<CartResult>>(
          ROUTES_API_CART_ITEM.UPDATE_ITEM_PRICE(courseId),
          { newPrice }
        )
      );

      if (response.data.errors || response.data.errorCode) {
        const errorMessage = extractApiErrorMessage(
          { response: { data: response.data } },
          "Failed to update item price"
        );
        throw new Error(errorMessage);
      }

      if (!response.data.data) {
        throw new Error("No cart data received");
      }

      return response.data.data;
    } catch (error: any) {
      const errorMessage = extractApiErrorMessage(
        error,
        "Failed to update item price"
      );
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Validate if item can be added to cart
 * POST /api/v1/cart/items/validate
 */
export const validateCartItemThunk = createAsyncThunk<
  ValidationResult,
  ValidateCartItemRequest,
  { rejectValue: string }
>("cart/validateItem", async (request, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.post<ApiResponse<ValidationResult>>(
        ROUTES_API_CART_ITEM.VALIDATE_ITEM,
        request
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to validate item"
      );
      throw new Error(errorMessage);
    }

    if (!response.data.data) {
      throw new Error("No validation result received");
    }

    return response.data.data;
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to validate item"
    );
    return rejectWithValue(errorMessage);
  }
});

/**
 * Check if item exists in cart
 * GET /api/v1/cart/items/exists/{courseId}
 */
export const checkItemExistsThunk = createAsyncThunk<
  ItemExistsResponse,
  string,
  { rejectValue: string }
>("cart/checkItemExists", async (courseId, { rejectWithValue }) => {
  try {
    const response = await callApiWithRetry(() =>
      axiosClient.get<ApiResponse<boolean>>(
        ROUTES_API_CART_ITEM.CHECK_EXISTS(courseId)
      )
    );

    if (response.data.errors || response.data.errorCode) {
      const errorMessage = extractApiErrorMessage(
        { response: { data: response.data } },
        "Failed to check item existence"
      );
      throw new Error(errorMessage);
    }

    if (response.data.data === undefined || response.data.data === null) {
      throw new Error("No item existence data received");
    }

    // Backend returns boolean, we need to transform to ItemExistsResponse
    return {
      exists: response.data.data,
      courseId: courseId,
    };
  } catch (error: any) {
    const errorMessage = extractApiErrorMessage(
      error,
      "Failed to check item existence"
    );
    return rejectWithValue(errorMessage);
  }
});
