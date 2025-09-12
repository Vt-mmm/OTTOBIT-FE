/**
 * Lesson Progress Hook cho Phaser Features
 * Kết nối giữa phaser victory với backend lesson process API
 */

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { 
  fetchCompletedMapsThunk,
  markMapCompletedThunk,
  refreshCompletedMapsThunk 
} from "../../../redux/lessonProcess/lessonProcessThunks";
import { lessonProcessSelectors } from "../../../redux/lessonProcess/lessonProcessSlice";
import type { VictoryData } from "../types/phaser";
import type { MapResult } from "../types/map";

export function useLessonProgress() {
  const dispatch = useAppDispatch();
  
  // Get map state for finding maps by key
  const mapState = useAppSelector((state) => state.map);
  
  // Helper để tìm map by mapKey
  const findMapByKey = useCallback(
    (mapKey: string): MapResult | null => {
      // Check lesson maps
      if (mapState.lessonMaps?.data?.mapsByType) {
        for (const [, categoryMaps] of Object.entries(mapState.lessonMaps.data.mapsByType)) {
          const found = (categoryMaps as MapResult[])?.find(map => map.key === mapKey);
          if (found) {
            return found;
          }
        }
      }
      
      // Check all maps  
      if (mapState.allMaps?.data?.items) {
        const found = mapState.allMaps.data.items.find(map => map.key === mapKey);
        if (found) {
          return found;
        }
      }
      
      return null;
    },
    [mapState]
  );
  
  // Selectors
  const completedMapIds = useAppSelector(lessonProcessSelectors.selectCompletedMapIds);
  const isLoading = useAppSelector(lessonProcessSelectors.selectIsLoading);
  const isMarkingComplete = useAppSelector(lessonProcessSelectors.selectIsMarkingComplete);
  const error = useAppSelector(lessonProcessSelectors.selectError);
  const markCompleteError = useAppSelector(lessonProcessSelectors.selectMarkCompleteError);
  const progressStats = useAppSelector(lessonProcessSelectors.selectProgressStats);
  const isCacheExpired = useAppSelector(lessonProcessSelectors.selectIsCacheExpired);

  // Actions
  const fetchCompletedMaps = useCallback(
    (options?: { skipCache?: boolean }) => {
      return dispatch(fetchCompletedMapsThunk(options));
    },
    [dispatch]
  );

  const markMapCompleted = useCallback(
    async (mapId: string) => {
      try {
        const result = await dispatch(markMapCompletedThunk(mapId)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const refreshCompletedMaps = useCallback(() => {
    return dispatch(refreshCompletedMapsThunk());
  }, [dispatch]);

  // Helper: Check if map is completed
  const isMapCompleted = useCallback(
    (mapId: string) => {
      return completedMapIds.includes(mapId);
    },
    [completedMapIds]
  );

  // Helper: Get completion count for category
  const getCategoryProgress = useCallback(
    (allMaps: MapResult[], categoryName: string) => {
      const categoryMaps = allMaps.filter(map => 
        map.mapCategoryName === categoryName
      );
      
      const completedCount = categoryMaps.filter(map => 
        completedMapIds.includes(map.id)
      ).length;

      return {
        total: categoryMaps.length,
        completed: completedCount,
        percentage: categoryMaps.length > 0 ? Math.round((completedCount / categoryMaps.length) * 100) : 0
      };
    },
    [completedMapIds]
  );

  // Helper: Handle victory from Phaser
  const handleVictoryProgress = useCallback(
    async (victoryData: VictoryData, mapData?: MapResult) => {
      try {
        // Only mark as completed if victory is successful
        if (!victoryData.isVictory) {
          return;
        }

        // Extract mapId from victoryData or mapData
        let mapId: string | null = null;

        // Try multiple ways to get mapId
        if (mapData?.id) {
          mapId = mapData.id;
        } else if (victoryData.mapKey) {
          // If we have mapKey, try to find the map in Redux state
          const foundMap = findMapByKey(victoryData.mapKey);
          
          if (foundMap?.id) {
            mapId = foundMap.id;
          }
        }

        if (!mapId) {
          return;
        }

        // Check if already completed to avoid unnecessary API calls
        if (isMapCompleted(mapId)) {
          return;
        }

        // Mark as completed via API
        await markMapCompleted(mapId);

      } catch (error) {
        // Don't throw error to avoid breaking the victory flow
      }
    },
    [markMapCompleted, isMapCompleted, findMapByKey]
  );

  // Helper: Auto-fetch if needed
  const ensureCompletedMapsLoaded = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh || isCacheExpired || completedMapIds.length === 0) {
        await fetchCompletedMaps({ skipCache: forceRefresh });
      }
    },
    [fetchCompletedMaps, isCacheExpired, completedMapIds.length]
  );

  // Stats
  const stats = useMemo(() => ({
    totalCompleted: completedMapIds.length,
    isLoading,
    isMarkingComplete,
    hasError: !!(error || markCompleteError),
    errorMessage: error || markCompleteError,
  }), [
    completedMapIds.length,
    isLoading,
    isMarkingComplete,
    error,
    markCompleteError
  ]);

  return {
    // State
    completedMapIds,
    progressStats,
    stats,

    // Loading states
    isLoading,
    isMarkingComplete,

    // Error states  
    error,
    markCompleteError,
    hasError: stats.hasError,
    errorMessage: stats.errorMessage,

    // Actions
    fetchCompletedMaps,
    markMapCompleted,
    refreshCompletedMaps,
    ensureCompletedMapsLoaded,

    // Helpers
    isMapCompleted,
    getCategoryProgress,
    handleVictoryProgress,
  };
}