/**
 * Lesson Tablet Section - Contains tablet UI with challenges grid and notes
 * Displays challenges for a specific lesson in tablet-style interface
 */

import React, { useState, useMemo } from "react";
import { Box, Typography, Container, Tabs, Tab, Button, IconButton, Tooltip } from "@mui/material";
import {
  Assignment as ChallengeIcon,
  NoteAlt as NoteIcon,
  ArrowBack as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { ChallengeResult } from "../../../common/@types/challenge";
import { SubmissionResult } from "../../../common/@types/submission";
import { LessonNotesPanel } from "../../../components/lesson-notes";
import { TabletDevice } from "../../../components/tablet";
import { ChallengesGrid } from "../../../components/challenges";
import { useLocales } from "hooks";

interface LessonTabletSectionProps {
  challenges: ChallengeResult[];
  submissions?: SubmissionResult[];
  challengesLoading: boolean;
  challengesError: string | null;
  onChallengeSelect: (challengeId: string) => void;
  onRetry: () => void;
  lessonId?: string;
  courseId?: string; // Add courseId for proper note scoping
  onBackToCourse?: () => void; // Add back handler
}

const LessonTabletSection: React.FC<LessonTabletSectionProps> = ({
  challenges,
  submissions = [],
  challengesLoading,
  challengesError,
  onChallengeSelect,
  onRetry,
  lessonId,
  courseId, // Destructure courseId
  onBackToCourse, // Destructure back handler
}) => {
  const { translate } = useLocales();
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const challengesPerPage = 8; // Show 8 challenges per page

  // ✅ NEW: Restore page state from sessionStorage when component mounts or lessonId changes
  React.useEffect(() => {
    if (!lessonId) return;
    
    const storageKey = `lesson-page-${lessonId}`;
    const savedPage = sessionStorage.getItem(storageKey);
    if (savedPage) {
      const restorePage = parseInt(savedPage, 10);
      setCurrentPage(restorePage);
      console.log('📍 [LessonTablet] Restored page state:', {
        lessonId,
        restorePage,
        storageKey
      });
    }
  }, [lessonId]);
  
  // ✅ NEW: Save page state when page changes
  React.useEffect(() => {
    if (!lessonId) return;
    
    const storageKey = `lesson-page-${lessonId}`;
    sessionStorage.setItem(storageKey, currentPage.toString());
    console.log('💾 [LessonTablet] Saved page state:', {
      lessonId,
      currentPage,
      storageKey
    });
  }, [lessonId, currentPage]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(challenges.length / challengesPerPage));
  }, [challenges.length]);
  
  // Get paginated challenges
  const paginatedChallenges = useMemo(() => {
    const startIdx = (currentPage - 1) * challengesPerPage;
    const endIdx = startIdx + challengesPerPage;
    return challenges.slice(startIdx, endIdx);
  }, [challenges, currentPage]);
  
  // ✅ REMOVED: Don't reset page when challenges change
  // This allows page state to persist across navigation
  // Page will only reset when lessonId changes (via LessonDetail)
  
  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <Box sx={{ background: "#f8f9fa", pt: 12, pb: 6 }}>
      <Container maxWidth="xl">
        {/* Back Button */}
        {onBackToCourse && (
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBackToCourse}
              variant="text"
              size="small"
              sx={{
                color: "#6b7280",
                fontSize: "0.875rem",
                py: 1,
                px: 1.5,
                textTransform: "none",
                borderRadius: "8px",
                "&:hover": {
                  color: "#22c55e",
                  backgroundColor: "rgba(34, 197, 94, 0.05)",
                },
              }}
            >
              {translate("lessons.BackToCourse")}
            </Button>
          </Box>
        )}

        {/* Section Title */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 1, color: "#2e3440" }}
          >
            Chọn thử thách học tập
          </Typography>
          <Typography variant="body1" sx={{ color: "#5e6c84" }}>
            Các thử thách được tổ chức theo độ khó tăng dần
          </Typography>
        </Box>

        {/* Virtual Tablet Container */}
        <TabletDevice>
          {/* Tabs Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="lesson content tabs"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#22c55e",
                },
                "& .MuiTabs-flexContainer": {
                  gap: 3,
                },
              }}
            >
              <Tab
                icon={<ChallengeIcon />}
                iconPosition="start"
                label="Thử thách"
                sx={{
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  minWidth: 150,
                  "&.Mui-selected": {
                    color: "#22c55e",
                  },
                }}
              />
              <Tab
                icon={<NoteIcon />}
                iconPosition="start"
                label="Ghi chú của tôi"
                sx={{
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  minWidth: 180,
                  "&.Mui-selected": {
                    color: "#22c55e",
                  },
                }}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0, // Important: allows flex child to shrink
            }}
          >
            {/* Challenges Tab */}
            {activeTab === 0 && (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  minHeight: 0,
                }}
              >
                {/* Challenges Grid with Scroll */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "auto", // Enable scroll instead of hidden!
                    overflowX: "hidden",
                    minHeight: 0,
                    p: 3,
                    WebkitOverflowScrolling: "touch", // Smooth scrolling on mobile
                    // Show scrollbar on mobile
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(0,0,0,0.3) rgba(0,0,0,0.05)",
                    "&::-webkit-scrollbar": {
                      width: { xs: "6px", sm: "8px" },
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(0,0,0,0.05)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "4px",
                      "&:hover": {
                        background: "rgba(0,0,0,0.4)",
                      },
                    },
                  }}
                >
                  <ChallengesGrid
                    challenges={paginatedChallenges}
                    submissions={submissions}
                    loading={challengesLoading}
                    error={challengesError}
                    onChallengeSelect={onChallengeSelect}
                    onRetry={onRetry}
                  />
                </Box>
                
                {/* Pagination Controls - Show only if multiple pages */}
                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderTop: "1px solid #e5e7eb",
                      bg: "#ffffff",
                    }}
                  >
                    {/* Previous Button */}
                    <Tooltip title="Trang trước">
                      <span>
                        <IconButton
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          size="small"
                          sx={{
                            color: currentPage === 1 ? "#d1d5db" : "#22c55e",
                            "&:hover": {
                              bgcolor: currentPage === 1 ? "transparent" : "#f0fdf4",
                            },
                          }}
                        >
                          <ChevronLeftIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    
                    {/* Page Info */}
                    <Typography variant="body2" sx={{ color: "#6b7280", minWidth: 80, textAlign: "center" }}>
                      Trang {currentPage} / {totalPages}
                    </Typography>
                    
                    {/* Next Button */}
                    <Tooltip title="Trang tiếp">
                      <span>
                        <IconButton
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          size="small"
                          sx={{
                            color: currentPage === totalPages ? "#d1d5db" : "#22c55e",
                            "&:hover": {
                              bgcolor: currentPage === totalPages ? "transparent" : "#f0fdf4",
                            },
                          }}
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            )}

            {/* Notes Tab */}
            {activeTab === 1 && lessonId && (
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  overflowX: "hidden",
                  minHeight: 0,
                  p: 3,
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0,0,0,0.3) rgba(0,0,0,0.05)",
                  "&::-webkit-scrollbar": {
                    width: { xs: "6px", sm: "8px" },
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "4px",
                    "&:hover": {
                      background: "rgba(0,0,0,0.4)",
                    },
                  },
                }}
              >
                <LessonNotesPanel lessonId={lessonId} courseId={courseId} />
              </Box>
            )}
            {activeTab === 1 && !lessonId && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 400,
                  p: 3,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  {translate("lessons.CannotLoadNotes")}
                </Typography>
              </Box>
            )}
          </Box>
        </TabletDevice>
      </Container>
    </Box>
  );
};

export default LessonTabletSection;
