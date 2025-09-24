import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Configures the Mock Service Worker (MSW) for browser environments.
 * It uses the handlers defined in `handlers.js` to intercept and mock
 * API requests during development.
 */
export const worker = setupWorker(...handlers);