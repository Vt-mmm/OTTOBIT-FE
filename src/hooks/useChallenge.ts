import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "redux/config";
import {
  getChallenges,
  getChallengeById,
  getChallengesByLesson,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  restoreChallenge,
  clearChallenges,
  setCurrentChallenge,
  startSolving,
  stopSolving,
  incrementAttempt,
  clearChallengeErrors,
  resetChallengeState,
} from "redux/challenge/challengeSlice";
import {
  GetChallengesParams,
  GetChallengesByLessonParams,
  CreateChallengeData,
  UpdateChallengeData,
  ChallengeResult,
} from "common/@types/challenge";

export const useChallenge = () => {
  const dispatch = useAppDispatch();
  const challengeState = useAppSelector((state) => state.challenge);

  // Fetch operations
  const fetchChallenges = useCallback(
    (params?: GetChallengesParams) => {
      return dispatch(getChallenges(params || {}));
    },
    [dispatch]
  );

  const fetchChallengeById = useCallback(
    (id: string) => {
      return dispatch(getChallengeById(id));
    },
    [dispatch]
  );

  const fetchChallengesByLesson = useCallback(
    (params: GetChallengesByLessonParams) => {
      return dispatch(getChallengesByLesson(params));
    },
    [dispatch]
  );

  // CRUD operations
  const createNewChallenge = useCallback(
    (data: CreateChallengeData) => {
      return dispatch(createChallenge(data));
    },
    [dispatch]
  );

  const updateExistingChallenge = useCallback(
    (id: string, data: UpdateChallengeData) => {
      return dispatch(updateChallenge({ id, data }));
    },
    [dispatch]
  );

  const deleteExistingChallenge = useCallback(
    (id: string) => {
      return dispatch(deleteChallenge(id));
    },
    [dispatch]
  );

  const restoreDeletedChallenge = useCallback(
    (id: string) => {
      return dispatch(restoreChallenge(id));
    },
    [dispatch]
  );

  // State management actions
  const clearAllChallenges = useCallback(() => {
    dispatch(clearChallenges());
  }, [dispatch]);

  const selectChallenge = useCallback(
    (challenge: ChallengeResult) => {
      dispatch(setCurrentChallenge(challenge));
    },
    [dispatch]
  );

  // Solving session actions
  const startChallengeSolving = useCallback(
    (challenge: ChallengeResult) => {
      dispatch(startSolving(challenge));
    },
    [dispatch]
  );

  const stopChallengeSolving = useCallback(() => {
    dispatch(stopSolving());
  }, [dispatch]);

  const recordAttempt = useCallback(() => {
    dispatch(incrementAttempt());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearChallengeErrors());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetChallengeState());
  }, [dispatch]);

  // Computed values
  const isLoading = 
    challengeState.challenges.isLoading ||
    challengeState.lessonChallenges.isLoading ||
    challengeState.currentChallenge.isLoading ||
    challengeState.operations.isCreating ||
    challengeState.operations.isUpdating ||
    challengeState.operations.isDeleting ||
    challengeState.operations.isRestoring;

  const hasError = 
    !!challengeState.challenges.error ||
    !!challengeState.lessonChallenges.error ||
    !!challengeState.currentChallenge.error ||
    !!challengeState.operations.createError ||
    !!challengeState.operations.updateError ||
    !!challengeState.operations.deleteError ||
    !!challengeState.operations.restoreError;

  // Calculate elapsed time for active solving session
  const getElapsedTime = useCallback(() => {
    if (!challengeState.solving.isActive || !challengeState.solving.timeStarted) {
      return 0;
    }
    return Date.now() - challengeState.solving.timeStarted;
  }, [challengeState.solving.isActive, challengeState.solving.timeStarted]);

  return {
    // State
    challenges: challengeState.challenges.data?.items || [],
    totalChallenges: challengeState.challenges.data?.total || 0,
    lessonChallenges: challengeState.lessonChallenges.data?.items || [],
    totalLessonChallenges: challengeState.lessonChallenges.data?.total || 0,
    currentChallenge: challengeState.currentChallenge.data,
    lastQuery: challengeState.challenges.lastQuery,
    currentLessonId: challengeState.lessonChallenges.lessonId,

    // Solving session state
    isSolving: challengeState.solving.isActive,
    solvingTimeStarted: challengeState.solving.timeStarted,
    solvingAttemptCount: challengeState.solving.attemptCount,

    // Loading states
    isLoading,
    isLoadingChallenges: challengeState.challenges.isLoading,
    isLoadingLessonChallenges: challengeState.lessonChallenges.isLoading,
    isLoadingCurrentChallenge: challengeState.currentChallenge.isLoading,
    isCreating: challengeState.operations.isCreating,
    isUpdating: challengeState.operations.isUpdating,
    isDeleting: challengeState.operations.isDeleting,
    isRestoring: challengeState.operations.isRestoring,

    // Error states
    hasError,
    challengesError: challengeState.challenges.error,
    lessonChallengesError: challengeState.lessonChallenges.error,
    currentChallengeError: challengeState.currentChallenge.error,
    createError: challengeState.operations.createError,
    updateError: challengeState.operations.updateError,
    deleteError: challengeState.operations.deleteError,
    restoreError: challengeState.operations.restoreError,

    // Actions
    fetchChallenges,
    fetchChallengeById,
    fetchChallengesByLesson,
    createNewChallenge,
    updateExistingChallenge,
    deleteExistingChallenge,
    restoreDeletedChallenge,
    clearAllChallenges,
    selectChallenge,
    startChallengeSolving,
    stopChallengeSolving,
    recordAttempt,
    clearErrors,
    resetState,

    // Utilities
    getElapsedTime,
  };
};