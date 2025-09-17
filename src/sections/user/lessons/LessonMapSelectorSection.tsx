/**
 * Lesson Map Selector Section - Main component orchestrating Hero and Tablet sections
 * Simplified to coordinate between LessonHeroSection and LessonTabletSection
 */

import React, { useEffect, useState, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getLessonsByCourse } from "../../../redux/lesson/lessonSlice";
import { getChallengesByLesson } from "../../../redux/challenge/challengeSlice";
import { ChallengeResult } from "../../../common/@types/challenge";
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
  
  const { data: lessonsData, isLoading } = useAppSelector(
    (state) => state.lesson.courseLessons
  );
  
  const { data: challengesData, isLoading: challengesLoading, error: challengesError } = useAppSelector(
    (state) => state.challenge.lessonChallenges
  );

  const [challenges, setChallenges] = useState<ChallengeResult[]>([]);

  // Load data based on props
  useEffect(() => {
    if (lessonId) {
      dispatch(getChallengesByLesson({ lessonId, pageSize: 50 }));
    }
    if (courseId) {
      dispatch(getLessonsByCourse({ courseId, pageSize: 50 }));
    }
  }, [courseId, lessonId, dispatch]);

  // Get current lesson info for terminal display
  const currentLessonInfo: LessonInfo | null = useMemo(() => {
    if (!lessonId || !lessonsData?.items) return null;
    
    const lesson = lessonsData.items.find(lesson => lesson.id === lessonId);
    
    return lesson ? {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      order: lesson.order
    } : null;
  }, [lessonId, lessonsData]);

  // Process challenges data
  useEffect(() => {
    if (challengesData?.items) {
      setChallenges(challengesData.items);
    }
  }, [challengesData]);

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
          challengesLoading={challengesLoading}
          challengesError={challengesError}
          onChallengeSelect={handleChallengeSelect}
          onRetry={handleRetry}
        />
      </div>
    </Box>
  );
};

export default LessonMapSelectorSection;