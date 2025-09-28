import { useEffect, useMemo } from 'react';
import { driver, type Config, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../styles/driver.overrides.css';

export type UseDriverTourOptions = {
  enabled: boolean;
  steps: DriveStep[];
  config?: Omit<Config, 'steps'>;
  // Wait a bit for DOM stability before starting
  waitMs?: number;
};

export function useDriverTour({ enabled, steps, config, waitMs = 0 }: UseDriverTourOptions) {
  const mergedPopoverClass = ['studio-popover', (config as any)?.popoverClass].filter(Boolean).join(' ');

  const tour = useMemo(() => driver({
    showProgress: true,
    overlayClickBehavior: 'nextStep',
    smoothScroll: true,
    overlayOpacity: 0.08,
    popoverClass: mergedPopoverClass,
    ...config,
    steps,
  }), [steps, config, mergedPopoverClass]);

  useEffect(() => {
    if (!enabled) return;

    let attempts = 0;
    const maxAttempts = 6; // ~ up to ~3s with 500ms interval + initial wait

    const tryStart = () => {
      attempts++;
      // Filter steps that are currently present in DOM
      const available = steps.filter((s) => {
        const sel = typeof s.element === 'string' ? s.element : null;
        if (!sel) return true; // function/Element allowed
        return !!document.querySelector(sel);
      });
      if (available.length >= Math.max(1, Math.ceil(steps.length * 0.5))) {
        try {
          tour.setSteps(available as any);
        } catch {}
        tour.drive();
        return;
      }
      if (attempts < maxAttempts) {
        setTimeout(tryStart, 500);
      }
    };

    const t = setTimeout(tryStart, waitMs);
    return () => {
      clearTimeout(t);
      if (tour.isActive()) tour.destroy();
    };
  }, [enabled, steps, waitMs, tour]);

  return tour;
}
