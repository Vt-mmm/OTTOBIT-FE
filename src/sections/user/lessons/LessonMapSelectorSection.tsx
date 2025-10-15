/**
 * Lesson Map Selector Section - Main component orchestrating Hero and Tablet sections
 * Simplified to coordinate between LessonHeroSection and LessonTabletSection
 */

import React, { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getChallengesByLesson } from "../../../redux/challenge/challengeSlice";
import { getMySubmissionsThunk } from "../../../redux/submission/submissionThunks";
import {
  startLesson,
  getMyLessonProgress,
} from "../../../redux/lessonProgress/lessonProgressSlice";
import { ChallengeResult } from "../../../common/@types/challenge";
import { SubmissionResult } from "../../../common/@types/submission";
import { navigateToStudio } from "../../../utils/studioNavigation";
// import LessonHeroSection, { LessonInfo } from "./LessonHeroSection"; // Removed console UI
import LessonTabletSection from "./LessonTabletSection";
import { useLocales } from "hooks";

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
  const { translate } = useLocales();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: currentLesson, isLoading } = useAppSelector(
    (state) => state.lesson.currentLesson
  );

  const {
    data: challengesData,
    isLoading: challengesLoading,
    error: challengesError,
  } = useAppSelector((state) => state.challenge.lessonChallenges);

  const { mySubmissions } = useAppSelector((state) => state.submission);
  const submissionsLoading = mySubmissions?.isLoading || false;

  const [challenges, setChallenges] = useState<ChallengeResult[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);

  // Start lesson (only if not already started/completed) and load challenges data
  useEffect(() => {
    if (!lessonId) return;

    // Load challenges and my submissions
    dispatch(getChallengesByLesson({ lessonId, pageSize: 10 }));
    dispatch(getMySubmissionsThunk({ pageNumber: 1, pageSize: 10 }));

    // Try to fetch my lesson progress for this course; only start if no record exists
    if (courseId) {
      dispatch(getMyLessonProgress({ courseId, pageNumber: 1, pageSize: 10 }))
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

  // Get current lesson info for terminal display - REMOVED
  // const currentLessonInfo: LessonInfo | null = useMemo(() => {
  //   if (!lessonId || !currentLesson) return null;
  //
  //   return {
  //     id: currentLesson.id,
  //     title: currentLesson.title,
  //     content: currentLesson.content,
  //     order: currentLesson.order,
  //   };
  // }, [lessonId, currentLesson]);

  // Process challenges data
  useEffect(() => {
    if (challengesData?.items) {
      setChallenges(challengesData.items);
    }
  }, [challengesData]);

  // Process submissions data
  useEffect(() => {
    if (mySubmissions?.data?.items) {
      setSubmissions(mySubmissions.data.items);
    } else {
      // Set empty array if no submissions yet
      setSubmissions([]);
    }
  }, [mySubmissions]);

  // Handle challenge selection and navigate to studio
  const handleChallengeSelect = (challengeId: string) => {
    if (onChallengeSelect) {
      onChallengeSelect(challengeId);
    } else {
      navigateToStudio(navigate, challengeId, lessonId);
    }
  };

  // Handle retry for challenge loading
  const handleRetry = () => {
    if (lessonId) {
      dispatch(getChallengesByLesson({ lessonId, pageSize: 10 }));
      dispatch(getMySubmissionsThunk({ pageNumber: 1, pageSize: 10 }));
    }
  };

  // Show loading state if needed
  if (isLoading && !currentLesson) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <CircularProgress />
          <p>{translate("lessons.LoadingLessonInfo")}</p>
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Hero Section with Terminal Preview - REMOVED */}
      {/* <LessonHeroSection
        currentLessonInfo={currentLessonInfo}
        onBackToCourse={onBackToCourse}
      /> */}

      {/* Tablet Section with Challenges */}
      <div id="tablet-section">
        <LessonTabletSection
          challenges={challenges}
          submissions={submissions}
          challengesLoading={challengesLoading || submissionsLoading}
          challengesError={challengesError || null}
          onChallengeSelect={handleChallengeSelect}
          onRetry={handleRetry}
          lessonId={lessonId}
          courseId={courseId} // Pass courseId for proper note scoping
          onBackToCourse={onBackToCourse} // Pass back handler
        />
      </div>
    </Box>
  );
};

export default LessonMapSelectorSection;
