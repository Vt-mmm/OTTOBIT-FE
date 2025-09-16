/**
 * Hook for Challenge Data management  
 * Provides challenge data from backend via Redux
 */

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { getSafeMapData, parseJsonSafely, parseAllChallengeJsons } from "../converters";
import { 
  getChallenges, 
  getChallengeById,
  getChallengesByLesson,
  setCurrentChallenge,
  clearChallenges,
  clearChallengeErrors,
  resetChallengeState
} from "../../../redux/challenge/challengeSlice";
import { ChallengeResult, GetChallengesRequest } from "../../../common/@types/challenge";

export function useChallengeData() {
  const dispatch = useAppDispatch();
  const challengeState = useAppSelector((state) => state.challenge);
  // Direct import from converters - no hooks needed

  // Selectors với memoization
  const challenges = useMemo(() => challengeState.challenges, [challengeState.challenges]);
  const lessonChallenges = useMemo(() => challengeState.lessonChallenges, [challengeState.lessonChallenges]);
  const currentChallenge = useMemo(() => challengeState.currentChallenge, [challengeState.currentChallenge]);

  // Loading states
  const isLoadingChallenges = useMemo(() => challenges.isLoading, [challenges.isLoading]);
  const isLoadingLessonChallenges = useMemo(() => lessonChallenges.isLoading, [lessonChallenges.isLoading]);
  const isLoadingCurrentChallenge = useMemo(() => currentChallenge.isLoading, [currentChallenge.isLoading]);
  const isLoading = useMemo(
    () => isLoadingChallenges || isLoadingLessonChallenges || isLoadingCurrentChallenge,
    [isLoadingChallenges, isLoadingLessonChallenges, isLoadingCurrentChallenge]
  );

  // Error states
  const hasError = useMemo(
    () => Boolean(challenges.error || lessonChallenges.error || currentChallenge.error),
    [challenges.error, lessonChallenges.error, currentChallenge.error]
  );

  // Actions
  const fetchChallenges = useCallback(
    (params: GetChallengesRequest = {}) => {
      return dispatch(getChallenges(params));
    },
    [dispatch]
  );

  const fetchChallengesByLesson = useCallback(
    (lessonId: string, pageNumber = 1, pageSize = 100) => {
      return dispatch(getChallengesByLesson({ lessonId, pageNumber, pageSize }));
    },
    [dispatch]
  );

  const fetchChallengeById = useCallback(
    (challengeId: string) => {
      return dispatch(getChallengeById(challengeId));
    },
    [dispatch]
  );

  const setCurrentChallengeData = useCallback(
    (challenge: ChallengeResult) => {
      dispatch(setCurrentChallenge(challenge));
    },
    [dispatch]
  );

  const clearChallengesData = useCallback(() => {
    dispatch(clearChallenges());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearChallengeErrors());
  }, [dispatch]);

  const resetChallenges = useCallback(() => {
    dispatch(resetChallengeState());
  }, [dispatch]);

  // Helper functions
  const findChallengeById = useCallback(
    (challengeId: string): ChallengeResult | null => {
      console.log('🔍 findChallengeById called with:', challengeId);
      console.log('🔍 Current challenge state:', {
        hasCurrentChallenge: !!currentChallenge.data,
        currentChallengeId: currentChallenge.data?.id,
        matchesTarget: currentChallenge.data?.id === challengeId
      });
      
      // Check current challenge first
      if (currentChallenge.data?.id === challengeId) {
        console.log('✅ Found challenge in currentChallenge');
        return currentChallenge.data;
      }

      // Check all challenges - fix property access
      if (challenges.data?.items) {
        const found = challenges.data.items.find((challenge) => challenge.id === challengeId);
        if (found) {
          console.log('✅ Found challenge in challenges.items');
          return found;
        }
      }

      // Check lesson challenges - fix property access
      if (lessonChallenges.data?.items) {
        const found = lessonChallenges.data.items.find((challenge) => challenge.id === challengeId);
        if (found) {
          console.log('✅ Found challenge in lessonChallenges.items');
          return found;
        }
      }

      console.log('❌ Challenge not found in any collection:', {
        challengesCount: challenges.data?.items?.length || 0,
        lessonChallengesCount: lessonChallenges.data?.items?.length || 0,
        hasCurrentChallenge: !!currentChallenge.data
      });
      return null;
    },
    [currentChallenge.data, challenges.data, lessonChallenges.data]
  );

  const getChallengesByDifficulty = useCallback(
    (difficulty: number) => {
      const allChallengesList = [
        ...(challenges.data?.items || []),
        ...(lessonChallenges.data?.items || [])
      ];
      
      return allChallengesList.filter((challenge) => challenge.difficulty === difficulty);
    },
    [challenges.data, lessonChallenges.data]
  );

  const getMapJsonFromChallenge = useCallback(
    (challengeId: string): any | null => {
      console.log('💾 Getting map JSON for challenge:', challengeId);
      
      const challenge = findChallengeById(challengeId);
      console.log('💾 Challenge found:', {
        found: !!challenge,
        hasMapJson: !!challenge?.mapJson,
        mapJsonType: typeof challenge?.mapJson,
        mapJsonLength: challenge?.mapJson?.length || 0,
        mapJsonSample: challenge?.mapJson?.substring(0, 50) || 'N/A'
      });
      
      if (!challenge?.mapJson) {
        console.error('❌ No challenge or mapJson found:', {
          challengeExists: !!challenge,
          mapJsonExists: !!challenge?.mapJson
        });
        return null;
      }

      const safeMapData = getSafeMapData(challenge.mapJson);
      console.log('💾 Safe map data result:', {
        success: !!safeMapData,
        data: safeMapData ? {
          width: safeMapData.width,
          height: safeMapData.height,
          hasLayers: !!safeMapData.layers
        } : null
      });
      
      return safeMapData;
    },
    [findChallengeById]
  );

  const getChallengeJsonFromChallenge = useCallback(
    (challengeId: string): any | null => {
      const challenge = findChallengeById(challengeId);
      if (!challenge?.challengeJson) return null;

      const result = parseJsonSafely(challenge.challengeJson);
      return result.success ? result.data : null;
    },
    [findChallengeById]
  );

  const getSolutionJsonFromChallenge = useCallback(
    (challengeId: string): any | null => {
      const challenge = findChallengeById(challengeId);
      if (!challenge?.solutionJson) return null;

      const result = parseJsonSafely(challenge.solutionJson);
      return result.success ? result.data : null;
    },
    [findChallengeById]
  );

  const getAllJsonsFromChallenge = useCallback(
    (challengeId: string) => {
      const challenge = findChallengeById(challengeId);
      if (!challenge) return null;

      return parseAllChallengeJsons({
        mapJson: challenge.mapJson,
        challengeJson: challenge.challengeJson,
        solutionJson: challenge.solutionJson,
      });
    },
    [findChallengeById]
  );

  // Auto-load challenge by ID if needed
  const ensureChallengeLoaded = useCallback(
    async (challengeId: string): Promise<ChallengeResult | null> => {
      console.log('🔄 ensureChallengeLoaded called for:', challengeId);
      
      const existingChallenge = findChallengeById(challengeId);
      if (existingChallenge) {
        console.log('✅ Challenge found in existing data, setting as current');
        setCurrentChallengeData(existingChallenge);
        return existingChallenge;
      }

      try {
        console.log('🚀 Fetching challenge from API:', challengeId);
        // Try to fetch by ID
        const result = await fetchChallengeById(challengeId);
        console.log('🚀 Fetch result:', {
          type: result.type,
          hasPayload: !!result.payload,
          payloadId: (result.payload as any)?.id
        });
        
        if (result.type === "challenge/getById/fulfilled") {
          const challengeData = result.payload as ChallengeResult;
          console.log('✅ Challenge fetched successfully, setting as current:', challengeData.id);
          setCurrentChallengeData(challengeData);
          
          // Wait a bit for Redux state to update
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Verify that the challenge is now findable
          const verifyChallenge = findChallengeById(challengeId);
          if (!verifyChallenge) {
            console.warn('⚠️ Challenge not found after setting, returning fetched data directly');
            return challengeData;
          }
          
          return challengeData;
        }
        
        console.error('❌ Fetch result type not fulfilled:', result.type);
        return null;
      } catch (error) {
        console.error('❌ Error loading challenge:', error);
        return null;
      }
    },
    [findChallengeById, setCurrentChallengeData, fetchChallengeById]
  );

  return {
    // State
    challenges: challenges.data,
    lessonChallenges: lessonChallenges.data,
    currentChallenge: currentChallenge.data,

    // Loading & Error states
    isLoading,
    isLoadingChallenges,
    isLoadingLessonChallenges,
    isLoadingCurrentChallenge,
    hasError,
    challengesError: challenges.error,
    lessonChallengesError: lessonChallenges.error,
    currentChallengeError: currentChallenge.error,

    // Actions
    fetchChallenges,
    fetchChallengesByLesson,
    fetchChallengeById,
    setCurrentChallengeData,
    clearChallengesData,
    clearErrors,
    resetChallenges,

    // Helpers
    findChallengeById,
    getChallengesByDifficulty,
    getMapJsonFromChallenge,
    getChallengeJsonFromChallenge,
    getSolutionJsonFromChallenge,
    getAllJsonsFromChallenge,
    ensureChallengeLoaded,

    // Solving state
    solving: challengeState.solving,
    operations: challengeState.operations,
  };
}