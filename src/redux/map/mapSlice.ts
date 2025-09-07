import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MapState,
  SetCurrentMapPayload,
  MapResult,
} from "features/phaser/types/map";
import {
  fetchAllMapsThunk,
  fetchLessonMapsThunk,
  clearLessonMapsCacheThunk,
  refreshLessonMapsThunk,
} from "./mapThunks";

const initialState: MapState = {
  allMaps: {
    data: null,
    isLoading: false,
    error: null,
    lastQuery: null,
  },
  lessonMaps: {
    data: null,
    isLoading: false,
    error: null,
    lastFetched: null,
  },
  currentMap: {
    mapKey: null,
    mapData: null,
  },
  cache: {
    isClearing: false,
    lastCleared: null,
  },
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    // Set current map
    setCurrentMap: (state, action: PayloadAction<SetCurrentMapPayload>) => {
      state.currentMap.mapKey = action.payload.mapKey;
      state.currentMap.mapData = action.payload.mapData || null;
    },

    // Clear current map
    clearCurrentMap: (state) => {
      state.currentMap.mapKey = null;
      state.currentMap.mapData = null;
    },

    // Clear all maps data
    clearAllMapsData: (state) => {
      state.allMaps.data = null;
      state.allMaps.error = null;
      state.allMaps.lastQuery = null;
    },

    // Clear lesson maps data
    clearLessonMapsData: (state) => {
      state.lessonMaps.data = null;
      state.lessonMaps.error = null;
      state.lessonMaps.lastFetched = null;
    },

    // Clear all errors
    clearMapErrors: (state) => {
      state.allMaps.error = null;
      state.lessonMaps.error = null;
    },

    // Reset entire map state
    resetMapState: () => {
      return initialState;
    },

    // Set map data directly (useful for testing or direct updates)
    setMapData: (
      state,
      action: PayloadAction<{ mapKey: string; mapData: MapResult }>
    ) => {
      const { mapKey, mapData } = action.payload;

      // Update current map if it matches
      if (state.currentMap.mapKey === mapKey) {
        state.currentMap.mapData = mapData;
      }

      // Update in allMaps if exists
      if (state.allMaps.data?.items) {
        const index = state.allMaps.data.items.findIndex(
          (map) => map.key === mapKey
        );
        if (index !== -1) {
          state.allMaps.data.items[index] = mapData;
        }
      }

      // Update in lessonMaps if exists
      if (state.lessonMaps.data?.mapsByType) {
        for (const typeKey in state.lessonMaps.data.mapsByType) {
          const maps = state.lessonMaps.data.mapsByType[typeKey] as MapResult[];
          if (maps) {
            const index = maps.findIndex(
              (map: MapResult) => map.key === mapKey
            );
            if (index !== -1) {
              maps[index] = mapData;
            }
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Maps
      .addCase(fetchAllMapsThunk.pending, (state, action) => {
        state.allMaps.isLoading = true;
        state.allMaps.error = null;
        state.allMaps.lastQuery = action.meta.arg;
      })
      .addCase(fetchAllMapsThunk.fulfilled, (state, action) => {
        state.allMaps.isLoading = false;
        state.allMaps.error = null;
        state.allMaps.data = action.payload;
      })
      .addCase(fetchAllMapsThunk.rejected, (state, action) => {
        state.allMaps.isLoading = false;
        state.allMaps.error = action.payload || "Failed to fetch all maps";
        state.allMaps.data = null;
      })

      // Fetch Lesson Maps
      .addCase(fetchLessonMapsThunk.pending, (state) => {
        state.lessonMaps.isLoading = true;
        state.lessonMaps.error = null;
      })
      .addCase(fetchLessonMapsThunk.fulfilled, (state, action) => {
        state.lessonMaps.isLoading = false;
        state.lessonMaps.error = null;
        state.lessonMaps.data = action.payload;
        state.lessonMaps.lastFetched = Date.now();
      })
      .addCase(fetchLessonMapsThunk.rejected, (state, action) => {
        state.lessonMaps.isLoading = false;
        state.lessonMaps.error =
          action.payload || "Failed to fetch lesson maps";
      })

      // Clear Lesson Maps Cache
      .addCase(clearLessonMapsCacheThunk.pending, (state) => {
        state.cache.isClearing = true;
      })
      .addCase(clearLessonMapsCacheThunk.fulfilled, (state) => {
        state.cache.isClearing = false;
        state.cache.lastCleared = Date.now();
      })
      .addCase(clearLessonMapsCacheThunk.rejected, (state) => {
        state.cache.isClearing = false;
      })

      // Refresh Lesson Maps
      .addCase(refreshLessonMapsThunk.pending, (state) => {
        state.lessonMaps.isLoading = true;
        state.cache.isClearing = true;
        state.lessonMaps.error = null;
      })
      .addCase(refreshLessonMapsThunk.fulfilled, (state, action) => {
        state.lessonMaps.isLoading = false;
        state.cache.isClearing = false;
        state.lessonMaps.error = null;
        state.lessonMaps.data = action.payload;
        state.lessonMaps.lastFetched = Date.now();
        state.cache.lastCleared = Date.now();
      })
      .addCase(refreshLessonMapsThunk.rejected, (state, action) => {
        state.lessonMaps.isLoading = false;
        state.cache.isClearing = false;
        state.lessonMaps.error =
          action.payload || "Failed to refresh lesson maps";
      });
  },
});

export const {
  setCurrentMap,
  clearCurrentMap,
  clearAllMapsData,
  clearLessonMapsData,
  clearMapErrors,
  resetMapState,
  setMapData,
} = mapSlice.actions;

// Export the thunks for use elsewhere
export {
  fetchAllMapsThunk as fetchAllMaps,
  fetchLessonMapsThunk as fetchLessonMaps,
  clearLessonMapsCacheThunk as clearLessonMapsCache,
  refreshLessonMapsThunk as refreshLessonMaps,
};

const mapReducer = mapSlice.reducer;
export default mapReducer;
