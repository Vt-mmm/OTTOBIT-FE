/**
 * Hook for Challenge Map Loading with Phaser Integration
 * Uses challenge data for map loading into Phaser
 */

import { useCallback, useState } from "react";
import { useChallengeData } from "./useChallengeData";
import { ChallengeResult } from "../../../common/@types/challenge";
import { PhaserMessage } from "../types/phaser";
import {
  getSafeMapData,
  convertChallengeToJson,
  validateChallengeJson,
  formatDataForPhaser
} from "../converters";

export function useChallengeMapLoader(
  sendMessageFn?: (message: PhaserMessage) => Promise<void>,
  clearErrorFn?: () => void
) {
  const {
    currentChallenge,
    isLoading,
    ensureChallengeLoaded,
    getMapJsonFromChallenge,
  } = useChallengeData();
  
  // Direct import from converters - no hooks needed

  const [loadingChallengeId, setLoadingChallengeId] = useState<string | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  // Load map JSON and challenge data into Phaser
  const loadMapInPhaser = useCallback(
    async (challengeId: string, mapJson?: any, challengeData?: any): Promise<boolean> => {
      
      if (!sendMessageFn) {
        setMapLoadError("No sendMessage function provided");
        return false;
      }

      try {
        setLoadingChallengeId(challengeId);
        setMapLoadError(null);

        // Use provided mapJson or get from challenge
        // Get map data from challenge if not provided
        const mapData = mapJson || getMapJsonFromChallenge(challengeId);
        
        if (!mapData) {
          throw new Error(`No map data found for challenge ${challengeId}`);
        }


        // Extract challengeJson from challengeData - Handle both string and object cases
        let challengeJson = {};
        
        if (challengeData?.challengeJson) {
          // Check if it's already an object or a string
          if (typeof challengeData.challengeJson === 'string') {
            try {
              challengeJson = JSON.parse(challengeData.challengeJson);
            } catch (error: any) {
              challengeJson = convertChallengeToJson(challengeData);
            }
          } else if (typeof challengeData.challengeJson === 'object') {
            // Already an object, use directly
            challengeJson = challengeData.challengeJson;
          } else {
            challengeJson = convertChallengeToJson(challengeData);
          }
        } else {
          challengeJson = challengeData ? convertChallengeToJson(challengeData) : {};
        }
        
        // 🏠 DO NOT CONVERT - Keep backend format as-is for Phaser
        if (challengeJson && typeof challengeJson === 'object') {
          const cj = challengeJson as any;
          
          // Check if it's backend format (robot.tile.x) - this is what we want!
          if (cj.robot?.tile?.x !== undefined && cj.robot?.tile?.y !== undefined) {
            // Already in correct backend format, keep as-is
          } 
          // If it's already converted (flat format), convert it back
          else if (cj.robot?.x !== undefined && cj.robot?.y !== undefined) {
            // We need to convert it BACK to backend format for Phaser!
            
            // Convert robot back: robot.{x,y} → robot.tile.{x,y}
            const backendRobot = {
              tile: { x: cj.robot.x, y: cj.robot.y },
              direction: cj.robot.direction
            };
            cj.robot = backendRobot;
            
            // Convert batteries back: flat array → batteries[].tiles[]
            if (Array.isArray(cj.batteries)) {
              // Group batteries by type or just put all in one group
              const batteryGroups: any[] = [];
              const batteryTiles: any[] = [];
              
              cj.batteries.forEach((battery: any) => {
                batteryTiles.push({
                  x: battery.x,
                  y: battery.y,
                  count: battery.count || battery.value || 1,
                  type: battery.type || battery.color || 'green',
                  spread: battery.spread || 1,
                  allowedCollect: battery.allowedCollect !== undefined ? battery.allowedCollect : true
                });
              });
              
              if (batteryTiles.length > 0) {
                batteryGroups.push({ tiles: batteryTiles });
              }
              
              cj.batteries = batteryGroups;
            }
          }
        }
        
        // Validate challengeJson structure
        if (challengeJson) {
          validateChallengeJson(challengeJson);
        }
        
        // Apply data formatting fixes before sending to Phaser
        const { fixedMapJson, fixedChallengeJson } = formatDataForPhaser(mapData, challengeJson);

        const message: PhaserMessage = {
          source: "parent-website",
          type: "START_MAP",
          data: { 
            mapJson: fixedMapJson,
            challengeJson: fixedChallengeJson
          },
        };
        
        try {
          await sendMessageFn(message);
          
          // Clear Phaser errors after successful message send
          if (clearErrorFn) {
            clearErrorFn();
          }
        } catch (error) {
          // Fallback: Try direct postMessage
          const iframe = document.getElementById('robot-game-iframe') as HTMLIFrameElement;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(message, '*');
            
            // Clear errors after successful direct postMessage too
            if (clearErrorFn) {
              clearErrorFn();
            }
          } else {
            throw error;
          }
        }
        
        return true;
      } catch (error: any) {
        const errorMessage = error?.message || `Lỗi khi load map từ challenge ${challengeId}`;
        setMapLoadError(errorMessage);
        return false;
      } finally {
        setLoadingChallengeId(null);
      }
    },
    [sendMessageFn, getMapJsonFromChallenge]
  );

  // Load challenge data and load map into Phaser
  const loadChallengeMap = useCallback(
    async (challengeId: string): Promise<ChallengeResult | null> => {
      try {
        setMapLoadError(null);

        // Ensure challenge data is loaded
        const challengeData = await ensureChallengeLoaded(challengeId);
        
        if (!challengeData) {
          throw new Error(`Challenge ${challengeId} not found`);
        }

        // Get parsed map JSON using safe parsing - use challengeData directly
        let mapJson = getMapJsonFromChallenge(challengeId);
        
        if (!mapJson && challengeData.mapJson) {
          mapJson = getSafeMapData(challengeData.mapJson);
        }
          
        if (!mapJson) {
          throw new Error(`Invalid or missing map JSON in challenge ${challengeId}`);
        }

        // Map JSON parsed successfully
        
        // const conversionResult = convertBackendMapToPhaser(mapJson);
        
        // if (!conversionResult.success || !conversionResult.phaserMap) {
        //   const errorMsg = conversionResult.error || 'Unknown conversion error';
        //   throw new Error(`Map conversion failed: ${errorMsg}`);
        // }
        
        // // Validate converted Phaser map
        // if (!validatePhaserMap(conversionResult.phaserMap)) {
        //   throw new Error('Converted map failed Phaser validation');
        // }
        
        // // Use converted map
        // mapJson = conversionResult.phaserMap;
        
        // Map JSON prepared for Phaser
        
        // Final validation
        const hasValidLayers = mapJson.layers && mapJson.layers.length > 0;
        const hasValidTilesets = mapJson.tilesets && mapJson.tilesets.length > 0;
        
        if (!hasValidLayers) {
          throw new Error('Map has no valid layers after processing');
        }
        
        if (!hasValidTilesets) {
          // Map has no tilesets - may cause rendering issues
        }
        
        // Final map validation passed

        // Load both map and challenge into Phaser
        const phaserSuccess = await loadMapInPhaser(challengeId, mapJson, challengeData);

        if (!phaserSuccess) {
          throw new Error("Không thể load map và challenge vào Phaser");
        }

        return challengeData;
      } catch (error: any) {
        const errorMessage = error?.message || `Lỗi khi load challenge ${challengeId}`;
        setMapLoadError(errorMessage);
        // Load challenge map error
        return null;
      }
    },
    [ensureChallengeLoaded, loadMapInPhaser, getMapJsonFromChallenge]
  );

  // Load challenge by difficulty level  
  const loadChallengeByDifficulty = useCallback(
    async (difficulty: number, _index: number = 0): Promise<ChallengeResult | null> => {
      try {
        // This would require fetching challenges first
        // For now, we'll just return an error
        throw new Error("Load by difficulty not implemented yet. Please load by specific challenge ID.");
      } catch (error: any) {
        const errorMessage = error?.message || `Lỗi khi load challenge difficulty ${difficulty}`;
        setMapLoadError(errorMessage);
        // Load challenge by difficulty error
        return null;
      }
    },
    []
  );

  // Clear error
  const clearMapLoadError = useCallback(() => {
    setMapLoadError(null);
  }, []);

  // Get challenge navigation info (if we have multiple challenges loaded)
  const getChallengeNavigationInfo = useCallback(() => {
    if (!currentChallenge) {
      return {
        hasNext: false,
        hasPrevious: false,
        currentIndex: 0,
        totalChallenges: 0,
        difficulty: null,
      };
    }

    // For now, just return basic info
    // This could be extended to track challenge sequences
    return {
      hasNext: false, // Would need to implement challenge sequencing
      hasPrevious: false,
      currentIndex: 1,
      totalChallenges: 1,
      difficulty: currentChallenge.difficulty,
    };
  }, [currentChallenge]);

  return {
    // State
    currentChallenge,
    loadingChallengeId,
    mapLoadError,
    isLoadingChallenge: Boolean(loadingChallengeId),

    // Actions
    loadChallengeMap,
    loadChallengeByDifficulty,
    loadMapInPhaser,
    clearMapLoadError,

    // Navigation info
    getChallengeNavigationInfo,

    // Conditions
    canLoadChallenge: Boolean(sendMessageFn && !isLoading),
  };
}