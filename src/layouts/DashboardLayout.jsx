import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import useActivityTracker from '../hooks/useActivityTracker';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Activate continuous activity telemetry across the application
  useActivityTracker();

  // Helper to derive a clean page title from path
  const getPageTitle = (path) => {
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/attendance')) return 'Attendance & Telemetry';
    if (path.includes('/notes')) return 'AI Handwritten Missed Notes';
    if (path.includes('/courses')) return 'Courses & Advanced Electives';
    if (path.includes('/certificates')) return 'Verified Certificates';
    if (path.includes('/resume')) return 'AI Resume Builder & ATS Scorer';
    if (path.includes('/code-editor')) return 'Interactive Code Sandbox';
    if (path.includes('/projects')) return 'Student Projects Portfolio';
    if (path.includes('/tests')) return 'Sprint Mock Tests';
    if (path.includes('/interview')) return 'AI Mock Interview Simulator';
    if (path.includes('/logins')) return 'Access & Login Logs';
    if (path.includes('/ai-assistant')) return 'EduPulse AI Academic Advisor';
    if (path.includes('/students')) return 'My Enrolled Students';
    if (path.includes('/student-logins')) return 'Student Activity & Logins';
    if (path.includes('/feedback-summary')) return 'High-Achiever Feedback Analysis';
    if (path.includes('/analytics')) return 'Faculty Performance Analytics';
    if (path.includes('/users')) return 'Platform User Directory';
    if (path.includes('/student-progress')) return 'Student Academic Trajectory';
    if (path.includes('/teacher-activity')) return 'Faculty Operations & Audits';
    if (path.includes('/timeline')) return 'Global Activity Timeline';
    return 'EduPulse AI';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          pageTitle={getPageTitle(location.pathname)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Persistent Floating AI Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default DashboardLayout;
