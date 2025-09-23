import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MapResult, MapsResponse } from "common/@types/map";
import {
  getMapsThunk,
  getMapByIdThunk,
  createMapThunk,
  updateMapThunk,
  deleteMapThunk,
  restoreMapThunk,
} from "./mapThunks";

interface MapState {
  // Maps list
  maps: {
    data: MapsResponse | null;
    isLoading: boolean;
    error: string | null;
    lastQuery: any;
  };
  // Current map
  currentMap: {
    data: MapResult | null;
    isLoading: boolean;
    error: string | null;
  };
  // Operations state
  operations: {
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isRestoring: boolean;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;
    restoreError: string | null;
  };
}

const initialState: MapState = {
  maps: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  currentMap: {
    data: null,
    isLoading: false,
    error: null,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isRestoring: false,
    createError: null,
    updateError: null,
    deleteError: null,
    restoreError: null,
  },
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    // Clear maps list
    clearMaps: (state) => {
      state.maps.data = null;
      state.maps.error = null;
      state.maps.lastQuery = null;
    },

    // Clear current map
    clearCurrentMap: (state) => {
      state.currentMap.data = null;
      state.currentMap.error = null;
    },

    // Set current map
    setCurrentMap: (state, action: PayloadAction<MapResult>) => {
      state.currentMap.data = action.payload;
      state.currentMap.error = null;
    },

    // Clear all errors
    clearMapErrors: (state) => {
      state.maps.error = null;
      state.currentMap.error = null;
      state.operations.createError = null;
      state.operations.updateError = null;
      state.operations.deleteError = null;
      state.operations.restoreError = null;
    },

    // Reset entire state
    resetMapState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get maps
      .addCase(getMapsThunk.pending, (state, action) => {
        state.maps.isLoading = true;
        state.maps.error = null;
        state.maps.lastQuery = action.meta.arg;
      })
      .addCase(getMapsThunk.fulfilled, (state, action) => {
        state.maps.isLoading = false;
        state.maps.error = null;
        state.maps.data = action.payload;
      })
      .addCase(getMapsThunk.rejected, (state, action) => {
        state.maps.isLoading = false;
        state.maps.error = action.payload || "Failed to fetch maps";
      })

      // Get map by ID
      .addCase(getMapByIdThunk.pending, (state) => {
        state.currentMap.isLoading = true;
        state.currentMap.error = null;
      })
      .addCase(getMapByIdThunk.fulfilled, (state, action) => {
        state.currentMap.isLoading = false;
        state.currentMap.error = null;
        state.currentMap.data = action.payload;
      })
      .addCase(getMapByIdThunk.rejected, (state, action) => {
        state.currentMap.isLoading = false;
        state.currentMap.error = action.payload || "Failed to fetch map";
      })

      // Create map
      .addCase(createMapThunk.pending, (state) => {
        state.operations.isCreating = true;
        state.operations.createError = null;
      })
      .addCase(createMapThunk.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = null;
        // Add to maps list if exists
        if (state.maps.data?.items) {
          state.maps.data.items.unshift(action.payload);
          state.maps.data.total += 1;
        }
      })
      .addCase(createMapThunk.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.operations.createError = action.payload || "Failed to create map";
      })

      // Update map
      .addCase(updateMapThunk.pending, (state) => {
        state.operations.isUpdating = true;
        state.operations.updateError = null;
      })
      .addCase(updateMapThunk.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = null;
        // Update current map if same ID
        if (state.currentMap.data?.id === action.payload.id) {
          state.currentMap.data = action.payload;
        }
        // Update in maps list if exists
        if (state.maps.data?.items) {
          const index = state.maps.data.items.findIndex(
            (map) => map.id === action.payload.id
          );
          if (index !== -1) {
            state.maps.data.items[index] = action.payload;
          }
        }
      })
      .addCase(updateMapThunk.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.operations.updateError = action.payload || "Failed to update map";
      })

      // Delete map
      .addCase(deleteMapThunk.pending, (state) => {
        state.operations.isDeleting = true;
        state.operations.deleteError = null;
      })
      .addCase(deleteMapThunk.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = null;
        // Remove from maps list if exists
        if (state.maps.data?.items) {
          const index = state.maps.data.items.findIndex(
            (map) => map.id === action.payload
          );
          if (index !== -1) {
            state.maps.data.items.splice(index, 1);
            state.maps.data.total -= 1;
          }
        }
        // Clear current map if same ID
        if (state.currentMap.data?.id === action.payload) {
          state.currentMap.data = null;
        }
      })
      .addCase(deleteMapThunk.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.operations.deleteError = action.payload || "Failed to delete map";
      })

      // Restore map
      .addCase(restoreMapThunk.pending, (state) => {
        state.operations.isRestoring = true;
        state.operations.restoreError = null;
      })
      .addCase(restoreMapThunk.fulfilled, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = null;
        // Add back to maps list if exists
        if (state.maps.data?.items) {
          state.maps.data.items.unshift(action.payload);
          state.maps.data.total += 1;
        }
      })
      .addCase(restoreMapThunk.rejected, (state, action) => {
        state.operations.isRestoring = false;
        state.operations.restoreError = action.payload || "Failed to restore map";
      });
  },
});

export const {
  clearMaps,
  clearCurrentMap,
  setCurrentMap,
  clearMapErrors,
  resetMapState,
} = mapSlice.actions;

// Export thunks
export {
  getMapsThunk as getMaps,
  getMapByIdThunk as getMapById,
  createMapThunk as createMap,
  updateMapThunk as updateMap,
  deleteMapThunk as deleteMap,
  restoreMapThunk as restoreMap,
};

const mapReducer = mapSlice.reducer;
export default mapReducer;