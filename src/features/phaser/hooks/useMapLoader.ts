/**
 * Hook for Map Loading with Phaser Integration
 * Combines map data management with Phaser communication
 */

import { useCallback, useState } from "react";
import { useMapData } from "./useMapData";
import { MapType, MapResult } from "../types/map";
import { PhaserMessage } from "../types/phaser";

export function useMapLoader(
  sendMessageFn?: (message: PhaserMessage) => Promise<void>
) {
  const {
    currentMap,
    lessonMaps,
    isLoading,
    fetchLessonMapsData,
    ensureMapLoaded,
    getLessonMapsByType,
  } = useMapData();

  const [loadingMapKey, setLoadingMapKey] = useState<string | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  // Load map vào Phaser - SIMPLIFIED VERSION
  const loadMapInPhaser = useCallback(
    async (mapKey: string): Promise<boolean> => {
      if (!sendMessageFn) {
        console.error("❌ No sendMessage function provided");
        setMapLoadError("No sendMessage function provided");
        return false;
      }

      try {
        setLoadingMapKey(mapKey);
        setMapLoadError(null);

        const message: PhaserMessage = {
          source: "parent-website",
          type: "START_MAP",
          data: { mapKey },
        };
        await sendMessageFn(message);
        return true;
      } catch (error: any) {
        const errorMessage = error?.message || `Lỗi khi load map ${mapKey}`;
        setMapLoadError(errorMessage);
        console.error("Load map error:", errorMessage);
        return false;
      } finally {
        setLoadingMapKey(null);
      }
    },
    [sendMessageFn]
  );

  // Load map data từ backend và load vào Phaser
  const loadMap = useCallback(
    async (mapKey: string): Promise<MapResult | null> => {
      try {
        setMapLoadError(null);

        // Ensure map data is loaded from backend
        const mapData = await ensureMapLoaded(mapKey);

        // Load map into Phaser
        const phaserSuccess = await loadMapInPhaser(mapKey);

        if (!phaserSuccess) {
          throw new Error("Không thể load map vào Phaser");
        }

        return mapData;
      } catch (error: any) {
        const errorMessage = error?.message || `Lỗi khi load map ${mapKey}`;
        setMapLoadError(errorMessage);
        console.error("Load map error:", errorMessage);
        return null;
      }
    },
    [ensureMapLoaded, loadMapInPhaser]
  );

  // Load lesson map theo type và index
  const loadLessonMap = useCallback(
    async (mapType: MapType, index: number = 0): Promise<MapResult | null> => {
      try {
        // Fetch lesson maps nếu chưa có
        if (!lessonMaps) {
          await fetchLessonMapsData();
        }

        const mapsOfType = getLessonMapsByType(mapType);
        if (!mapsOfType || mapsOfType.length === 0) {
          throw new Error(`Không tìm thấy lesson map cho type ${mapType}`);
        }

        if (index >= mapsOfType.length) {
          throw new Error(
            `Index ${index} vượt quá số lượng maps (${mapsOfType.length}) cho type ${mapType}`
          );
        }

        const mapToLoad = mapsOfType[index];
        return await loadMap(mapToLoad.key);
      } catch (error: any) {
        const errorMessage =
          error?.message || `Lỗi khi load lesson map type ${mapType}`;
        setMapLoadError(errorMessage);
        console.error("Load lesson map error:", errorMessage);
        return null;
      }
    },
    [lessonMaps, fetchLessonMapsData, getLessonMapsByType, loadMap]
  );

  // Load map tiếp theo trong cùng type
  const loadNextMap = useCallback(async (): Promise<MapResult | null> => {
    try {
      if (!currentMap.mapData) {
        throw new Error("Không có map hiện tại để tìm map tiếp theo");
      }

      const currentMapType = currentMap.mapData.type;
      const mapsOfType = getLessonMapsByType(currentMapType);

      if (!mapsOfType || mapsOfType.length === 0) {
        throw new Error("Không tìm thấy maps cho type hiện tại");
      }

      // Tìm index hiện tại trong array
      const currentArrayIndex = mapsOfType.findIndex(
        (map) => map.key === currentMap.mapKey
      );

      if (currentArrayIndex === -1) {
        throw new Error("Không tìm thấy map hiện tại trong danh sách");
      }

      const nextArrayIndex = currentArrayIndex + 1;
      if (nextArrayIndex >= mapsOfType.length) {
        throw new Error("Đây là map cuối cùng trong level này");
      }

      const nextMap = mapsOfType[nextArrayIndex];
      return await loadMap(nextMap.key);
    } catch (error: any) {
      const errorMessage = error?.message || "Lỗi khi load map tiếp theo";
      setMapLoadError(errorMessage);
      console.error("Load next map error:", errorMessage);
      return null;
    }
  }, [currentMap, getLessonMapsByType, loadMap]);

  // Load map trước đó trong cùng type
  const loadPreviousMap = useCallback(async (): Promise<MapResult | null> => {
    try {
      if (!currentMap.mapData) {
        throw new Error("Không có map hiện tại để tìm map trước đó");
      }

      const currentMapType = currentMap.mapData.type;
      const mapsOfType = getLessonMapsByType(currentMapType);

      if (!mapsOfType || mapsOfType.length === 0) {
        throw new Error("Không tìm thấy maps cho type hiện tại");
      }

      // Tìm index hiện tại trong array
      const currentArrayIndex = mapsOfType.findIndex(
        (map) => map.key === currentMap.mapKey
      );

      if (currentArrayIndex === -1) {
        throw new Error("Không tìm thấy map hiện tại trong danh sách");
      }

      const previousArrayIndex = currentArrayIndex - 1;
      if (previousArrayIndex < 0) {
        throw new Error("Đây là map đầu tiên trong level này");
      }

      const previousMap = mapsOfType[previousArrayIndex];
      return await loadMap(previousMap.key);
    } catch (error: any) {
      const errorMessage = error?.message || "Lỗi khi load map trước đó";
      setMapLoadError(errorMessage);
      console.error("Load previous map error:", errorMessage);
      return null;
    }
  }, [currentMap, getLessonMapsByType, loadMap]);

  // Clear error
  const clearMapLoadError = useCallback(() => {
    setMapLoadError(null);
  }, []);

  // Get navigation info
  const getMapNavigationInfo = useCallback(() => {
    if (!currentMap.mapData || !lessonMaps) {
      return {
        hasNext: false,
        hasPrevious: false,
        currentIndex: 0,
        totalMaps: 0,
        mapType: null,
      };
    }

    const mapType = currentMap.mapData.type;
    const mapsOfType = getLessonMapsByType(mapType);
    const currentArrayIndex = mapsOfType.findIndex(
      (map) => map.key === currentMap.mapKey
    );

    return {
      hasNext: currentArrayIndex < mapsOfType.length - 1,
      hasPrevious: currentArrayIndex > 0,
      currentIndex: currentArrayIndex + 1, // 1-based index
      totalMaps: mapsOfType.length,
      mapType,
    };
  }, [currentMap, lessonMaps, getLessonMapsByType]);

  // DISABLED: Auto-load removed - user should manually select maps
  // useEffect(() => {
  //   if (!currentMap.mapKey && lessonMaps && !isLoading && sendMessageFn) {
  //     const basicMaps = getLessonMapsByType(MapType.BASIC);
  //     if (basicMaps && basicMaps.length > 0) {
  //       loadMap(basicMaps[0].key);
  //     }
  //   }
  // }, [
  //   currentMap.mapKey,
  //   lessonMaps,
  //   isLoading,
  //   sendMessageFn,
  //   getLessonMapsByType,
  //   loadMap,
  // ]);

  return {
    // State
    currentMap,
    loadingMapKey,
    mapLoadError,
    isLoadingMap: Boolean(loadingMapKey),

    // Actions
    loadMap,
    loadLessonMap,
    loadNextMap,
    loadPreviousMap,
    loadMapInPhaser,
    clearMapLoadError,

    // Navigation info
    getMapNavigationInfo,

    // Conditions
    canLoadMap: Boolean(sendMessageFn && !isLoading),
  };
}
