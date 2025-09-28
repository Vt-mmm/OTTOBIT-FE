import { useEffect } from 'react';
import { useDriverTour } from '../hooks/useDriverTour';
import { studioTourSteps } from '../steps/studio/studioTour.steps';
import { hasShownForCourse, markShownForCourse } from '../logic/storage';
import { shouldShowStudioTour } from '../logic/tourGate';

export type StudioTourGateProps = {
  courseId: string;
  lessonOrder: number;
  challengeOrder: number;
  userId?: string;
};

export function StudioTourGate({ courseId, lessonOrder, challengeOrder, userId }: StudioTourGateProps) {
  const gate = shouldShowStudioTour({ courseId, lessonOrder, challengeOrder });
  const already = hasShownForCourse(courseId, userId);
  const enabled = gate && !already;

  const tour = useDriverTour({
    enabled,
    steps: studioTourSteps,
    config: { allowClose: true },
    waitMs: 200,
  });

  useEffect(() => {
    if (!enabled) return;

    // Mark as shown when destroyed
    const prev = tour.getConfig().onDestroyed;
    tour.setConfig({
      ...tour.getConfig(),
      onDestroyed: (element?: Element, step?: any, options?: any) => {
        markShownForCourse(courseId, userId);
        prev?.(element, step as any, options as any);
      },
    });
  }, [enabled, courseId, userId, tour]);

  // Manual re-run support via window event
  
  // Start the tour when a global event is dispatched
  // window.dispatchEvent(new CustomEvent('studio-tour:run'))
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handler = () => {
      try {
        tour.drive();
      } catch {}
    };
    window.addEventListener('studio-tour:run', handler);
    return () => window.removeEventListener('studio-tour:run', handler);
  }, [tour]);

  return null;
}

export default StudioTourGate;
