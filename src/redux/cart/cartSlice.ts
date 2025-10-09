import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CartResult,
  CartSummaryResult,
  CartItemResult,
  ValidationResult,
} from "common/@types/cart";
import {
  getCartThunk,
  createCartThunk,
  clearCartThunk,
  getCartSummaryThunk,
  validateCartThunk,
  applyDiscountThunk,
  removeDiscountThunk,
  getCartItemsThunk,
  addCartItemThunk,
  removeCartItemThunk,
  updateCartItemPriceThunk,
  validateCartItemThunk,
  checkItemExistsThunk,
} from "./cartThunks";

interface CartState {
  // Current cart
  cart: {
    data: CartResult | null;
    isLoading: boolean;
    error: string | null;
    appliedVoucher?: {
      code: string;
      name: string;
      discountAmount: number;
    } | null;
  };
  // Cart summary (lightweight)
  summary: {
    data: CartSummaryResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Cart items
  items: {
    data: CartItemResult[];
    isLoading: boolean;
    error: string | null;
  };
  // Validation results
  validation: {
    cartValidation: ValidationResult | null;
    itemValidation: ValidationResult | null;
  };
  // Item existence cache
  itemExistsCache: Record<string, boolean>;
  // Operations state
  operations: {
    isCreating: boolean;
    isClearing: boolean;
    isAddingItem: boolean;
    isRemovingItem: boolean;
    isUpdatingPrice: boolean;
    isApplyingDiscount: boolean;
    isRemovingDiscount: boolean;
    isValidating: boolean;
    createError: string | null;
    clearError: string | null;
    addItemError: string | null;
    removeItemError: string | null;
    updatePriceError: string | null;
    discountError: string | null;
    validationError: string | null;
  };
}

const initialState: CartState = {
  cart: {
    data: null,
    isLoading: false,
    error: null,
    appliedVoucher: null,
  },
  summary: {
    data: null,
    isLoading: false,
    error: null,
  },
  items: {
    data: [],
    isLoading: false,
    error: null,
  },
  validation: {
    cartValidation: null,
    itemValidation: null,
  },
  itemExistsCache: {},
  operations: {
    isCreating: false,
    isClearing: false,
    isAddingItem: false,
    isRemovingItem: false,
    isUpdatingPrice: false,
    isApplyingDiscount: false,
    isRemovingDiscount: false,
    isValidating: false,
    createError: null,
    clearError: null,
    addItemError: null,
    removeItemError: null,
    updatePriceError: null,
    discountError: null,
    validationError: null,
  },
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Clear cart data
    clearCartData: (state) => {
      state.cart.data = null;
      state.cart.error = null;
      state.cart.appliedVoucher = null;
    },

    // Clear cart summary
    clearCartSummary: (state) => {
      state.summary.data = null;
      state.summary.error = null;
    },

    // Clear cart items
    clearCartItems: (state) => {
      state.items.data = [];
      state.items.error = null;
    },

    // Clear validation results
    clearValidation: (state) => {
      state.validation.cartValidation = null;
      state.validation.itemValidation = null;
    },

    // Clear item exists cache
    clearItemExistsCache: (state) => {
      state.itemExistsCache = {};
    },

    // Clear all operation errors
    clearOperationErrors: (state) => {
      state.operations.createError = null;
      state.operations.clearError = null;
      state.operations.addItemError = null;
      state.operations.removeItemError = null;
      state.operations.updatePriceError = null;
      state.operations.discountError = null;
      state.operations.validationError = null;
    },

    applyVoucherLocally: (
      state,
      action: PayloadAction<{
        code: string;
        name: string;
        discountAmount: number;
      }>
    ) => {
      if (state.cart.data) {
        const { discountAmount, code, name } = action.payload;
        state.cart.data.discountAmount = discountAmount;
        const subtotal = (state.cart.data as any).subtotal ?? 0;
        (state.cart.data as any).total = Math.max(subtotal - discountAmount, 0);
        state.cart.appliedVoucher = { code, name, discountAmount };
      }
    },

    removeVoucherLocally: (state) => {
      if (state.cart.data) {
        state.cart.data.discountAmount = 0;
        const subtotal = (state.cart.data as any).subtotal ?? 0;
        (state.cart.data as any).total = subtotal;
      }
      state.cart.appliedVoucher = null;
    },

    // Update item exists cache
    updateItemExistsCache: (
      state,
      action: PayloadAction<{ courseId: string; exists: boolean }>
    ) => {
      state.itemExistsCache[action.payload.courseId] = action.payload.exists;
    },
  },
  extraReducers: (builder) => {
    // ============================================================================
    // GET CART
    // ============================================================================
    builder
      .addCase(getCartThunk.pending, (state) => {
        state.cart.isLoading = true;
        state.cart.error = null;
      })
      .addCase(getCartThunk.fulfilled, (state, action) => {
        state.cart.isLoading = false;
        state.cart.data = action.payload;
        state.cart.error = null;
      })
      .addCase(getCartThunk.rejected, (state, action) => {
        state.cart.isLoading = false;
        state.cart.error = action.payload || "Failed to fetch cart";
      });

    // ============================================================================
    // CREATE CART
    // ============================================================================
    builder
      .addCase(createCartThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
      })
      .addCase(createCartThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.cart.data = action.payload;
        state.operations.createError = null;
      })
      .addCase(createCartThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError =
          action.payload || "Failed to create cart";
      });

    // ============================================================================
    // CLEAR CART
    // ============================================================================
    builder
      .addCase(clearCartThunk.pending, (state) => {
        state.operations.isClearing = true;
        state.operations.clearError = null;
      })
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.operations.isClearing = false;
        state.cart.data = null;
        state.items.data = [];
        state.summary.data = null;
        state.itemExistsCache = {};
        state.operations.clearError = null;
      })
      .addCase(clearCartThunk.rejected, (state, action) => {
        state.operations.isClearing = false;
        state.operations.clearError = action.payload || "Failed to clear cart";
      });

    // ============================================================================
    // GET CART SUMMARY
    // ============================================================================
    builder
      .addCase(getCartSummaryThunk.pending, (state) => {
        state.summary.isLoading = true;
        state.summary.error = null;
      })
      .addCase(getCartSummaryThunk.fulfilled, (state, action) => {
        state.summary.isLoading = false;
        state.summary.data = action.payload;
        state.summary.error = null;
      })
      .addCase(getCartSummaryThunk.rejected, (state, action) => {
        state.summary.isLoading = false;
        state.summary.error = action.payload || "Failed to fetch cart summary";
      });

    // ============================================================================
    // VALIDATE CART
    // ============================================================================
    builder
      .addCase(validateCartThunk.pending, (state) => {
        state.operations.isValidating = true;
        state.operations.validationError = null;
      })
      .addCase(validateCartThunk.fulfilled, (state, action) => {
        state.operations.isValidating = false;
        state.validation.cartValidation = action.payload;
        state.operations.validationError = null;
      })
      .addCase(validateCartThunk.rejected, (state, action) => {
        state.operations.isValidating = false;
        state.operations.validationError =
          action.payload || "Failed to validate cart";
      });

    // ============================================================================
    // APPLY DISCOUNT
    // ============================================================================
    builder
      .addCase(applyDiscountThunk.pending, (state) => {
        state.operations.isApplyingDiscount = true;
        state.operations.discountError = null;
      })
      .addCase(applyDiscountThunk.fulfilled, (state, action) => {
        state.operations.isApplyingDiscount = false;
        state.cart.data = action.payload;
        state.operations.discountError = null;
      })
      .addCase(applyDiscountThunk.rejected, (state, action) => {
        state.operations.isApplyingDiscount = false;
        state.operations.discountError =
          action.payload || "Failed to apply discount";
      });

    // ============================================================================
    // REMOVE DISCOUNT
    // ============================================================================
    builder
      .addCase(removeDiscountThunk.pending, (state) => {
        state.operations.isRemovingDiscount = true;
        state.operations.discountError = null;
      })
      .addCase(removeDiscountThunk.fulfilled, (state, action) => {
        state.operations.isRemovingDiscount = false;
        state.cart.data = action.payload;
        state.operations.discountError = null;
      })
      .addCase(removeDiscountThunk.rejected, (state, action) => {
        state.operations.isRemovingDiscount = false;
        state.operations.discountError =
          action.payload || "Failed to remove discount";
      });

    // ============================================================================
    // GET CART ITEMS
    // ============================================================================
    builder
      .addCase(getCartItemsThunk.pending, (state) => {
        state.items.isLoading = true;
        state.items.error = null;
      })
      .addCase(getCartItemsThunk.fulfilled, (state, action) => {
        state.items.isLoading = false;
        state.items.data = action.payload;
        state.items.error = null;
      })
      .addCase(getCartItemsThunk.rejected, (state, action) => {
        state.items.isLoading = false;
        state.items.error = action.payload || "Failed to fetch cart items";
      });

    // ============================================================================
    // ADD CART ITEM
    // ============================================================================
    builder
      .addCase(addCartItemThunk.pending, (state) => {
        state.operations.isAddingItem = true;
        state.operations.addItemError = null;
      })
      .addCase(addCartItemThunk.fulfilled, (state, action) => {
        state.operations.isAddingItem = false;
        // Add item to items array
        state.items.data.push(action.payload);
        // Update exists cache with the added item's courseId
        state.itemExistsCache[action.payload.courseId] = true;
        // Update cart data if it exists
        if (state.cart.data) {
          state.cart.data.itemsCount += 1;
          // Note: Full cart will be refreshed by getCartThunk dispatch in component
        }
        state.operations.addItemError = null;
      })
      .addCase(addCartItemThunk.rejected, (state, action) => {
        state.operations.isAddingItem = false;
        state.operations.addItemError =
          action.payload || "Failed to add item to cart";
      });

    // ============================================================================
    // REMOVE CART ITEM
    // ============================================================================
    builder
      .addCase(removeCartItemThunk.pending, (state) => {
        state.operations.isRemovingItem = true;
        state.operations.removeItemError = null;
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        state.operations.isRemovingItem = false;
        // Remove from items array
        state.items.data = state.items.data.filter(
          (item) => item.courseId !== action.payload
        );
        // Update exists cache
        state.itemExistsCache[action.payload] = false;
        // Update cart data if exists
        if (state.cart.data) {
          state.cart.data.items = state.cart.data.items.filter(
            (item) => item.courseId !== action.payload
          );
          state.cart.data.itemsCount = state.cart.data.items.length;
        }
        state.operations.removeItemError = null;
      })
      .addCase(removeCartItemThunk.rejected, (state, action) => {
        state.operations.isRemovingItem = false;
        state.operations.removeItemError =
          action.payload || "Failed to remove item from cart";
      });

    // ============================================================================
    // UPDATE CART ITEM PRICE
    // ============================================================================
    builder
      .addCase(updateCartItemPriceThunk.pending, (state) => {
        state.operations.isUpdatingPrice = true;
        state.operations.updatePriceError = null;
      })
      .addCase(updateCartItemPriceThunk.fulfilled, (state, action) => {
        state.operations.isUpdatingPrice = false;
        state.cart.data = action.payload;
        state.operations.updatePriceError = null;
      })
      .addCase(updateCartItemPriceThunk.rejected, (state, action) => {
        state.operations.isUpdatingPrice = false;
        state.operations.updatePriceError =
          action.payload || "Failed to update item price";
      });

    // ============================================================================
    // VALIDATE CART ITEM
    // ============================================================================
    builder
      .addCase(validateCartItemThunk.pending, (state) => {
        state.operations.isValidating = true;
        state.operations.validationError = null;
      })
      .addCase(validateCartItemThunk.fulfilled, (state, action) => {
        state.operations.isValidating = false;
        state.validation.itemValidation = action.payload;
        state.operations.validationError = null;
      })
      .addCase(validateCartItemThunk.rejected, (state, action) => {
        state.operations.isValidating = false;
        state.operations.validationError =
          action.payload || "Failed to validate item";
      });

    // ============================================================================
    // CHECK ITEM EXISTS
    // ============================================================================
    builder
      .addCase(checkItemExistsThunk.pending, () => {
        // Silent operation, no loading state
      })
      .addCase(checkItemExistsThunk.fulfilled, (state, action) => {
        state.itemExistsCache[action.payload.courseId] = action.payload.exists;
      })
      .addCase(checkItemExistsThunk.rejected, () => {
        // Silent failure, no error state
      });
  },
});

export const {
  clearCartData,
  clearCartSummary,
  clearCartItems,
  clearValidation,
  clearItemExistsCache,
  clearOperationErrors,
  updateItemExistsCache,
  applyVoucherLocally,
  removeVoucherLocally,
} = cartSlice.actions;

export default cartSlice.reducer;
