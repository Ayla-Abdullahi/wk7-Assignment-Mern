// Frontend performance & error monitoring
import * as Sentry from '@sentry/react';
import { onCLS, onFID, onLCP } from 'web-vitals';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: import.meta.env.MODE, tracesSampleRate: 1.0 });
}

// Navigation Timing (TTFB)
window.addEventListener('load', () => {
  performance.getEntriesByType('navigation').forEach(nav => {
    const ttfb = nav.responseStart - nav.requestStart;
    console.log('TTFB', ttfb);
    Sentry.addBreadcrumb({ category: 'perf', message: `TTFB ${ttfb}`, level: 'info' });
  });
});

// Core Web Vitals
const logVital = (name, value) => {
  console.log(`${name}`, value);
  Sentry.addBreadcrumb({ category: 'web-vital', message: `${name} ${value}`, level: 'info' });
};
onCLS(v => logVital('CLS', v.value));
onFID(v => logVital('FID', v.value));
onLCP(v => logVital('LCP', v.value));
