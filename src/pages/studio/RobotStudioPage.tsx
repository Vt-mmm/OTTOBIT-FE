import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../layout/components/header/Header";
import TopBarSection from "sections/studio/TopBarSection";
import LeftPanelSection from "sections/studio/LeftPanelSection";
import SimulatorStageSection from "sections/studio/SimulatorStageSection";
import {
  PhaserProvider,
  usePhaserContext,
} from "../../features/phaser";
import { parseStudioNavigation, storeStudioNavigationData } from "../../utils/studioNavigation";

// Simple Challenge Selector - temporary implementation
const ChallengeSelector = ({
  onChallengeSelect,
}: {
  onChallengeSelect: (challengeId: string) => void;
}) => {
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
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", p: 4 }}>
          <h1>Challenge Selector</h1>
          <p>Temporary challenge selector - implementation pending</p>
          <button 
            onClick={() => onChallengeSelect('temp-challenge-id')}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px', 
              backgroundColor: '#1976d2', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Load Test Challenge
          </button>
        </Box>
      </Box>
    </>
  );
};

// Studio Content Component - để có thể sử dụng PhaserContext
const StudioContent = ({ challengeId }: { challengeId: string }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loadingChallengeId, setLoadingChallengeId] = useState<string | null>(null);
  const [loadedChallengeId, setLoadedChallengeId] = useState<string | null>(null);
  const [showMapLoading, setShowMapLoading] = useState(true);
  const { loadChallenge, onMessage, offMessage, currentChallenge } = usePhaserContext();

  // Reset states when challenge changes
  useEffect(() => {
    if (challengeId && loadedChallengeId !== challengeId) {
      setLoadedChallengeId(null);
      setShowMapLoading(true);
    }
  }, [challengeId, loadedChallengeId]);

  // Reset loading state when component mounts
  useEffect(() => {
    if (challengeId) {
      setShowMapLoading(true);
    }
  }, []); // Only run on mount

  // Load challenge when Phaser is ready and challengeId is available
  useEffect(() => {
    if (!challengeId) {
      return;
    }

    // Prevent duplicate loading of same challenge
    if (loadingChallengeId === challengeId) {
      return;
    }

    // Skip if challenge already loaded
    if (loadedChallengeId === challengeId) {
      return;
    }

    const doLoadChallenge = () => {
      setLoadingChallengeId(challengeId);
      loadChallenge(challengeId)
        .then((result) => {
          if (result) {
            setLoadedChallengeId(challengeId);
            setTimeout(() => {
              setShowMapLoading(false);
            }, 200);
          }
        })
        .catch(() => {
          setShowMapLoading(false);
        })
        .finally(() => {
          setLoadingChallengeId(null);
        });
    };

    // Wait for READY message to ensure Phaser is fully initialized
    const handleReady = () => {
      setTimeout(() => {
        doLoadChallenge();
      }, 100);
      offMessage("READY", handleReady);
    };

    onMessage("READY", handleReady);

    return () => {
      offMessage("READY", handleReady);
    };
  }, [challengeId, loadChallenge, onMessage, offMessage]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#e9ecef", // Light gray background for the main container
        m: 0,
        p: 0,
        boxSizing: "border-box",
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

      {/* Main Content Area - Enhanced Responsive Layout */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", lg: "row" }, // Stack on mobile/tablet, side-by-side on large screens
          gap: { xs: 1, md: 2 }, // Small gaps for visual separation
          p: { xs: 1, md: 2 }, // Padding around the main content
          overflow: "hidden",
          minHeight: 0,
          height: "100%",
          maxWidth: "100vw",
          backgroundColor: "#e9ecef", // Match container background
        }}
      >
        {/* Left Panel - Workspace Area */}
        <Box
          sx={{
            // Mobile: take available space but don't overflow
            flex: { xs: "1 1 0%", lg: "0 0 auto" },
            width: { xs: "100%", lg: "600px", xl: "720px" }, // Increased width for larger workspace
            height: { xs: "50vh", sm: "55vh", md: "60vh", lg: "100%" },
            minHeight: { xs: "300px", lg: "auto" },
            maxHeight: { xs: "50vh", lg: "none" },
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            // Add subtle shadow for depth
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <LeftPanelSection
            activeTab={activeTab}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
          />
        </Box>

        {/* Right Panel - Robot Simulator */}
        <Box 
          sx={{ 
            position: "relative",
            flex: { xs: "1 1 0%", lg: 1 },
            width: "100%",
            height: { xs: "50vh", sm: "45vh", md: "40vh", lg: "100%" },
            minHeight: { xs: "250px", lg: "auto" },
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            // Add subtle shadow for depth
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: 2,
            overflow: "hidden",
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
                    Đang tải Challenge {currentChallenge?.title || challengeId}
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
  const { challengeId } = useParams<{ challengeId?: string }>();
  const [searchParams] = useSearchParams();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [showChallengeSelector, setShowChallengeSelector] = useState(true);
  // Removed unused navigationData state

  // Parse navigation data from URL on mount
  useEffect(() => {
    const navData = parseStudioNavigation(challengeId, searchParams);
    
    if (navData) {
      console.log('🚀 Studio navigation detected:', navData);
      
      // Store navigation data
      storeStudioNavigationData(navData);
      // TODO: Re-implement navigation data if needed
      console.log('Navigation data:', navData);
      setSelectedChallengeId(navData.challengeId);
      setShowChallengeSelector(false);
    } else {
      // No navigation data, show challenge selector
      setShowChallengeSelector(true);
      setSelectedChallengeId(null);
    }
  }, [challengeId, searchParams]);

  // Sync React state with URL changes (for browser back/forward buttons)
  useEffect(() => {
    if (challengeId && challengeId !== selectedChallengeId) {
      setSelectedChallengeId(challengeId);
      setShowChallengeSelector(false);
    } else if (!challengeId && !selectedChallengeId) {
      setShowChallengeSelector(true);
    }
  }, [challengeId, selectedChallengeId]);

  const handleChallengeSelect = (challengeIdSelected: string) => {
    setSelectedChallengeId(challengeIdSelected);
    setShowChallengeSelector(false);
    // For now, don't navigate to avoid URL complications
    // navigate(`/studio/${challengeIdSelected}`);
  };

  // Single PhaserProvider to prevent iframe reload issues
  return (
    <PhaserProvider>
      {showChallengeSelector || !selectedChallengeId ? (
        <ChallengeSelector
          onChallengeSelect={handleChallengeSelect}
        />
      ) : (
        <StudioContent challengeId={selectedChallengeId} />
      )}
    </PhaserProvider>
  );
};

export default RobotStudioPage;
