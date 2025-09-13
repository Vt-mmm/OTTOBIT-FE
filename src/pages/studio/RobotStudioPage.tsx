import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../layout/components/header/Header";
import TopBarSection from "sections/studio/TopBarSection";
import LeftPanelSection from "sections/studio/LeftPanelSection";
import SimulatorStageSection from "sections/studio/SimulatorStageSection";
import {
  PhaserProvider,
  usePhaserContext,
  useMapData,
} from "../../features/phaser";
import LevelMapSelector from "../../features/phaser/components/LevelMapSelector";
import {
  LevelData,
  mapKeyToLevelData,
  levelDataToUrl,
  saveCurrentLevel,
  loadCurrentLevel,
  clearSavedLevel,
} from "../../features/phaser/utils/mapUtils";

// Level Selector with Initialization - has access to map data
const LevelSelectorWithInitialization = ({
  onLevelSelect,
  currentLevel,
  initializeLevel,
  isInitialized,
}: {
  onLevelSelect: (level: LevelData) => void;
  currentLevel?: LevelData;
  initializeLevel: (
    mapDataFinder: (key: string) => any,
    urlMapKey?: string
  ) => void;
  isInitialized: boolean;
}) => {
  const { findMapByKey, lessonMaps, fetchLessonMapsData } = useMapData();
  const { mapKey } = useParams<{ mapKey?: string }>();

  // Force fetch lesson maps on mount if not available
  useEffect(() => {
    if (!lessonMaps?.mapsByType) {
      fetchLessonMapsData();
    }
  }, [lessonMaps?.mapsByType, fetchLessonMapsData]);

  // Initialize level when map data becomes available
  useEffect(() => {
    const hasMapData = lessonMaps?.mapsByType;

    if (!isInitialized && findMapByKey && hasMapData) {
      initializeLevel(findMapByKey, mapKey);
    }
  }, [isInitialized, findMapByKey, lessonMaps, initializeLevel, mapKey]);

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f5f5f5",
          pt: { xs: "70px", md: "80px" }, // Account for fixed header height
        }}
      >
        <LevelMapSelector
          onLevelSelect={onLevelSelect}
          currentLevel={currentLevel}
        />
      </Box>
    </>
  );
};

// Studio Content Component - để có thể sử dụng PhaserContext
const StudioContent = ({ selectedLevel }: { selectedLevel: LevelData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loadingMapKey, setLoadingMapKey] = useState<string | null>(null);
  const [loadedMapKey, setLoadedMapKey] = useState<string | null>(null);
  const [showMapLoading, setShowMapLoading] = useState(true);
  const { loadMap, onMessage, offMessage } = usePhaserContext();

  // Reset states when level changes
  useEffect(() => {
    if (selectedLevel?.mapKey && loadedMapKey !== selectedLevel.mapKey) {
      setLoadedMapKey(null);
      setShowMapLoading(true);
    }
  }, [selectedLevel?.mapKey, loadedMapKey]);

  // Reset loading state when component mounts
  useEffect(() => {
    if (selectedLevel?.mapKey) {
      setShowMapLoading(true);
    }
  }, []); // Only run on mount

  // Load map when Phaser is ready and selectedLevel is available
  useEffect(() => {
    if (!selectedLevel?.mapKey) {
      return;
    }

    // Prevent duplicate loading of same map
    if (loadingMapKey === selectedLevel.mapKey) {
      return;
    }

    // Skip if map already loaded
    if (loadedMapKey === selectedLevel.mapKey) {
      return;
    }

    const doLoadMap = () => {
      setLoadingMapKey(selectedLevel.mapKey);
      loadMap(selectedLevel.mapKey)
        .then((result) => {
          if (result) {
            setLoadedMapKey(selectedLevel.mapKey);
            setTimeout(() => {
              setShowMapLoading(false);
            }, 200);
          }
        })
        .catch(() => {
          setShowMapLoading(false);
        })
        .finally(() => {
          setLoadingMapKey(null);
        });
    };

    // Wait for READY message to ensure Phaser is fully initialized
    const handleReady = () => {
      setTimeout(() => {
        doLoadMap();
      }, 100);
      offMessage("READY", handleReady);
    };

    onMessage("READY", handleReady);

    return () => {
      offMessage("READY", handleReady);
    };
  }, [selectedLevel, loadMap, onMessage, offMessage]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        // Mobile-specific adjustments
        "@media (max-width: 900px)": {
          height: "100vh",
          overflow: "hidden", // Prevent page scrolling on mobile
        },
      }}
    >
      {/* Top Bar - Fixed height */}
      <TopBarSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        workspace={workspace}
      />

      {/* Main Content Area - Mobile-First Responsive Layout */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "flex", md: "grid" }, // Flex on mobile, grid on desktop
          flexDirection: { xs: "column", md: "row" }, // Stack on mobile
          gridTemplateColumns: {
            md: "1fr 1fr", // Medium: equal split
            lg: "900px 1fr", // Large: fixed left, flexible right
            xl: "1000px 1fr", // Extra large: wider left panel
          },
          gap: { xs: 1, sm: 1.5, md: 2 },
          p: { xs: 1, sm: 1.5, md: 2 },
          overflow: "hidden",
          minHeight: 0,
          // Mobile-specific styles
          "@media (max-width: 900px)": {
            height: "auto",
            minHeight: "calc(100vh - 60px)", // Account for header
          },
        }}
      >
        {/* Left Panel - Content based on active tab - Mobile Responsive */}
        <Box
          sx={{
            // Mobile: flexible height, desktop: full height
            flex: { xs: "0 0 auto", md: 1 },
            height: { xs: "auto", md: "100%" },
            minHeight: { xs: "200px", md: "auto" },
            maxHeight: { xs: "40vh", md: "none" },
            overflow: { xs: "hidden", md: "visible" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <LeftPanelSection
            activeTab={activeTab}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
          />
        </Box>

        {/* Right Panel - Robot Simulator - Aspect Ratio Friendly */}
        <Box 
          sx={{ 
            position: "relative",
            // Let simulator define its own height based on aspect ratio
            flex: { xs: "0 0 auto", md: 1 }, // Don't flex on mobile, flex on desktop
            width: "100%",
            display: "flex",
            flexDirection: "column",
            // Center the simulator
            alignItems: "center",
            justifyContent: "center",
            // Mobile: allow some padding
            p: { xs: 1, md: 0 },
          }}
        >
          <SimulatorStageSection workspace={workspace} />

          {/* Loading Overlay - Hide menu flash during map load */}
          {showMapLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                zIndex: 1000,
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {/* Loading Animation */}
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    border: "4px solid #e3f2fd",
                    borderTop: "4px solid #1976d2",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />

                {/* Loading Text */}
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "#1976d2",
                      mb: 0.5,
                    }}
                  >
                    Đang tải {selectedLevel.name}
                  </Box>
                  <Box
                    sx={{
                      fontSize: "0.9rem",
                      color: "#666",
                      opacity: 0.8,
                    }}
                  >
                    Vui lòng đợi trong giây lát...
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const RobotStudioPage = () => {
  const { mapKey } = useParams<{ mapKey?: string }>();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showLevelSelector, setShowLevelSelector] = useState(!mapKey);
  const [isInitialized, setIsInitialized] = useState(false);
  const shouldAutoRestore = !!mapKey;

  // Sync React state with URL changes (for browser back/forward buttons)
  useEffect(() => {
    // If URL has no mapKey, should show level selector
    if (!mapKey && !showLevelSelector) {
      setShowLevelSelector(true);
      setSelectedLevel(null);
      setIsInitialized(false);
    }
    // If URL has mapKey but we're showing selector, hide it and initialize
    else if (mapKey && showLevelSelector) {
      setShowLevelSelector(false);
      setIsInitialized(false);
    }
    // If URL has different mapKey than current selected level
    else if (mapKey && selectedLevel && mapKey !== selectedLevel.mapKey) {
      setSelectedLevel(null);
      setIsInitialized(false);
    }
  }, [mapKey]); // Remove showLevelSelector and selectedLevel from dependencies

  // Initialize level from URL or localStorage
  const initializeLevel = (
    mapDataFinder: (key: string) => any,
    urlMapKey?: string
  ) => {
    if (isInitialized) {
      return;
    }

    let levelToSet: LevelData | null = null;
    const targetMapKey = urlMapKey || mapKey;

    if (targetMapKey) {
      const mapResult = mapDataFinder(targetMapKey);
      if (mapResult) {
        levelToSet = mapKeyToLevelData(targetMapKey, mapResult);
      }
    } else if (shouldAutoRestore) {
      const savedLevel = loadCurrentLevel();
      if (savedLevel?.mapKey) {
        const mapResult = mapDataFinder(savedLevel.mapKey);
        if (mapResult) {
          levelToSet = mapKeyToLevelData(savedLevel.mapKey, mapResult);
          if (levelToSet) {
            navigate(levelDataToUrl(levelToSet), { replace: true });
          }
        } else {
          clearSavedLevel();
        }
      }
    }

    if (levelToSet) {
      setSelectedLevel(levelToSet);
      setShowLevelSelector(false);
      saveCurrentLevel(levelToSet);
    } else {
      setShowLevelSelector(true);
    }

    setIsInitialized(true);
  };

  const handleLevelSelect = (level: LevelData) => {
    setSelectedLevel(level);
    setShowLevelSelector(false);
    saveCurrentLevel(level);
    navigate(levelDataToUrl(level));
  };

  // Single PhaserProvider to prevent iframe reload issues
  return (
    <PhaserProvider>
      {showLevelSelector || !isInitialized || !selectedLevel ? (
        <LevelSelectorWithInitialization
          onLevelSelect={handleLevelSelect}
          currentLevel={selectedLevel || undefined}
          initializeLevel={initializeLevel}
          isInitialized={isInitialized}
        />
      ) : (
        <StudioContent selectedLevel={selectedLevel} />
      )}
    </PhaserProvider>
  );
};

export default RobotStudioPage;
