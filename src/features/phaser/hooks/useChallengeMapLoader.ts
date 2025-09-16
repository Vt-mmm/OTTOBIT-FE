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
  logChallengeJson,
  formatDataForPhaser,
  processAndCreatePhaserMessage
} from "../converters";

export function useChallengeMapLoader(
  sendMessageFn?: (message: PhaserMessage) => Promise<void>
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
      // Debug: Log function entry
      console.log('🎆 LOAD MAP IN PHASER STARTED:', {
        timestamp: new Date().toISOString(),
        challengeId,
        hasMapJson: !!mapJson,
        hasChallengeData: !!challengeData,
        mapJsonType: typeof mapJson,
        challengeDataType: typeof challengeData,
        hasSendMessageFn: !!sendMessageFn
      });
      
      if (!sendMessageFn) {
        console.error("❌ No sendMessage function provided");
        setMapLoadError("No sendMessage function provided");
        return false;
      }

      try {
        setLoadingChallengeId(challengeId);
        setMapLoadError(null);

        // Use provided mapJson or get from challenge
        const mapData = mapJson || getMapJsonFromChallenge(challengeId);
        
        if (!mapData) {
          throw new Error(`No map data found for challenge ${challengeId}`);
        }

        // Debug: Log the exact map data being sent to Phaser
        console.log('📤 DEBUG: Map JSON being sent to Phaser:', {
          mapKey: challengeId,
          mapDataType: typeof mapData,
          mapDataKeys: Object.keys(mapData),
          hasLayers: !!mapData.layers,
          layersCount: mapData.layers?.length || 0,
          layerNames: mapData.layers?.map((l: any) => l.name) || [],
          orientation: mapData.orientation,
          tilewidth: mapData.tilewidth,
          tileheight: mapData.tileheight,
          // Log first 500 chars of JSON to see structure
          mapJsonPreview: JSON.stringify(mapData).substring(0, 500)
        });
        
        // Debug: Log complete mapJson structure (first 1000 characters)
        console.log('🗺️ COMPLETE MAP JSON STRUCTURE:', {
          fullMapJson: mapData,
          mapJsonString: JSON.stringify(mapData, null, 2).substring(0, 1000) + '...',
          mapJsonSize: JSON.stringify(mapData).length
        });

        // Extract challengeJson from challengeData - Parse from string field
        let challengeJson = {};
        
        if (challengeData?.challengeJson) {
          try {
            console.log('🔄 Parsing challengeJson from string:', {
              rawChallengeJson: challengeData.challengeJson,
              challengeJsonType: typeof challengeData.challengeJson,
              challengeJsonLength: challengeData.challengeJson.length
            });
            
            challengeJson = JSON.parse(challengeData.challengeJson);
            
            console.log('✅ Challenge JSON parsed successfully:', {
              parsedChallengeJson: challengeJson,
              parsedType: typeof challengeJson,
              parsedKeys: Object.keys(challengeJson)
            });
            
          } catch (error: any) {
            console.error('❌ Failed to parse challengeJson string:', {
              error: error?.message || 'Unknown error',
              rawChallengeJson: challengeData.challengeJson,
              challengeId
            });
            
            // Fallback to converter utility if string parsing fails
            console.log('🔄 Falling back to converter utility...');
            challengeJson = convertChallengeToJson(challengeData);
          }
        } else {
          console.warn('⚠️ No challengeJson string found, using converter utility...');
          challengeJson = challengeData ? convertChallengeToJson(challengeData) : {};
        }
        
        // Validate challengeJson structure
        if (challengeJson && !validateChallengeJson(challengeJson)) {
          console.warn('⚠️ Challenge JSON validation failed, but continuing with best effort');
        }
        
        // Debug: Log complete challengeJson structure BEFORE logChallengeJson
        console.log('🏆 COMPLETE CHALLENGE JSON STRUCTURE (BEFORE LOG):', {
          fullChallengeJson: challengeJson,
          challengeJsonString: JSON.stringify(challengeJson, null, 2),
          challengeJsonSize: JSON.stringify(challengeJson).length,
          challengeJsonType: typeof challengeJson,
          challengeJsonKeys: challengeJson ? Object.keys(challengeJson) : 'N/A',
          hasRobot: !!(challengeJson as any)?.robot,
          hasBatteries: !!(challengeJson as any)?.batteries,
          hasVictory: !!(challengeJson as any)?.victory,
          hasStatement: !!(challengeJson as any)?.statement,
          challengeDataOriginal: {
            id: challengeData?.id,
            title: challengeData?.title,
            hasChallengeJsonString: !!challengeData?.challengeJson,
            challengeJsonStringLength: challengeData?.challengeJson?.length || 0
          }
        });
        
        // Log the structure for debugging
        logChallengeJson(challengeJson, challengeId);
        
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
        
        // Debug: Log the complete postMessage structure in detail
        console.log('📤 DEBUG: Complete message to Phaser:', JSON.stringify(message, null, 2));
        
        // Debug: Log message breakdown for easy analysis
        console.log('🔍 POSTMESSAGE BREAKDOWN:', {
          messageType: message.type,
          messageSource: message.source,
          hasMapJson: !!message.data.mapJson,
          hasChallengeJson: !!message.data.challengeJson,
          mapJsonType: typeof message.data.mapJson,
          challengeJsonType: typeof message.data.challengeJson,
          messageSize: JSON.stringify(message).length,
          mapJsonKeys: message.data.mapJson ? Object.keys(message.data.mapJson) : [],
          challengeJsonKeys: message.data.challengeJson ? Object.keys(message.data.challengeJson) : [],
          mapJsonStructure: message.data.mapJson ? {
            width: message.data.mapJson.width,
            height: message.data.mapJson.height,
            orientation: message.data.mapJson.orientation,
            tilewidth: message.data.mapJson.tilewidth,
            tileheight: message.data.mapJson.tileheight,
            layersCount: message.data.mapJson.layers?.length || 0,
            tilesetsCount: message.data.mapJson.tilesets?.length || 0,
            layerDetails: message.data.mapJson.layers?.map((layer: any) => ({
              name: layer.name,
              type: layer.type,
              width: layer.width,
              height: layer.height,
              hasData: !!layer.data,
              dataLength: Array.isArray(layer.data) ? layer.data.length : 0
            })) || []
          } : null,
          challengeJsonStructure: message.data.challengeJson ? {
            robotKeys: Object.keys(message.data.challengeJson.robot || {}),
            batteriesCount: message.data.challengeJson.batteries?.length || 0,
            boxesCount: message.data.challengeJson.boxes?.length || 0,
            victoryKeys: Object.keys(message.data.challengeJson.victory || {}),
            statementsCount: message.data.challengeJson.statement?.length || 0,
            statementNumber: message.data.challengeJson.statementNumber,
            robotData: message.data.challengeJson.robot,
            batteriesData: message.data.challengeJson.batteries,
            boxesData: message.data.challengeJson.boxes,
            victoryData: message.data.challengeJson.victory,
            statementsData: message.data.challengeJson.statement
          } : null
        });
        
        // Debug: Log the exact JSON strings that will be sent (after formatting fixes)
        console.log('📜 EXACT JSON STRINGS TO SEND (AFTER FORMATTING):');
        console.log('Fixed Map JSON String:', JSON.stringify(message.data.mapJson, null, 2));
        console.log('Fixed Challenge JSON String:', JSON.stringify(message.data.challengeJson, null, 2));
        
        // Debug: Log comparison between original and fixed data
        console.log('🔄 BEFORE/AFTER COMPARISON:', {
          originalMapLayerNames: mapData?.layers?.map((l: any) => l.name) || [],
          fixedMapLayerNames: message.data.mapJson?.layers?.map((l: any) => l.name) || [],
          originalVictoryDescription: (challengeJson as any)?.victory?.description || 'N/A',
          fixedVictoryDescription: message.data.challengeJson?.victory?.description || 'N/A'
        });
        
        // Debug: Log before sending postMessage
        console.log('🚀 SENDING POSTMESSAGE TO PHASER:', {
          timestamp: new Date().toISOString(),
          challengeId,
          messageType: message.type,
          messageSource: message.source,
          totalMessageSize: JSON.stringify(message).length,
          sendMessageFn: typeof sendMessageFn
        });
        
        await sendMessageFn(message);
        
        // Debug: Log after sending postMessage
        console.log('✅ POSTMESSAGE SENT SUCCESSFULLY:', {
          timestamp: new Date().toISOString(),
          challengeId,
          messageType: message.type,
          status: 'sent'
        });
        
        return true;
      } catch (error: any) {
        const errorMessage = error?.message || `Lỗi khi load map từ challenge ${challengeId}`;
        setMapLoadError(errorMessage);
        
        // Debug: Log detailed error information
        console.error('❌ LOAD MAP IN PHASER ERROR:', {
          timestamp: new Date().toISOString(),
          challengeId,
          error: errorMessage,
          errorStack: error?.stack,
          errorType: error?.name,
          fullError: error
        });
        
        console.error("Load challenge map error:", errorMessage);
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
        
        // Debug: Log comprehensive function start
        console.log('🚀 LOAD CHALLENGE MAP FUNCTION STARTED:', {
          timestamp: new Date().toISOString(),
          challengeId,
          functionName: 'loadChallengeMap',
          hasEnsureChallengeLoaded: !!ensureChallengeLoaded,
          hasLoadMapInPhaser: !!loadMapInPhaser,
          hasGetMapJsonFromChallenge: !!getMapJsonFromChallenge,
          hasGetSafeMapData: !!getSafeMapData
        });
        
        console.log('🔍 Starting challenge load for ID:', challengeId);

        // Ensure challenge data is loaded
        const challengeData = await ensureChallengeLoaded(challengeId);
        
        if (!challengeData) {
          console.error('❌ Challenge data not found for ID:', challengeId);
          throw new Error(`Challenge ${challengeId} not found`);
        }

        console.log('✅ Challenge data loaded:', {
          id: challengeData.id,
          title: challengeData.title,
          hasMapJson: !!challengeData.mapJson,
          mapJsonLength: challengeData.mapJson?.length || 0,
          mapJsonSample: challengeData.mapJson?.substring(0, 100) || 'N/A'
        });

        // Get parsed map JSON using safe parsing - use challengeData directly
        let mapJson = getMapJsonFromChallenge(challengeId) || 
          (challengeData.mapJson ? getSafeMapData(challengeData.mapJson) : null);
          
        if (!mapJson) {
          console.error('❌ Failed to parse map JSON:', {
            challengeId,
            rawMapJson: challengeData.mapJson?.substring(0, 200) || 'N/A',
            mapJsonType: typeof challengeData.mapJson,
            hasRawMapJson: !!challengeData.mapJson
          });
          throw new Error(`Invalid or missing map JSON in challenge ${challengeId}`);
        }

        console.log('✅ Map JSON parsed successfully:', {
          width: mapJson.width,
          height: mapJson.height,
          hasLayers: !!mapJson.layers,
          layersCount: mapJson.layers?.length || 0,
          layers: mapJson.layers?.map((layer: any) => ({
            name: layer.name,
            type: layer.type,
            id: layer.id,
            visible: layer.visible,
            hasData: !!layer.data,
            dataLength: Array.isArray(layer.data) ? layer.data.length : 0
          })) || [],
          tilesets: mapJson.tilesets?.map((tileset: any) => ({
            name: tileset.name,
            firstgid: tileset.firstgid,
            source: tileset.source
          })) || []
        });
        
        // Log raw layers data for debugging
        console.log('📜 Raw layers data:');
        mapJson.layers?.forEach((layer: any, index: number) => {
          console.log(`Layer ${index}:`, {
            name: layer.name,
            type: layer.type,
            id: layer.id,
            visible: layer.visible,
            opacity: layer.opacity,
            width: layer.width,
            height: layer.height,
            hasData: !!layer.data,
            dataPreview: Array.isArray(layer.data) ? layer.data.slice(0, 10) : 'N/A',
            properties: layer.properties,
            rawLayer: layer
          });
        });
        
        // Log raw tilesets data
        console.log('🎨 Raw tilesets data:');
        mapJson.tilesets?.forEach((tileset: any, index: number) => {
          console.log(`Tileset ${index}:`, tileset);
        });
        
        // TEMPORARY: Skip conversion to test original backend JSON
        console.log('🚫 TESTING: Using original backend JSON without conversion');
        console.log('🔄 Converting backend map to Phaser format...');
        console.log('📍 Original backend map for testing:', {
          orientation: mapJson.orientation,
          tilewidth: mapJson.tilewidth,
          tileheight: mapJson.tileheight,
          layerNames: mapJson.layers?.map((l: any) => l.name)
        });
        
        // SKIP CONVERSION - Test original backend JSON
        console.log('⚠️ Using original backend JSON without any conversion');
        
        // const conversionResult = convertBackendMapToPhaser(mapJson);
        
        // if (!conversionResult.success || !conversionResult.phaserMap) {
        //   const errorMsg = conversionResult.error || 'Unknown conversion error';
        //   console.error('❌ Map conversion failed:', errorMsg);
        //   throw new Error(`Map conversion failed: ${errorMsg}`);
        // }
        
        // // Validate converted Phaser map
        // if (!validatePhaserMap(conversionResult.phaserMap)) {
        //   throw new Error('Converted map failed Phaser validation');
        // }
        
        // // Use converted map
        // mapJson = conversionResult.phaserMap;
        
        console.log('✅ Converted map JSON to be sent to Phaser:', {
          layers: mapJson.layers?.map((l: any) => ({ name: l.name, type: l.type })),
          tilesets: mapJson.tilesets?.map((t: any) => ({ 
            name: t.name, 
            firstgid: t.firstgid,
            image: t.image,
            imagewidth: t.imagewidth,
            imageheight: t.imageheight
          }))
        });
        
        // Final validation
        const hasValidLayers = mapJson.layers && mapJson.layers.length > 0;
        const hasValidTilesets = mapJson.tilesets && mapJson.tilesets.length > 0;
        
        if (!hasValidLayers) {
          throw new Error('Map has no valid layers after processing');
        }
        
        if (!hasValidTilesets) {
          console.warn('⚠️ Map has no tilesets - this may cause rendering issues');
        }
        
        console.log('✅ Final map validation passed:', {
          layersCount: mapJson.layers?.length,
          tilesetsCount: mapJson.tilesets?.length,
          mapDimensions: `${mapJson.width}x${mapJson.height}`
        });

        // Load both map and challenge into Phaser
        const phaserSuccess = await loadMapInPhaser(challengeId, mapJson, challengeData);

        if (!phaserSuccess) {
          console.error('❌ Failed to load map and challenge into Phaser');
          throw new Error("Không thể load map và challenge vào Phaser");
        }

        console.log('🎉 Challenge loaded successfully into Phaser');
        return challengeData;
      } catch (error: any) {
        const errorMessage = error?.message || `Lỗi khi load challenge ${challengeId}`;
        setMapLoadError(errorMessage);
        console.error('❌ Load challenge map error:', {
          challengeId,
          error: errorMessage,
          stack: error?.stack
        });
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
        console.error("Load challenge by difficulty error:", errorMessage);
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