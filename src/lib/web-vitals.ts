/**
 * Client-side Web Vitals collection using PerformanceObserver.
 * Collects LCP, CLS, FCP, and TTFB. INP replaces FID in modern browsers.
 */

export interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
}

interface VitalThresholds {
  good: number;
  poor: number;
  unit: string;
  fullName: string;
}

const THRESHOLDS: Record<string, VitalThresholds> = {
  LCP: { good: 2500, poor: 4000, unit: 'ms', fullName: 'Largest Contentful Paint' },
  FCP: { good: 1800, poor: 3000, unit: 'ms', fullName: 'First Contentful Paint' },
  CLS: { good: 0.1, poor: 0.25, unit: '', fullName: 'Cumulative Layout Shift' },
  INP: { good: 200, poor: 500, unit: 'ms', fullName: 'Interaction to Next Paint' },
  TTFB: { good: 800, poor: 1800, unit: 'ms', fullName: 'Time to First Byte' },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = THRESHOLDS[name];
  if (!t) return 'good';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

export function getVitalThresholds() {
  return THRESHOLDS;
}

export function collectWebVitals(): Promise<VitalMetric[]> {
  return new Promise((resolve) => {
    const metrics: VitalMetric[] = [];
    let resolved = false;

    function tryResolve() {
      if (!resolved && metrics.length >= 3) {
        resolved = true;
        resolve(metrics);
      }
    }

    // Timeout after 5s — return whatever we have
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(metrics);
      }
    }, 5000);

    // TTFB from navigation timing
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        const ttfb = Math.round(nav.responseStart - nav.requestStart);
        if (ttfb > 0) {
          metrics.push({
            name: 'TTFB',
            value: ttfb,
            rating: getRating('TTFB', ttfb),
            unit: 'ms',
          });
        }

        // FCP approximation from navigation timing
        const fcp = Math.round(nav.domContentLoadedEventStart - nav.fetchStart);
        if (fcp > 0) {
          metrics.push({
            name: 'FCP',
            value: fcp,
            rating: getRating('FCP', fcp),
            unit: 'ms',
          });
        }
      }
    } catch {
      // Navigation timing not available
    }

    // LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          const value = Math.round(last.startTime);
          metrics.push({
            name: 'LCP',
            value,
            rating: getRating('LCP', value),
            unit: 'ms',
          });
          tryResolve();
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // LCP not supported
    }

    // CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput && layoutShift.value) {
            clsValue += layoutShift.value;
          }
        }
        // Update or add CLS
        const existing = metrics.find(m => m.name === 'CLS');
        const rounded = Math.round(clsValue * 1000) / 1000;
        if (existing) {
          existing.value = rounded;
          existing.rating = getRating('CLS', rounded);
        } else {
          metrics.push({
            name: 'CLS',
            value: rounded,
            rating: getRating('CLS', rounded),
            unit: '',
          });
        }
        tryResolve();
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // CLS not supported
    }

    // INP
    try {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry & { duration?: number };
        if (last?.duration) {
          const value = Math.round(last.duration);
          const existing = metrics.find(m => m.name === 'INP');
          if (existing) {
            existing.value = Math.max(existing.value, value);
            existing.rating = getRating('INP', existing.value);
          } else {
            metrics.push({
              name: 'INP',
              value,
              rating: getRating('INP', value),
              unit: 'ms',
            });
          }
          tryResolve();
        }
      });
      inpObserver.observe({ type: 'event', buffered: true });
    } catch {
      // INP not supported
    }

    // Fallback resolve after collecting sync metrics
    setTimeout(tryResolve, 2000);
  });
}
