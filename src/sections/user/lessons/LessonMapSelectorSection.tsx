/**
 * Lesson Map Selector Section - Main component orchestrating Hero and Tablet sections
 * Simplified to coordinate between LessonHeroSection and LessonTabletSection
 */

import React, { useEffect, useState, useRef } from "react";
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
    lessonId: storedLessonId, // ✅ CRITICAL: Get lessonId from Redux to check staleness
  } = useAppSelector((state) => state.challenge.lessonChallenges);

  const { mySubmissions } = useAppSelector((state) => state.submission);
  const submissionsLoading = mySubmissions?.isLoading || false;

  const [challenges, setChallenges] = useState<ChallengeResult[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
  
  // ✅ Track which lessons have been started to prevent duplicate API calls
  const startedLessonsRef = useRef<Set<string>>(new Set());
  
  // ✅ Track last submissions fetch timestamp to prevent rapid refetching
  const lastSubmissionsFetchRef = useRef<number>(0);
  
  // ✅ Track if we've fetched submissions for current page load
  const hasInitialFetchRef = useRef<boolean>(false);

  // ✅ CRITICAL: Detect if returning from Studio and force fresh data fetch
  // This MUST run BEFORE the main useEffect to ensure submissions are fresh
  useEffect(() => {
    // ⚠️ PREVENT DUPLICATE FETCH: Only run once per page load
    if (hasInitialFetchRef.current) {
      console.log('⚠️ [LessonMapSelector] Skipping duplicate initial fetch');
      return;
    }
    
    // Check sessionStorage for studio navigation marker
    const studioNavData = sessionStorage.getItem('studio_navigation_data');
    if (studioNavData) {
      console.log('🔄 [LessonMapSelector] Detected return from Studio - forcing fresh submissions fetch');
      
      hasInitialFetchRef.current = true; // Mark as fetched
      lastSubmissionsFetchRef.current = Date.now();
      
      // Fetch fresh submissions immediately with higher pageSize to ensure we get all
      dispatch(getMySubmissionsThunk({ pageNumber: 1, pageSize: 50 }))
        .unwrap()
        .then((result) => {
          console.log('✅ [LessonMapSelector] Fresh submissions fetched from Studio return:', {
            count: result.items?.length || 0,
            total: result.total,
          });
        })
        .catch((error) => {
          console.error('❌ [LessonMapSelector] Failed to fetch fresh submissions:', error);
        });
    }
  }, [dispatch]);

  // Start lesson (only if not already started/completed) and load challenges data
  useEffect(() => {
    if (!lessonId) return;
    
    // 🔍 CRITICAL DEBUG: Log which lessonId we're loading challenges for
    console.log('🎯 [LessonMapSelector] Loading data for lessonId:', lessonId);

    // ✅ CRITICAL FIX: Check if challenges belong to DIFFERENT lesson
    // Use storedLessonId from Redux state, NOT from challenges data (which doesn't have lessonId field!)
    const isChallengesStale = 
      !challengesData || 
      !challengesData.items || 
      challengesData.items.length === 0 ||
      storedLessonId !== lessonId; // ✅ FIX: Compare with Redux stored lessonId

    console.log('🔍 [LessonMapSelector] Challenges staleness check:', {
      currentLessonId: lessonId,
      storedLessonId,
      isChallengesStale,
      hasData: !!challengesData,
      challengesCount: challengesData?.items?.length || 0,
    });

    if (isChallengesStale) {
      console.log('🔄 [LessonMapSelector] Fetching challenges for NEW lesson:', lessonId);
      dispatch(getChallengesByLesson({ lessonId, pageSize: 10 }));
    } else {
      console.log('✅ [LessonMapSelector] Using cached challenges for lesson:', lessonId);
    }

    // ✅ FIX: Only fetch submissions if NOT already fetched in initial effect
    if (!hasInitialFetchRef.current) {
      const now = Date.now();
      const timeSinceLastFetch = now - lastSubmissionsFetchRef.current;
      const shouldFetchSubmissions = 
        timeSinceLastFetch > 30000 || // 30 seconds
        !mySubmissions?.data?.items || 
        mySubmissions.data.items.length === 0;

      if (shouldFetchSubmissions) {
        console.log('📥 [LessonMapSelector] Fetching submissions (initial load)');
        hasInitialFetchRef.current = true;
        lastSubmissionsFetchRef.current = now;
        dispatch(getMySubmissionsThunk({ pageNumber: 1, pageSize: 50 }));
      }
    } else {
      console.log('✅ [LessonMapSelector] Submissions already fetched, skipping');
    }

    // ✅ FIX: Only start lesson once - use ref to prevent duplicate calls
    // This is CRITICAL to prevent progress reset when navigating back from Studio
    if (startedLessonsRef.current.has(lessonId)) {
      // Already started this lesson in current session - skip
      return;
    }

    // Mark as started immediately to prevent race conditions
    startedLessonsRef.current.add(lessonId);

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
          // If exists, DO NOT call startLesson to avoid resetting progress
        })
        .catch(() => {
          // If we fail to load progress, try starting (BE will reject if already completed)
          // Backend should be idempotent and not reset existing progress
          dispatch(startLesson(lessonId));
        });
    } else {
      // No courseId provided, fallback to start (BE will reject if already completed)
      dispatch(startLesson(lessonId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      // 🔍 DEBUG: Log challenges data for unlock diagnosis
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 [LessonMapSelector] Challenges loaded:', {
          count: challengesData.items.length,
          challenges: challengesData.items.map((c) => ({
            id: c.id,
            title: c.title,
            order: c.order,
            hasPrerequisites: !!(c as any).prerequisiteChallenges,
          })),
        });
      }
    }
  }, [challengesData]);

  // Process submissions data
  useEffect(() => {
    if (mySubmissions?.data?.items) {
      setSubmissions(mySubmissions.data.items);
      
      // 🔍 DEBUG: Log submissions data for unlock diagnosis
      if (process.env.NODE_ENV === 'development') {
        console.log('⭐ [LessonMapSelector] Submissions loaded:', {
          count: mySubmissions.data.items.length,
          submissions: mySubmissions.data.items.map((s) => ({
            id: s.id.substring(0, 8),
            challengeId: s.challengeId.substring(0, 8),
            star: s.star,
          })),
        });
        
        // 🔍 Log challenge-to-submission mapping
        if (challenges.length > 0 && mySubmissions.data) {
          console.log('🔗 [LessonMapSelector] Challenge-Submission mapping:');
          challenges.forEach((c) => {
            const submissions = mySubmissions.data!.items.filter(
              (s) => s.challengeId === c.id
            );
            const bestStar = submissions.reduce((max, s) => (s.star > max ? s.star : max), 0);
            console.log(`  - ${c.title} (order ${c.order}): ${submissions.length} submission(s), best star = ${bestStar}`);
          });
        }
      }
    } else {
      // Set empty array if no submissions yet
      setSubmissions([]);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ [LessonMapSelector] No submissions data available');
      }
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
