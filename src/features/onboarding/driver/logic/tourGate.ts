export const isFirstLessonFirstChallenge = (
  lessonOrder?: number,
  challengeOrder?: number,
) => lessonOrder === 1 && challengeOrder === 1;

export const shouldShowStudioTour = (args: {
  courseId?: string;
  lessonOrder?: number;
  challengeOrder?: number;
}): boolean => {
  const { courseId, lessonOrder, challengeOrder } = args;
  if (!courseId) return false;
  if (!isFirstLessonFirstChallenge(lessonOrder, challengeOrder)) return false;
  return true;
};
