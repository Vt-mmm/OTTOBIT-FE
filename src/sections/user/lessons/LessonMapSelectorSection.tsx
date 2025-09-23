/**
 * Lesson Map Selector Section - Main component orchestrating Hero and Tablet sections
 * Simplified to coordinate between LessonHeroSection and LessonTabletSection
 */

import React, { useEffect, useState, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallengesByLesson, getChallengeProcesses } from "../../../redux/challenge/challengeSlice";
import { startLesson } from "../../../redux/lessonProgress/lessonProgressSlice";
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
  // courseId, - unused parameter
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

  // Start lesson and load challenges data
  useEffect(() => {
    if (lessonId) {
      // Start the lesson to create lesson progress
      console.log('🚀 Starting lesson:', lessonId);
      dispatch(startLesson(lessonId));
      
      dispatch(getChallengesByLesson({ lessonId, pageSize: 50 }));
      dispatch(getChallengeProcesses({ lessonId, page: 1, size: 50 }));
    }
  }, [lessonId, dispatch]);

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