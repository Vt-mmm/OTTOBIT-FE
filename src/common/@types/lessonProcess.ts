/**
 * Lesson Process Types - Maps với Backend Entity
 */

/**
 * Base LessonProcess entity tương ứng với BE
 */
export interface LessonProcess {
  id: string;
  userId: string;
  mapId: string;
  completedAt: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

/**
 * Request để mark map completed
 */
export interface MarkCompletedRequest {
  mapId: string;
}

/**
 * Response từ API completed maps
 */
export interface CompletedMapsResponse {
  data: string[]; // Array of map IDs (Guid converted to string)
}

/**
 * Response từ API mark completed
 */
export interface MarkCompletedResponse {
  message: string;
}

/**
 * Lesson progress statistics
 */
export interface LessonProgressStats {
  totalMaps: number;
  completedMaps: number;
  completedMapIds: string[];
  progressPercentage: number;
  lastCompletedAt?: string;
}

/**
 * Map completion status
 */
export interface MapCompletionStatus {
  mapId: string;
  mapKey: string;
  isCompleted: boolean;
  completedAt?: string;
}

/**
 * API call options for lesson process
 */
export interface LessonProcessApiCallOptions {
  skipCache?: boolean;
  timeout?: number;
}