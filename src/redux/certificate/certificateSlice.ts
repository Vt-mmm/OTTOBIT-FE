import { createSlice } from "@reduxjs/toolkit";
import {
  CertificateResult,
  CertificatesResponse,
} from "common/@types/certificate";
import {
  getCertificatesThunk,
  getMyCertificatesThunk,
  getCertificateByIdThunk,
  revokeCertificateThunk,
  deleteCertificateThunk,
} from "./certificateThunks";

interface CertificateState {
  // Certificates list (Admin)
  certificates: {
    data: CertificatesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // My certificates (User)
  myCertificates: {
    data: CertificatesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current certificate
  currentCertificate: {
    data: CertificateResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isRevoking: boolean;
    isDeleting: boolean;
    revokeError: string | null;
    deleteError: string | null;
    revokeSuccess: boolean;
    deleteSuccess: boolean;
  };
}

const initialState: CertificateState = {
  certificates: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  myCertificates: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentCertificate: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isRevoking: false,
    isDeleting: false,
    revokeError: null,
    deleteError: null,
    revokeSuccess: false,
    deleteSuccess: false,
  },
};

const certificateSlice = createSlice({
  name: "certificate",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.certificates.error = null;
      state.myCertificates.error = null;
      state.currentCertificate.error = null;
      state.operations.revokeError = null;
      state.operations.deleteError = null;
    },
    // Clear success flags
    clearSuccessFlags: (state) => {
      state.operations.revokeSuccess = false;
      state.operations.deleteSuccess = false;
    },
    // Clear current certificate
    clearCurrentCertificate: (state) => {
      state.currentCertificate.data = null;
      state.currentCertificate.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Certificates (Admin)
    builder
      .addCase(getCertificatesThunk.pending, (state, action) => {
        state.certificates.isLoading = true;
        state.certificates.error = null;
        state.certificates.lastQuery = action.meta.arg;
      })
      .addCase(getCertificatesThunk.fulfilled, (state, action) => {
        state.certificates.isLoading = false;
        state.certificates.data = action.payload;
        state.certificates.error = null;
      })
      .addCase(getCertificatesThunk.rejected, (state, action) => {
        state.certificates.isLoading = false;
        state.certificates.error =
          action.payload || "Failed to fetch certificates";
      });

    // Get My Certificates (User)
    builder
      .addCase(getMyCertificatesThunk.pending, (state, action) => {
        state.myCertificates.isLoading = true;
        state.myCertificates.error = null;
        state.myCertificates.lastQuery = action.meta.arg;
      })
      .addCase(getMyCertificatesThunk.fulfilled, (state, action) => {
        state.myCertificates.isLoading = false;
        state.myCertificates.data = action.payload;
        state.myCertificates.error = null;
      })
      .addCase(getMyCertificatesThunk.rejected, (state, action) => {
        state.myCertificates.isLoading = false;
        state.myCertificates.error =
          action.payload || "Failed to fetch my certificates";
      });

    // Get Certificate By ID
    builder
      .addCase(getCertificateByIdThunk.pending, (state) => {
        state.currentCertificate.isLoading = true;
        state.currentCertificate.error = null;
      })
      .addCase(getCertificateByIdThunk.fulfilled, (state, action) => {
        state.currentCertificate.isLoading = false;
        state.currentCertificate.data = action.payload;
        state.currentCertificate.error = null;
      })
      .addCase(getCertificateByIdThunk.rejected, (state, action) => {
        state.currentCertificate.isLoading = false;
        state.currentCertificate.error =
          action.payload || "Failed to fetch certificate";
      });

    // Revoke Certificate
    builder
      .addCase(revokeCertificateThunk.pending, (state) => {
        state.operations.isRevoking = true;
        state.operations.revokeError = null;
        state.operations.revokeSuccess = false;
      })
      .addCase(revokeCertificateThunk.fulfilled, (state, action) => {
        state.operations.isRevoking = false;
        state.operations.revokeSuccess = true;
        state.operations.revokeError = null;
        // Update current certificate if it's the same
        if (state.currentCertificate.data?.id === action.payload.id) {
          state.currentCertificate.data = action.payload;
        }
      })
      .addCase(revokeCertificateThunk.rejected, (state, action) => {
        state.operations.isRevoking = false;
        state.operations.revokeError =
          action.payload || "Failed to revoke certificate";
        state.operations.revokeSuccess = false;
      });

    // Delete Certificate
    builder
      .addCase(deleteCertificateThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
        state.operations.deleteSuccess = false;
      })
      .addCase(deleteCertificateThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.operations.deleteSuccess = true;
        state.operations.deleteError = null;
      })
      .addCase(deleteCertificateThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError =
          action.payload || "Failed to delete certificate";
        state.operations.deleteSuccess = false;
      });
  },
});

export const { clearErrors, clearSuccessFlags, clearCurrentCertificate } =
  certificateSlice.actions;

export default certificateSlice.reducer;
