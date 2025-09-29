import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ImageResult, ImagesResponse } from "common/@types/image";
import {
  getImagesThunk,
  getImageByIdThunk,
  createImageThunk,
  updateImageThunk,
  deleteImageThunk,
} from "./imageThunks";

interface ImageState {
  // Images list
  images: {
    data: ImagesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current image
  currentImage: {
    data: ImageResult | null;
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

const initialState: ImageState = {
  images: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentImage: {
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

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.images.error = null;
      state.currentImage.error = null;
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
    // Clear current image
    clearCurrentImage: (state) => {
      state.currentImage.data = null;
      state.currentImage.error = null;
    },
    // Set current image
    setCurrentImage: (state, action: PayloadAction<ImageResult>) => {
      state.currentImage.data = action.payload;
      state.currentImage.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Images
    builder
      .addCase(getImagesThunk.pending, (state, action) => {
        state.images.isLoading = true;
        state.images.error = null;
        state.images.lastQuery = action.meta.arg;
      })
      .addCase(getImagesThunk.fulfilled, (state, action) => {
        state.images.isLoading = false;
        state.images.data = action.payload;
        state.images.error = null;
      })
      .addCase(getImagesThunk.rejected, (state, action) => {
        state.images.isLoading = false;
        state.images.error = action.payload as string;
      });

    // Get Image By ID
    builder
      .addCase(getImageByIdThunk.pending, (state) => {
        state.currentImage.isLoading = true;
        state.currentImage.error = null;
      })
      .addCase(getImageByIdThunk.fulfilled, (state, action) => {
        state.currentImage.isLoading = false;
        state.currentImage.data = action.payload;
        state.currentImage.error = null;
      })
      .addCase(getImageByIdThunk.rejected, (state, action) => {
        state.currentImage.isLoading = false;
        state.currentImage.error = action.payload as string;
      });

    // Create Image
    builder
      .addCase(createImageThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
        state.operations.createSuccess = false;
      })
      .addCase(createImageThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createSuccess = true;
        state.operations.createError = null;
        
        // Add new image to the list if list exists
        if (state.images.data?.items) {
          state.images.data.items.unshift(action.payload);
          state.images.data.total += 1;
        }
      })
      .addCase(createImageThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload as string;
        state.operations.createSuccess = false;
      });

    // Update Image
    builder
      .addCase(updateImageThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
        state.operations.updateSuccess = false;
      })
      .addCase(updateImageThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateSuccess = true;
        state.operations.updateError = null;
        
        // Update current image if it matches
        if (state.currentImage.data?.id === action.payload.id) {
          state.currentImage.data = action.payload;
        }
        
        // Update image in the list if list exists
        if (state.images.data?.items) {
          const index = state.images.data.items.findIndex(
            (image) => image.id === action.payload.id
          );
          if (index !== -1) {
            state.images.data.items[index] = action.payload;
          }
        }
      })
      .addCase(updateImageThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload as string;
        state.operations.updateSuccess = false;
      });

    // Delete Image
    builder
      .addCase(deleteImageThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
        state.operations.deleteSuccess = false;
      })
      .addCase(deleteImageThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteSuccess = true;
        state.operations.deleteError = null;
        
        // Remove image from the list if list exists
        if (state.images.data?.items) {
          state.images.data.items = state.images.data.items.filter(
            (image) => image.id !== action.payload
          );
          state.images.data.total -= 1;
        }
        
        // Clear current image if it matches deleted image
        if (state.currentImage.data?.id === action.payload) {
          state.currentImage.data = null;
        }
      })
      .addCase(deleteImageThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload as string;
        state.operations.deleteSuccess = false;
      });
  },
});

export const {
  clearErrors,
  clearSuccessFlags,
  clearCurrentImage,
  setCurrentImage,
} = imageSlice.actions;

export default imageSlice.reducer;
