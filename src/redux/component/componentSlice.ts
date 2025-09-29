import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ComponentResult, ComponentsResponse } from "common/@types/component";
import {
  getComponentsThunk,
  getComponentByIdThunk,
  createComponentThunk,
  updateComponentThunk,
  deleteComponentThunk,
} from "./componentThunks";

interface ComponentState {
  // Components list
  components: {
    data: ComponentsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current component
  currentComponent: {
    data: ComponentResult | null;
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

const initialState: ComponentState = {
  components: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentComponent: {
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

const componentSlice = createSlice({
  name: "component",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.components.error = null;
      state.currentComponent.error = null;
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
    // Clear current component
    clearCurrentComponent: (state) => {
      state.currentComponent.data = null;
      state.currentComponent.error = null;
    },
    // Set current component
    setCurrentComponent: (state, action: PayloadAction<ComponentResult>) => {
      state.currentComponent.data = action.payload;
      state.currentComponent.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Components
    builder
      .addCase(getComponentsThunk.pending, (state, action) => {
        state.components.isLoading = true;
        state.components.error = null;
        state.components.lastQuery = action.meta.arg;
      })
      .addCase(getComponentsThunk.fulfilled, (state, action) => {
        state.components.isLoading = false;
        state.components.data = action.payload;
        state.components.error = null;
      })
      .addCase(getComponentsThunk.rejected, (state, action) => {
        state.components.isLoading = false;
        state.components.error = action.payload as string;
      });

    // Get Component By ID
    builder
      .addCase(getComponentByIdThunk.pending, (state) => {
        state.currentComponent.isLoading = true;
        state.currentComponent.error = null;
      })
      .addCase(getComponentByIdThunk.fulfilled, (state, action) => {
        state.currentComponent.isLoading = false;
        state.currentComponent.data = action.payload;
        state.currentComponent.error = null;
      })
      .addCase(getComponentByIdThunk.rejected, (state, action) => {
        state.currentComponent.isLoading = false;
        state.currentComponent.error = action.payload as string;
      });

    // Create Component
    builder
      .addCase(createComponentThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
        state.operations.createSuccess = false;
      })
      .addCase(createComponentThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createSuccess = true;
        state.operations.createError = null;
        
        // Add new component to the list if list exists
        if (state.components.data?.items) {
          state.components.data.items.unshift(action.payload);
          state.components.data.total += 1;
        }
      })
      .addCase(createComponentThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload as string;
        state.operations.createSuccess = false;
      });

    // Update Component
    builder
      .addCase(updateComponentThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
        state.operations.updateSuccess = false;
      })
      .addCase(updateComponentThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateSuccess = true;
        state.operations.updateError = null;
        
        // Update current component if it matches
        if (state.currentComponent.data?.id === action.payload.id) {
          state.currentComponent.data = action.payload;
        }
        
        // Update component in the list if list exists
        if (state.components.data?.items) {
          const index = state.components.data.items.findIndex(
            (component) => component.id === action.payload.id
          );
          if (index !== -1) {
            state.components.data.items[index] = action.payload;
          }
        }
      })
      .addCase(updateComponentThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload as string;
        state.operations.updateSuccess = false;
      });

    // Delete Component
    builder
      .addCase(deleteComponentThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
        state.operations.deleteSuccess = false;
      })
      .addCase(deleteComponentThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteSuccess = true;
        state.operations.deleteError = null;
        
        // Hard delete - remove from list completely
        if (state.components.data?.items) {
          const index = state.components.data.items.findIndex(
            (component) => component.id === action.payload
          );
          if (index !== -1) {
            state.components.data.items.splice(index, 1);
            state.components.data.total -= 1;
          }
        }
        
        // Clear current component if it matches deleted component
        if (state.currentComponent.data?.id === action.payload) {
          state.currentComponent.data = null;
        }
      })
      .addCase(deleteComponentThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload as string;
        state.operations.deleteSuccess = false;
      });

  },
});

export const {
  clearErrors,
  clearSuccessFlags,
  clearCurrentComponent,
  setCurrentComponent,
} = componentSlice.actions;

export default componentSlice.reducer;
