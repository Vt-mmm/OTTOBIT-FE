/**
 * Hook for Challenge Data management  
 * Provides challenge data from backend via Redux
 */

import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/config";
import { parseJsonSafely, parseAllChallengeJsons } from "../converters";
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
      console.log('🔍 findChallengeById debug:', {
        challengeId,
        currentChallengeId: currentChallenge.data?.id,
        hasCurrentChallenge: !!currentChallenge.data,
        allChallengesCount: challenges.data?.items?.length || 0,
        lessonChallengesCount: lessonChallenges.data?.items?.length || 0,
        allChallengeIds: challenges.data?.items?.map(c => c.id.slice(-8)) || [],
        lessonChallengeIds: lessonChallenges.data?.items?.map(c => c.id.slice(-8)) || [],
        targetIdSuffix: challengeId.slice(-8)
      });
      
      // Check current challenge first
      if (currentChallenge.data?.id === challengeId) {
        console.log('✅ Found in currentChallenge');
        return currentChallenge.data;
      }

      // Check all challenges - fix property access
      if (challenges.data?.items) {
        const found = challenges.data.items.find((challenge) => challenge.id === challengeId);
        if (found) {
          console.log('✅ Found in challenges.data.items');
          return found;
        }
      }

      // Check lesson challenges - fix property access
      if (lessonChallenges.data?.items) {
        const found = lessonChallenges.data.items.find((challenge) => challenge.id === challengeId);
        if (found) {
          console.log('✅ Found in lessonChallenges.data.items');
          return found;
        }
      }

      console.log('❌ Challenge not found in any Redux store');
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
    (challengeId: string, challengeData?: ChallengeResult): any | null => {
      // ✅ Use provided challengeData first (fresh from API), then fallback to Redux store
      const challenge = challengeData || findChallengeById(challengeId);
      
      console.log('🗺️ getMapJsonFromChallenge debug:', {
        challengeId,
        hasProvidedData: !!challengeData,
        hasChallenge: !!challenge,
        challengeKeys: challenge ? Object.keys(challenge) : [],
        hasMapJson: !!(challenge as any)?.mapJson,
        mapJsonLength: (challenge as any)?.mapJson?.length || 0,
        mapJsonSample: (challenge as any)?.mapJson ? (challenge as any).mapJson.substring(0, 100) : 'N/A'
      });
      
      if (!challenge) {
        console.log('❌ No challenge data available from either source');
        return null;
      }

      // ✅ NEW: Use mapJson from backend response (populated by AutoMapper)
      if (challenge.mapJson) {
        const result = parseJsonSafely(challenge.mapJson);
        console.log('🗺️ mapJson parsing result:', {
          success: result.success,
          hasData: !!result.data,
          error: result.error
        });
        return result.success ? result.data : null;
      }
      
      // ❌ FALLBACK: Use challengeJson if mapJson not available (for backwards compatibility)
      if (challenge.challengeJson) {
        const result = parseJsonSafely(challenge.challengeJson);
        return result.success ? result.data : null;
      }
      
      return null;
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
    (challengeId: string, challengeData?: ChallengeResult) => {
      // ✅ Use provided challengeData first, then fallback to Redux store
      const challenge = challengeData || findChallengeById(challengeId);
      if (!challenge) return null;

      return parseAllChallengeJsons({
        mapJson: challenge.mapJson || '', // ✅ Use mapJson from backend response
        challengeJson: challenge.challengeJson,
        solutionJson: challenge.solutionJson || '', // Handle undefined case
      });
    },
    [findChallengeById]
  );

  // Auto-load challenge by ID if needed
  const ensureChallengeLoaded = useCallback(
    async (challengeId: string): Promise<ChallengeResult | null> => {
      const existingChallenge = findChallengeById(challengeId);
      
      // 🔍 Debug: Check if existing challenge has required data
      const hasMapJson = !!(existingChallenge as any)?.mapJson;
      const hasChallengeJson = !!(existingChallenge as any)?.challengeJson;
      
      console.log('🗺 ensureChallengeLoaded debug:', {
        challengeId,
        hasExistingChallenge: !!existingChallenge,
        hasMapJson,
        hasChallengeJson,
        shouldFetchById: !hasMapJson || !hasChallengeJson
      });
      
      // 🚀 FORCE API call if existing challenge lacks mapJson or challengeJson
      if (existingChallenge && hasMapJson && hasChallengeJson) {
        setCurrentChallengeData(existingChallenge);
        return existingChallenge;
      }

      try {
        // 💲 ALWAYS fetch by ID to get complete data (mapJson + challengeJson)
        console.log('💲 Fetching challenge by ID for complete data:', challengeId);
        const result = await fetchChallengeById(challengeId);
        
        console.log('🔍 fetchChallengeById result debug:', {
          resultType: result.type,
          hasPayload: !!result.payload,
          payloadKeys: result.payload ? Object.keys(result.payload) : []
        });
        
        if (result.type === "challenge/getById/fulfilled") {
          const challengeData = result.payload as ChallengeResult;
          
          console.log('✅ Challenge fetched successfully, setting current challenge:', {
            challengeId: challengeData.id,
            hasMapJson: !!challengeData.mapJson,
            hasChallengeJson: !!challengeData.challengeJson
          });
          
          // ✅ CRITICAL FIX: Set current challenge data immediately
          setCurrentChallengeData(challengeData);
          
          // Wait longer for Redux state to properly update
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Verify that the challenge is now findable in Redux store
          const verifyChallenge = findChallengeById(challengeId);
          console.log('🔍 Verification after Redux update:', {
            challengeFound: !!verifyChallenge,
            currentChallengeInStore: verifyChallenge?.id === challengeId
          });
          
          // Return the challenge data regardless of verification
          // because we have the fresh data from API
          return challengeData;
        }
        
        console.error('❌ fetchChallengeById failed or was rejected:', result);
        return null;
      } catch (error) {
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