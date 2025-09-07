/**
 * Hook for Map Data management
 * Provides map data from backend via Redux
 */

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import {
  fetchAllMaps,
  fetchLessonMaps,
  clearLessonMapsCache,
  refreshLessonMaps,
  setCurrentMap,
  clearCurrentMap,
  clearMapErrors,
  resetMapState,
  setMapData,
} from "../../../redux/map/mapSlice";
import { MapsQuery, MapType, MapResult, MapApiCallOptions } from "../types/map";

export function useMapData() {
  const dispatch = useAppDispatch();
  const mapState = useAppSelector((state) => state.map);

  // Selectors với memoization
  const allMaps = useMemo(() => mapState.allMaps, [mapState.allMaps]);
  const lessonMaps = useMemo(() => mapState.lessonMaps, [mapState.lessonMaps]);
  const currentMap = useMemo(() => mapState.currentMap, [mapState.currentMap]);
  const cacheState = useMemo(() => mapState.cache, [mapState.cache]);

  // Loading states
  const isLoadingAllMaps = useMemo(
    () => allMaps.isLoading,
    [allMaps.isLoading]
  );
  const isLoadingLessonMaps = useMemo(
    () => lessonMaps.isLoading,
    [lessonMaps.isLoading]
  );
  const isLoading = useMemo(
    () => isLoadingAllMaps || isLoadingLessonMaps || cacheState.isClearing,
    [isLoadingAllMaps, isLoadingLessonMaps, cacheState.isClearing]
  );

  // Error states
  const hasError = useMemo(
    () => Boolean(allMaps.error || lessonMaps.error),
    [allMaps.error, lessonMaps.error]
  );

  // Actions
  const fetchAllMapsData = useCallback(
    (query: MapsQuery & MapApiCallOptions = {}) => {
      return dispatch(fetchAllMaps(query));
    },
    [dispatch]
  );

  const fetchLessonMapsData = useCallback(
    (options: MapApiCallOptions = {}) => {
      return dispatch(fetchLessonMaps(options));
    },
    [dispatch]
  );

  const clearCache = useCallback(() => {
    return dispatch(clearLessonMapsCache());
  }, [dispatch]);

  const refreshLessonMapsData = useCallback(() => {
    return dispatch(refreshLessonMaps());
  }, [dispatch]);

  const setCurrentMapData = useCallback(
    (mapKey: string, mapData?: MapResult) => {
      dispatch(setCurrentMap({ mapKey, mapData }));
    },
    [dispatch]
  );

  const clearCurrentMapData = useCallback(() => {
    dispatch(clearCurrentMap());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearMapErrors());
  }, [dispatch]);

  const resetMaps = useCallback(() => {
    dispatch(resetMapState());
  }, [dispatch]);

  const updateMapData = useCallback(
    (mapKey: string, mapData: MapResult) => {
      dispatch(setMapData({ mapKey, mapData }));
    },
    [dispatch]
  );

  // Helper functions
  const getMapsByType = useCallback(
    (mapType: MapType) => {
      if (!allMaps.data?.items) return [];
      return allMaps.data.items.filter((map) => map.type === mapType);
    },
    [allMaps.data]
  );

  const getLessonMapsByType = useCallback(
    (mapType: MapType) => {
      if (!lessonMaps.data?.mapsByType) return [];

      // Map từ MapType enum sang string key từ backend
      const typeKeyMap = {
        [MapType.BASIC]: "Basics",
        [MapType.INTERMEDIATE]: "Boolean",
        [MapType.ADVANCED]: "Variables",
        [MapType.CHALLENGE]: "ForLoops",
      };

      const typeKey = typeKeyMap[mapType];
      return lessonMaps.data.mapsByType[typeKey] || [];
    },
    [lessonMaps.data]
  );

  const findMapByKey = useCallback(
    (mapKey: string): MapResult | null => {
      // Check current map first
      if (currentMap.mapKey === mapKey && currentMap.mapData) {
        return currentMap.mapData;
      }

      // Check all maps
      if (allMaps.data?.items) {
        const found = allMaps.data.items.find((map) => map.key === mapKey);
        if (found) return found;
      }

      // Check lesson maps
      if (lessonMaps.data?.mapsByType) {
        for (const typeKey in lessonMaps.data.mapsByType) {
          const maps = lessonMaps.data.mapsByType[typeKey];
          const found = maps?.find((map) => map.key === mapKey);
          if (found) return found;
        }
      }

      return null;
    },
    [currentMap, allMaps.data, lessonMaps.data]
  );

  const getMapCategories = useCallback(() => {
    const categories = new Set<string>();

    if (allMaps.data?.items) {
      allMaps.data.items.forEach((map) => {
        categories.add(map.mapCategoryName);
      });
    }

    if (lessonMaps.data?.mapsByType) {
      Object.values(lessonMaps.data.mapsByType).forEach((maps) => {
        maps?.forEach((map: MapResult) => {
          categories.add(map.mapCategoryName);
        });
      });
    }

    return Array.from(categories);
  }, [allMaps.data, lessonMaps.data]);

  const getTotalMapsCount = useCallback(() => {
    return allMaps.data?.totalCount || 0;
  }, [allMaps.data]);

  const hasNextPage = useCallback(() => {
    return allMaps.data?.hasNextPage || false;
  }, [allMaps.data]);

  const hasPreviousPage = useCallback(() => {
    return allMaps.data?.hasPreviousPage || false;
  }, [allMaps.data]);

  const getCurrentPage = useCallback(() => {
    return allMaps.data?.currentPage || 1;
  }, [allMaps.data]);

  const getTotalPages = useCallback(() => {
    return allMaps.data?.totalPages || 0;
  }, [allMaps.data]);

  const isMapCacheStale = useCallback(
    (maxAge: number = 5 * 60 * 1000) => {
      // 5 minutes default
      if (!lessonMaps.lastFetched) return true;
      return Date.now() - lessonMaps.lastFetched > maxAge;
    },
    [lessonMaps.lastFetched]
  );

  // Auto-refresh logic
  const shouldAutoRefresh = useCallback(() => {
    return isMapCacheStale() && !isLoading && !hasError;
  }, [isMapCacheStale, isLoading, hasError]);

  // Utility để load map nếu chưa có
  const ensureMapLoaded = useCallback(
    async (mapKey: string) => {
      const existingMap = findMapByKey(mapKey);
      if (existingMap) {
        setCurrentMapData(mapKey, existingMap);
        return existingMap;
      }

      // If not found in current data, try to fetch lesson maps first
      if (!lessonMaps.data || isMapCacheStale()) {
        await fetchLessonMapsData();
        const foundMap = findMapByKey(mapKey);
        if (foundMap) {
          setCurrentMapData(mapKey, foundMap);
          return foundMap;
        }
      }

      // If still not found, set current map with key only
      setCurrentMapData(mapKey);
      return null;
    },
    [
      findMapByKey,
      setCurrentMapData,
      lessonMaps.data,
      isMapCacheStale,
      fetchLessonMapsData,
    ]
  );

  return {
    // State
    allMaps: allMaps.data,
    lessonMaps: lessonMaps.data,
    currentMap,
    cacheState,

    // Loading & Error states
    isLoading,
    isLoadingAllMaps,
    isLoadingLessonMaps,
    hasError,
    allMapsError: allMaps.error,
    lessonMapsError: lessonMaps.error,

    // Actions
    fetchAllMapsData,
    fetchLessonMapsData,
    clearCache,
    refreshLessonMapsData,
    setCurrentMapData,
    clearCurrentMapData,
    clearErrors,
    resetMaps,
    updateMapData,

    // Helpers
    getMapsByType,
    getLessonMapsByType,
    findMapByKey,
    getMapCategories,
    getTotalMapsCount,
    hasNextPage,
    hasPreviousPage,
    getCurrentPage,
    getTotalPages,
    isMapCacheStale,
    shouldAutoRefresh,
    ensureMapLoaded,

    // Query info
    lastQuery: allMaps.lastQuery,
    lastFetched: lessonMaps.lastFetched,
    lastCleared: cacheState.lastCleared,
  };
}
