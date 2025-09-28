const KEY = (courseId: string, userId?: string) =>
  `ottobit:tour:studio:shown:${courseId}${userId ? `:u:${userId}` : ''}`;

export const hasShownForCourse = (courseId: string, userId?: string): boolean => {
  try {
    return localStorage.getItem(KEY(courseId, userId)) === '1';
  } catch {
    return true; // fail-closed to avoid spamming tour in restricted envs
  }
};

export const markShownForCourse = (courseId: string, userId?: string): void => {
  try {
    localStorage.setItem(KEY(courseId, userId), '1');
  } catch {}
};
