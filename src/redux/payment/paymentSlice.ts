import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  PaymentTransactionResult,
  PaymentHistoryResult,
  PaymentLinkResult,
} from "common/@types/payment";
import { Paginate } from "common/@types";
import {
  getPaymentHistoryThunk,
  getPaymentByOrderIdThunk,
  initiatePaymentThunk,
  cancelPaymentThunk,
} from "./paymentThunks";

interface PaymentState {
  // Payment history
  history: {
    data: Paginate<PaymentHistoryResult> | null;
    isLoading: boolean;
    error: string | null;
  };
  // Current payment transaction
  currentPayment: {
    data: PaymentTransactionResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Payment link (from PayOS)
  paymentLink: {
    data: PaymentLinkResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isInitiating: boolean;
    isCancelling: boolean;
    initiateError: string | null;
    cancelError: string | null;
  };
}

const initialState: PaymentState = {
  history: {
    data: null,
    isLoading: false,
    error: null,
  },
  currentPayment: {
    data: null,
    isLoading: false,
    error: null,
  },
  paymentLink: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isInitiating: false,
    isCancelling: false,
    initiateError: null,
    cancelError: null,
  },
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    // Clear payment link after use
    clearPaymentLink: (state) => {
      state.paymentLink.data = null;
      state.paymentLink.error = null;
    },
    // Clear current payment
    clearCurrentPayment: (state) => {
      state.currentPayment.data = null;
      state.currentPayment.error = null;
    },
    // Clear errors
    clearPaymentErrors: (state) => {
      state.history.error = null;
      state.currentPayment.error = null;
      state.paymentLink.error = null;
      state.operations.initiateError = null;
      state.operations.cancelError = null;
    },

    // Toast actions
    setMessageSuccess: (_state, action: PayloadAction<string>) => {
      toast.success(action.payload);
    },
    setMessageError: (_state, action: PayloadAction<string>) => {
      toast.error(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Get payment history
    builder
      .addCase(getPaymentHistoryThunk.pending, (state) => {
        state.history.isLoading = true;
        state.history.error = null;
      })
      .addCase(
        getPaymentHistoryThunk.fulfilled,
        (state, action: PayloadAction<Paginate<PaymentHistoryResult>>) => {
          state.history.isLoading = false;
          state.history.data = action.payload;
        }
      )
      .addCase(getPaymentHistoryThunk.rejected, (state, action) => {
        state.history.isLoading = false;
        state.history.error = action.payload as string;
      });

    // Get payment by order ID
    builder
      .addCase(getPaymentByOrderIdThunk.pending, (state) => {
        state.currentPayment.isLoading = true;
        state.currentPayment.error = null;
      })
      .addCase(
        getPaymentByOrderIdThunk.fulfilled,
        (state, action: PayloadAction<PaymentTransactionResult>) => {
          state.currentPayment.isLoading = false;
          state.currentPayment.data = action.payload;
        }
      )
      .addCase(getPaymentByOrderIdThunk.rejected, (state, action) => {
        state.currentPayment.isLoading = false;
        state.currentPayment.error = action.payload as string;
      });

    // Initiate payment
    builder
      .addCase(initiatePaymentThunk.pending, (state) => {
        state.operations.isInitiating = true;
        state.operations.initiateError = null;
        state.paymentLink.isLoading = true;
        state.paymentLink.error = null;
      })
      .addCase(
        initiatePaymentThunk.fulfilled,
        (state, action: PayloadAction<PaymentLinkResult>) => {
          state.operations.isInitiating = false;
          state.paymentLink.isLoading = false;
          state.paymentLink.data = action.payload;
        }
      )
      .addCase(initiatePaymentThunk.rejected, (state, action) => {
        state.operations.isInitiating = false;
        state.operations.initiateError = action.payload as string;
        state.paymentLink.isLoading = false;
        state.paymentLink.error = action.payload as string;
      });

    // Cancel payment
    builder
      .addCase(cancelPaymentThunk.pending, (state) => {
        state.operations.isCancelling = true;
        state.operations.cancelError = null;
      })
      .addCase(cancelPaymentThunk.fulfilled, (state) => {
        state.operations.isCancelling = false;
        // Clear current payment after cancellation
        state.currentPayment.data = null;
      })
      .addCase(cancelPaymentThunk.rejected, (state, action) => {
        state.operations.isCancelling = false;
        state.operations.cancelError = action.payload as string;
      });
  },
});

export const {
  clearPaymentLink,
  clearCurrentPayment,
  clearPaymentErrors,
  setMessageSuccess,
  setMessageError,
} = paymentSlice.actions;

export default paymentSlice.reducer;
