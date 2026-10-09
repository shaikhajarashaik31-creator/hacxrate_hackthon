import { useEffect, useRef } from 'react';

/**
 * Custom hook to poll a callback function at a regular interval (default 15 seconds)
 * Keeps dashboards and telemetry updated live without manual page reloads.
 * 
 * @param {Function} callback Async function to execute on each poll tick
 * @param {number} intervalMs Polling interval in milliseconds (default: 15000 = 15s)
 * @param {boolean} enabled Whether polling is active
 */
export function usePolling(callback, intervalMs = 15000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Run immediately once on mount/enable
    savedCallback.current?.();

    const intervalId = setInterval(() => {
      savedCallback.current?.();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [intervalMs, enabled]);
}

export default usePolling;
