import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { 
  LessonProgressStats, 
  MapCompletionStatus,
} from "common/@types";
import {
  fetchCompletedMapsThunk,
  markMapCompletedThunk,
  refreshCompletedMapsThunk,
  markMultipleMapsCompletedThunk,
} from "./lessonProcessThunks";

/**
 * LessonProcess State Interface
 */
interface LessonProcessState {
  // Completed maps data
  completedMapIds: string[];
  
  // Progress statistics
  progressStats: LessonProgressStats | null;
  
  // Completion statuses for all maps
  mapCompletionStatuses: MapCompletionStatus[];
  
  // Loading states
  isLoading: boolean;
  isMarkingComplete: boolean;
  
  // Error handling
  error: string | null;
  markCompleteError: string | null;
  
  // Last updated timestamp
  lastUpdated: number | null;
  
  // Cache management
  cacheExpiry: number | null;
}

/**
 * Initial state
 */
const initialState: LessonProcessState = {
  completedMapIds: [],
  progressStats: null,
  mapCompletionStatuses: [],
  isLoading: false,
  isMarkingComplete: false,
  error: null,
  markCompleteError: null,
  lastUpdated: null,
  cacheExpiry: null,
};

/**
 * LessonProcess Slice
 */
const lessonProcessSlice = createSlice({
  name: "lessonProcess",
  initialState,
  reducers: {
    // ===== Loading States =====
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setMarkingComplete: (state, action: PayloadAction<boolean>) => {
      state.isMarkingComplete = action.payload;
      if (action.payload) {
        state.markCompleteError = null;
      }
    },

    // ===== Completed Maps Management =====
    setCompletedMapIds: (state, action: PayloadAction<string[]>) => {
      state.completedMapIds = action.payload;
      state.lastUpdated = Date.now();
      state.cacheExpiry = Date.now() + (15 * 60 * 1000); // Cache for 15 minutes
      state.error = null;
    },

    addCompletedMapId: (state, action: PayloadAction<string>) => {
      const mapId = action.payload;
      if (!state.completedMapIds.includes(mapId)) {
        state.completedMapIds.push(mapId);
        state.lastUpdated = Date.now();
        // Update corresponding completion status
        const statusIndex = state.mapCompletionStatuses.findIndex(s => s.mapId === mapId);
        if (statusIndex >= 0) {
          state.mapCompletionStatuses[statusIndex].isCompleted = true;
          state.mapCompletionStatuses[statusIndex].completedAt = new Date().toISOString();
        }
      }
    },

    removeCompletedMapId: (state, action: PayloadAction<string>) => {
      const mapId = action.payload;
      state.completedMapIds = state.completedMapIds.filter(id => id !== mapId);
      state.lastUpdated = Date.now();
      // Update corresponding completion status
      const statusIndex = state.mapCompletionStatuses.findIndex(s => s.mapId === mapId);
      if (statusIndex >= 0) {
        state.mapCompletionStatuses[statusIndex].isCompleted = false;
        state.mapCompletionStatuses[statusIndex].completedAt = undefined;
      }
    },

    // ===== Progress Statistics =====
    setProgressStats: (state, action: PayloadAction<LessonProgressStats>) => {
      state.progressStats = action.payload;
    },

    updateProgressStats: (state, action: PayloadAction<Partial<LessonProgressStats>>) => {
      if (state.progressStats) {
        state.progressStats = { ...state.progressStats, ...action.payload };
      }
    },

    // ===== Map Completion Statuses =====
    setMapCompletionStatuses: (state, action: PayloadAction<MapCompletionStatus[]>) => {
      state.mapCompletionStatuses = action.payload;
    },

    updateMapCompletionStatus: (state, action: PayloadAction<{mapId: string; updates: Partial<MapCompletionStatus>}>) => {
      const { mapId, updates } = action.payload;
      const statusIndex = state.mapCompletionStatuses.findIndex(s => s.mapId === mapId);
      if (statusIndex >= 0) {
        state.mapCompletionStatuses[statusIndex] = {
          ...state.mapCompletionStatuses[statusIndex],
          ...updates
        };
      }
    },

    // ===== Error Handling =====
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.isLoading = false;
      }
    },

    setMarkCompleteError: (state, action: PayloadAction<string | null>) => {
      state.markCompleteError = action.payload;
      if (action.payload) {
        state.isMarkingComplete = false;
      }
    },

    clearError: (state) => {
      state.error = null;
      state.markCompleteError = null;
    },

    // ===== Cache Management =====
    clearCache: (state) => {
      state.completedMapIds = [];
      state.progressStats = null;
      state.mapCompletionStatuses = [];
      state.lastUpdated = null;
      state.cacheExpiry = null;
      state.error = null;
    },

    setCacheExpiry: (state, action: PayloadAction<number>) => {
      state.cacheExpiry = action.payload;
    },

    // ===== Reset State =====
    resetLessonProcess: () => initialState,
  },
  
  // ===== Extra Reducers for Async Thunks =====
  extraReducers: (builder) => {
    // ===== Fetch Completed Maps =====
    builder
      .addCase(fetchCompletedMapsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompletedMapsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.completedMapIds = action.payload;
        state.lastUpdated = Date.now();
        state.cacheExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes cache
        state.error = null;
      })
      .addCase(fetchCompletedMapsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch completed maps";
      })
      
      // ===== Mark Map Completed =====
      .addCase(markMapCompletedThunk.pending, (state) => {
        state.isMarkingComplete = true;
        state.markCompleteError = null;
      })
      .addCase(markMapCompletedThunk.fulfilled, (state, action) => {
        state.isMarkingComplete = false;
        const { mapId } = action.payload;
        
        // Add to completed maps if not already present (idempotent)
        if (!state.completedMapIds.includes(mapId)) {
          state.completedMapIds.push(mapId);
        }
        
        // Update completion status
        const statusIndex = state.mapCompletionStatuses.findIndex(s => s.mapId === mapId);
        if (statusIndex >= 0) {
          state.mapCompletionStatuses[statusIndex].isCompleted = true;
          state.mapCompletionStatuses[statusIndex].completedAt = new Date().toISOString();
        }
        
        // Update progress stats if available
        if (state.progressStats) {
          state.progressStats.completedMaps = state.completedMapIds.length;
          state.progressStats.completedMapIds = state.completedMapIds;
          if (state.progressStats.totalMaps > 0) {
            state.progressStats.progressPercentage = Math.round(
              (state.completedMapIds.length / state.progressStats.totalMaps) * 100
            );
          }
        }
        
        state.lastUpdated = Date.now();
        state.markCompleteError = null;
      })
      .addCase(markMapCompletedThunk.rejected, (state, action) => {
        state.isMarkingComplete = false;
        state.markCompleteError = action.payload || "Failed to mark map as completed";
      })
      
      // ===== Refresh Completed Maps =====
      .addCase(refreshCompletedMapsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshCompletedMapsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.completedMapIds = action.payload;
        state.lastUpdated = Date.now();
        state.cacheExpiry = Date.now() + (15 * 60 * 1000);
        state.error = null;
      })
      .addCase(refreshCompletedMapsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to refresh completed maps";
      })
      
      // ===== Mark Multiple Maps Completed =====
      .addCase(markMultipleMapsCompletedThunk.pending, (state) => {
        state.isMarkingComplete = true;
        state.markCompleteError = null;
      })
      .addCase(markMultipleMapsCompletedThunk.fulfilled, (state, action) => {
        state.isMarkingComplete = false;
        const { completedMapIds } = action.payload;
        
        // Add all successful completions to state
        completedMapIds.forEach(mapId => {
          if (!state.completedMapIds.includes(mapId)) {
            state.completedMapIds.push(mapId);
          }
          
          // Update completion status
          const statusIndex = state.mapCompletionStatuses.findIndex(s => s.mapId === mapId);
          if (statusIndex >= 0) {
            state.mapCompletionStatuses[statusIndex].isCompleted = true;
            state.mapCompletionStatuses[statusIndex].completedAt = new Date().toISOString();
          }
        });
        
        // Update progress stats
        if (state.progressStats) {
          state.progressStats.completedMaps = state.completedMapIds.length;
          state.progressStats.completedMapIds = state.completedMapIds;
          if (state.progressStats.totalMaps > 0) {
            state.progressStats.progressPercentage = Math.round(
              (state.completedMapIds.length / state.progressStats.totalMaps) * 100
            );
          }
        }
        
        state.lastUpdated = Date.now();
        state.markCompleteError = null;
      })
      .addCase(markMultipleMapsCompletedThunk.rejected, (state, action) => {
        state.isMarkingComplete = false;
        state.markCompleteError = action.payload || "Failed to mark multiple maps as completed";
      });
  },
});

// ===== Export Actions =====
export const {
  // Loading states
  setLoading,
  setMarkingComplete,
  
  // Completed maps
  setCompletedMapIds,
  addCompletedMapId,
  removeCompletedMapId,
  
  // Progress stats
  setProgressStats,
  updateProgressStats,
  
  // Completion statuses
  setMapCompletionStatuses,
  updateMapCompletionStatus,
  
  // Error handling
  setError,
  setMarkCompleteError,
  clearError,
  
  // Cache management
  clearCache,
  setCacheExpiry,
  
  // Reset
  resetLessonProcess,
} = lessonProcessSlice.actions;

// ===== Selectors =====
export const lessonProcessSelectors = {
  // Basic selectors
  selectCompletedMapIds: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.completedMapIds,
  
  selectProgressStats: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.progressStats,
  
  selectMapCompletionStatuses: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.mapCompletionStatuses,
  
  selectIsLoading: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.isLoading,
  
  selectIsMarkingComplete: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.isMarkingComplete,
  
  selectError: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.error,
  
  selectMarkCompleteError: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.markCompleteError,
  
  selectLastUpdated: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.lastUpdated,
  
  selectCacheExpiry: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.cacheExpiry,

  // Computed selectors
  selectIsMapCompleted: (mapId: string) => (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.completedMapIds.includes(mapId),
  
  selectCompletedMapsCount: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.completedMapIds.length,
  
  selectProgressPercentage: (state: { lessonProcess: LessonProcessState }) => 
    state.lessonProcess.progressStats?.progressPercentage ?? 0,
  
  selectIsCacheExpired: (state: { lessonProcess: LessonProcessState }) => {
    const { cacheExpiry } = state.lessonProcess;
    return !cacheExpiry || Date.now() > cacheExpiry;
  },
  
  selectHasAnyError: (state: { lessonProcess: LessonProcessState }) => 
    !!(state.lessonProcess.error || state.lessonProcess.markCompleteError),
};

export default lessonProcessSlice.reducer;