import { createSlice } from "@reduxjs/toolkit";
import {
  CertificateTemplateResult,
  CertificateTemplatesResponse,
} from "common/@types/certificateTemplate";
import {
  getCertificateTemplatesThunk,
  getCertificateTemplateByIdThunk,
  createCertificateTemplateThunk,
  updateCertificateTemplateThunk,
  deleteCertificateTemplateThunk,
} from "./certificateTemplateThunks";

interface CertificateTemplateState {
  // Templates list
  templates: {
    data: CertificateTemplatesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current template
  currentTemplate: {
    data: CertificateTemplateResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;
    createSuccess: boolean;
    updateSuccess: boolean;
    deleteSuccess: boolean;
  };
}

const initialState: CertificateTemplateState = {
  templates: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentTemplate: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    createError: null,
    updateError: null,
    deleteError: null,
    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
  },
};

const certificateTemplateSlice = createSlice({
  name: "certificateTemplate",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.templates.error = null;
      state.currentTemplate.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
    },
    // Clear success flags
    clearSuccessFlags: (state) => {
      state.operations.createSuccess = false;
      state.operations.updateSuccess = false;
      state.operations.deleteSuccess = false;
    },
    // Clear current template
    clearCurrentTemplate: (state) => {
      state.currentTemplate.data = null;
      state.currentTemplate.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Templates
    builder
      .addCase(getCertificateTemplatesThunk.pending, (state, action) => {
        state.templates.isLoading = true;
        state.templates.error = null;
        state.templates.lastQuery = action.meta.arg;
      })
      .addCase(getCertificateTemplatesThunk.fulfilled, (state, action) => {
        state.templates.isLoading = false;
        state.templates.data = action.payload;
        state.templates.error = null;
      })
      .addCase(getCertificateTemplatesThunk.rejected, (state, action) => {
        state.templates.isLoading = false;
        state.templates.error = action.payload || "Failed to fetch templates";
      });

    // Get Template By ID
    builder
      .addCase(getCertificateTemplateByIdThunk.pending, (state) => {
        state.currentTemplate.isLoading = true;
        state.currentTemplate.error = null;
      })
      .addCase(getCertificateTemplateByIdThunk.fulfilled, (state, action) => {
        state.currentTemplate.isLoading = false;
        state.currentTemplate.data = action.payload;
        state.currentTemplate.error = null;
      })
      .addCase(getCertificateTemplateByIdThunk.rejected, (state, action) => {
        state.currentTemplate.isLoading = false;
        state.currentTemplate.error =
          action.payload || "Failed to fetch template";
      });

    // Create Template
    builder
      .addCase(createCertificateTemplateThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
        state.operations.createSuccess = false;
      })
      .addCase(createCertificateTemplateThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createSuccess = true;
        state.operations.createError = null;
        state.currentTemplate.data = action.payload;
      })
      .addCase(createCertificateTemplateThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError =
          action.payload || "Failed to create template";
        state.operations.createSuccess = false;
      });

    // Update Template
    builder
      .addCase(updateCertificateTemplateThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
        state.operations.updateSuccess = false;
      })
      .addCase(updateCertificateTemplateThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateSuccess = true;
        state.operations.updateError = null;
        state.currentTemplate.data = action.payload;
      })
      .addCase(updateCertificateTemplateThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError =
          action.payload || "Failed to update template";
        state.operations.updateSuccess = false;
      });

    // Delete Template
    builder
      .addCase(deleteCertificateTemplateThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
        state.operations.deleteSuccess = false;
      })
      .addCase(deleteCertificateTemplateThunk.fulfilled, (state) => {
        state.operations.isDeleting = false;
        state.operations.deleteSuccess = true;
        state.operations.deleteError = null;
      })
      .addCase(deleteCertificateTemplateThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError =
          action.payload || "Failed to delete template";
        state.operations.deleteSuccess = false;
      });
  },
});

export const { clearErrors, clearSuccessFlags, clearCurrentTemplate } =
  certificateTemplateSlice.actions;

export default certificateTemplateSlice.reducer;
