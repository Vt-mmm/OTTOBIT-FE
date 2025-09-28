import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../layout/components/header/Header";
import TopBarSection from "sections/studio/TopBarSection";
import LeftPanelSection from "sections/studio/LeftPanelSection";
import SimulatorStageSection from "sections/studio/SimulatorStageSection";
import { PhaserProvider, usePhaserContext } from "../../features/phaser";
import {
  parseStudioNavigation,
  storeStudioNavigationData,
  getStoredNavigationData,
} from "../../utils/studioNavigation";
import { useAppDispatch, useAppSelector } from "store/config";
import { getLessonById } from "store/lesson/lessonSlice";
import StudioTourGate from "../../features/onboarding/driver/components/StudioTourGate";

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
            onClick={() => onChallengeSelect("temp-challenge-id")}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
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
  const [loadingChallengeId, setLoadingChallengeId] = useState<string | null>(
    null
  );
  const [loadedChallengeId, setLoadedChallengeId] = useState<string | null>(
    null
  );
  const {
    loadChallenge,
    onMessage,
    offMessage,
    isReady,
    lessonChallenges,
    currentChallengeId,
    currentChallenge,
  } = usePhaserContext();

  // Fetch current lesson info (for gating: courseId, lessonOrder)
  const dispatch = useAppDispatch();
  const currentLesson = useAppSelector((s) => s.lesson.currentLesson.data);
  const userId = useAppSelector((s) => s.account.profile.data?.id);

  useEffect(() => {
    const nav = getStoredNavigationData();
    const lessonId = nav?.lessonId;
    if (lessonId) {
      dispatch(getLessonById(lessonId));
    }
  }, [dispatch]);

  // Fallback: if nav lacks lessonId, use currentChallenge.lessonId when available
  useEffect(() => {
    if (!currentLesson?.id && currentChallenge?.lessonId) {
      dispatch(getLessonById(currentChallenge.lessonId));
    }
  }, [currentLesson?.id, currentChallenge?.lessonId, dispatch]);

  // Prefer currentChallenge.order to avoid race with list fetching
  const challengeOrder = useMemo(() => {
    if (currentChallenge?.order != null) return currentChallenge.order;
    try {
      const items = (lessonChallenges as any)?.items || [];
      const found = items.find((c: any) => c.id === currentChallengeId);
      return found?.order as number | undefined;
    } catch {
      return undefined;
    }
  }, [currentChallenge?.order, lessonChallenges, currentChallengeId]);

  // Reset states when challenge changes
  useEffect(() => {
    if (challengeId && loadedChallengeId !== challengeId) {
      setLoadedChallengeId(null);
    }
  }, [challengeId, loadedChallengeId]);

  // Load challenge (immediately if ready; otherwise wait for READY)
  useEffect(() => {
    if (!challengeId) return;

    // Prevent duplicate loading of same challenge
    if (loadingChallengeId === challengeId) return;
    if (loadedChallengeId === challengeId) return;

    const doLoadChallenge = () => {
      setLoadingChallengeId(challengeId);
      loadChallenge(challengeId)
        .then((result) => {
          if (result) {
            setLoadedChallengeId(challengeId);
          }
        })
        .catch(() => {
          // Challenge load failed
        })
        .finally(() => {
          setLoadingChallengeId(null);
        });
    };

    if (isReady) {
      // Phaser already ready -> load now
      doLoadChallenge();
      return; // still register cleanup below
    }

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
  }, [
    challengeId,
    loadChallenge,
    onMessage,
    offMessage,
    isReady,
    loadingChallengeId,
    loadedChallengeId,
  ]);

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
        // Prevent page-level scrollbars from appearing/disappearing (causes layout shift)
        overflow: "hidden",
        // Mobile-specific adjustments
        "@media (max-width: 900px)": {
          height: "100vh",
          overflow: "hidden", // Prevent page scrolling on mobile
        },
      }}
    >
      {/* Driver.js Studio Tour Gate */}
      {currentLesson && (
        <StudioTourGate
          courseId={currentLesson.courseId}
          lessonOrder={currentLesson.order}
          challengeOrder={challengeOrder ?? 0}
          userId={userId}
        />
      )}

      {/* Top Bar - Fixed height */}
      <TopBarSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        workspace={workspace}
      />

      {/* Main Content Area - Optimized cho map full size */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 1, lg: 2 }, // Giảm gap để tận dụng space
          p: { xs: 1, lg: 1.5 }, // Giảm padding để maximize space
          overflow: "hidden",
          minHeight: 0,
          height: "100%",
          maxWidth: "100vw",
          backgroundColor: "#f8f9fa", // Lighter background
        }}
      >
        {/* Left Panel - Workspace Area - Compact như HP Robots */}
        <Box
          sx={{
            // Desktop: fixed width để map có thể full size
            flex: { xs: "1 1 0%", lg: "0 0 auto" },
            width: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "480px", // Compact hơn để dành chỗ cho map
              xl: "680px", // Vẫn đủ space cho blocks
            },
            height: {
              xs: "45vh", // Giảm xuống để map có nhiều space hơn
              sm: "45vh",
              md: "48vh",
              lg: "100%",
            },
            minHeight: { xs: "280px", sm: "300px", lg: "auto" },
            maxHeight: { xs: "45vh", sm: "45vh", md: "48vh", lg: "none" },
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: 1,
            overflow: "hidden",
            backgroundColor: "white",
          }}
        >
          <LeftPanelSection
            activeTab={activeTab}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
          />
        </Box>

        {/* Right Panel - Robot Simulator - Full size như HP Robots */}
        <Box
          sx={{
            position: "relative",
            flex: 1, // Lấy hết remaining space
            width: "100%",
            height: "100%",
            minHeight: { xs: "350px", lg: 0 }, // Minimum cho mobile
            maxHeight: { xs: "55vh", lg: "100%" }, // Giới hạn mobile, free desktop
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: 1,
            overflow: "hidden",
            backgroundColor: "white",
          }}
        >
          <SimulatorStageSection workspace={workspace} />
        </Box>
      </Box>
    </Box>
  );
};

const RobotStudioPage = () => {
  const { challengeId } = useParams<{ challengeId?: string }>();
  const [searchParams] = useSearchParams();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null
  );
  const [showChallengeSelector, setShowChallengeSelector] = useState(true);
  // Removed unused navigationData state

  // Parse navigation data from URL on mount
  useEffect(() => {
    const navData = parseStudioNavigation(challengeId, searchParams);

    if (navData) {
      console.log("🚀 Studio navigation detected:", navData);

      // Store navigation data
      storeStudioNavigationData(navData);
      // TODO: Re-implement navigation data if needed
      console.log("Navigation data:", navData);
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

  // Lock body scroll while in studio to prevent page scrollbar flicker
  useEffect(() => {
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
    };
  }, []);

  // Single PhaserProvider to prevent iframe reload issues
  return (
    <PhaserProvider>
      {showChallengeSelector || !selectedChallengeId ? (
        <ChallengeSelector onChallengeSelect={handleChallengeSelect} />
      ) : (
        <StudioContent challengeId={selectedChallengeId} />
      )}
    </PhaserProvider>
  );
};

export default RobotStudioPage;
