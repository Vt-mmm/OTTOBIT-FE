/**
 * Lesson Map Selector Section - Main component orchestrating Hero and Tablet sections
 * Simplified to coordinate between LessonHeroSection and LessonTabletSection
 */

import React, { useEffect, useState, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallengesByLesson, getChallengeProcesses } from "../../../redux/challenge/challengeSlice";
import { startLesson, getMyLessonProgress } from "../../../redux/lessonProgress/lessonProgressSlice";
import { ChallengeResult, ChallengeProcessResult } from "../../../common/@types/challenge";
import { navigateToStudio } from "../../../utils/studioNavigation";
import LessonHeroSection, { LessonInfo } from "./LessonHeroSection";
import LessonTabletSection from "./LessonTabletSection";

interface LessonMapSelectorSectionProps {
  courseId: string;
  lessonId?: string;
  onChallengeSelect?: (challengeId: string) => void;
  onBackToCourse?: () => void;
}

const LessonMapSelectorSection: React.FC<LessonMapSelectorSectionProps> = ({
  courseId,
  lessonId,
  onChallengeSelect,
  onBackToCourse,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { data: currentLesson, isLoading } = useAppSelector(
    (state) => state.lesson.currentLesson
  );
  
  const { data: challengesData, isLoading: challengesLoading, error: challengesError } = useAppSelector(
    (state) => state.challenge.lessonChallenges
  );
  
  const { data: challengeProcessesData, isLoading: processesLoading, error: processesError } = useAppSelector(
    (state) => state.challenge.challengeProcesses
  );
  
  // Lesson Progress state for tracking lesson start - operations not used
  // const { operations: lessonProgressOps } = useAppSelector(
  //   (state) => state.lessonProgress
  // );

  const [challenges, setChallenges] = useState<ChallengeResult[]>([]);
  const [challengeProcesses, setChallengeProcesses] = useState<ChallengeProcessResult[]>([]);

  // Start lesson (only if not already started/completed) and load challenges data
  useEffect(() => {
    if (!lessonId) return;

    // Load challenges regardless
    dispatch(getChallengesByLesson({ lessonId, pageSize: 50 }));
    dispatch(getChallengeProcesses({ lessonId, page: 1, size: 50 }));

    // Try to fetch my lesson progress for this course; only start if no record exists
    if (courseId) {
      dispatch(getMyLessonProgress({ courseId, pageNumber: 1, pageSize: 50 }))
        .unwrap()
        .then((res) => {
          const exists = res.items?.some((p) => p.lessonId === lessonId);
          if (!exists) {
            // Create progress by starting the lesson
            dispatch(startLesson(lessonId));
          }
        })
        .catch(() => {
          // If we fail to load progress, try starting (BE will reject if already completed)
          dispatch(startLesson(lessonId));
        });
    } else {
      // No courseId provided, fallback to start (BE will reject if already completed)
      dispatch(startLesson(lessonId));
    }
  }, [lessonId, courseId, dispatch]);

  // Get current lesson info for terminal display
  const currentLessonInfo: LessonInfo | null = useMemo(() => {
    if (!lessonId || !currentLesson) return null;
    
    return {
      id: currentLesson.id,
      title: currentLesson.title,
      content: currentLesson.content,
      order: currentLesson.order
    };
  }, [lessonId, currentLesson]);

  // Process challenges data
  useEffect(() => {
    if (challengesData?.items) {
      setChallenges(challengesData.items);
    }
  }, [challengesData]);

  // Process challenge processes data
  useEffect(() => {
    if (challengeProcessesData?.items) {
      setChallengeProcesses(challengeProcessesData.items);
    }
  }, [challengeProcessesData]);

  // Handle challenge selection and navigate to studio
  const handleChallengeSelect = (challengeId: string) => {
    console.log('🎯 Selected challenge:', challengeId);
    
    if (onChallengeSelect) {
      onChallengeSelect(challengeId);
    } else {
      navigateToStudio(navigate, challengeId, lessonId);
    }
  };

  // Handle retry for challenge loading
  const handleRetry = () => {
    if (lessonId) {
      dispatch(getChallengesByLesson({ lessonId, pageSize: 50 }));
      dispatch(getChallengeProcesses({ lessonId, page: 1, size: 50 }));
    }
  };


  // Show loading state if needed
  if (isLoading && !currentLessonInfo) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>
          <CircularProgress />
          <p>Đang tải thông tin bài học...</p>
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Hero Section with Terminal Preview */}
      <LessonHeroSection
        currentLessonInfo={currentLessonInfo}
        onBackToCourse={onBackToCourse}
      />

      {/* Tablet Section with Challenges */}
      <div id="tablet-section">
        <LessonTabletSection
          challenges={challenges}
          challengeProcesses={challengeProcesses}
          challengesLoading={challengesLoading || processesLoading}
          challengesError={challengesError || processesError}
          onChallengeSelect={handleChallengeSelect}
          onRetry={handleRetry}
        />
      </div>
    </Box>
  );
};

export default LessonMapSelectorSection;