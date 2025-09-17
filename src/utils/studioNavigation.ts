/**
 * Utility functions for Studio navigation and challenge loading
 */

export interface StudioNavigationData {
  challengeId: string;
  challengeTitle?: string;
  lessonId?: string;
  source?: 'lesson' | 'direct';
}

/**
 * Parse challenge ID from URL and get navigation context
 */
export const parseStudioNavigation = (
  challengeId?: string,
  searchParams?: URLSearchParams
): StudioNavigationData | null => {
  // Check if challengeId is provided in URL params
  if (challengeId) {
    return {
      challengeId,
      source: 'lesson'
    };
  }

  // Check query parameters for challenge info
  const queryChallenge = searchParams?.get('challenge');
  const queryLesson = searchParams?.get('lesson');
  
  if (queryChallenge) {
    return {
      challengeId: queryChallenge,
      lessonId: queryLesson || undefined,
      source: 'lesson'
    };
  }

  return null;
};

/**
 * Store navigation data for studio access
 */
export const storeStudioNavigationData = (data: StudioNavigationData) => {
  try {
    const studioData = {
      ...data,
      timestamp: Date.now(),
    };
    
    sessionStorage.setItem('studio_navigation_data', JSON.stringify(studioData));
    
    // Also store in localStorage as backup
    localStorage.setItem('studio_last_challenge', data.challengeId);
    
    return true;
  } catch (error) {
    console.error('Failed to store studio navigation data:', error);
    return false;
  }
};

/**
 * Get stored navigation data
 */
export const getStoredNavigationData = (): StudioNavigationData | null => {
  try {
    const stored = sessionStorage.getItem('studio_navigation_data');
    if (!stored) return null;

    const data = JSON.parse(stored);
    
    // Check if data is not too old (1 hour)
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - data.timestamp > oneHour) {
      sessionStorage.removeItem('studio_navigation_data');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get stored navigation data:', error);
    sessionStorage.removeItem('studio_navigation_data');
    return null;
  }
};

/**
 * Clear navigation data
 */
export const clearNavigationData = () => {
  try {
    sessionStorage.removeItem('studio_navigation_data');
    localStorage.removeItem('studio_last_challenge');
  } catch (error) {
    console.error('Failed to clear navigation data:', error);
  }
};

/**
 * Generate studio URL with challenge ID
 */
export const generateStudioUrl = (challengeId: string, lessonId?: string): string => {
  const baseUrl = `/studio/${challengeId}`;
  
  if (lessonId) {
    return `${baseUrl}?lesson=${lessonId}`;
  }
  
  return baseUrl;
};

/**
 * Navigate to studio with challenge
 */
export const navigateToStudio = (navigate: any, challengeId: string, lessonId?: string) => {
  // Store navigation data
  storeStudioNavigationData({
    challengeId,
    lessonId,
    source: 'lesson'
  });

  // Generate and navigate to URL
  const url = generateStudioUrl(challengeId, lessonId);
  navigate(url);
};