import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export function useActivityTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const params = useParams();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!user) return;

    startTimeRef.current = Date.now();
    const pathname = location.pathname;

    // Detect context
    let eventType = 'page_view';
    let courseId = null;
    let testId = null;

    if (pathname.includes('/courses/') && params.id) {
      eventType = 'course_time';
      courseId = params.id;
    } else if (pathname.includes('/tests/') && params.id) {
      eventType = 'test_time';
      testId = params.id;
    }

    // Function to send telemetry
    const sendTelemetry = (durationSec) => {
      if (durationSec <= 2) return;
      api.post('/activity/track', {
        page: pathname,
        course_id: courseId,
        test_id: testId,
        event_type: eventType,
        duration_seconds: durationSec
      }).catch(() => {
        // Suppress background telemetry errors
      });
    };

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      sendTelemetry(30);
      startTimeRef.current = Date.now();
    }, 30000);

    // Unmount or route transition cleanup
    return () => {
      clearInterval(interval);
      const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (elapsedSeconds > 3) {
        sendTelemetry(elapsedSeconds);
      }
    };
  }, [location.pathname, params.id, user]);
}

export default useActivityTracker;
