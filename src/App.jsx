import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Core Pages
import Login from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';
import AdminLogin from './pages/AdminLogin';
import EditorLogin from './pages/EditorLogin';
import EditorPage from './pages/EditorPage';
import VerifyCertificate from './pages/VerifyCertificate';
import AIAssistant from './pages/AIAssistant';
import ChangePassword from './pages/ChangePassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Attendance from './pages/student/Attendance';
import FacultyFeedback from './pages/student/FacultyFeedback';
import MissedNotes from './pages/student/MissedNotes';
import RiskStatus from './pages/student/RiskStatus';
import CourseStore from './pages/student/CourseStore';
import Courses from './pages/student/Courses';
import LessonPlayer from './pages/student/LessonPlayer';
import PracticeArena from './pages/student/PracticeArena';
import Certificates from './pages/student/Certificates';
import Resume from './pages/student/Resume';
import CodeEditor from './pages/student/CodeEditor';
import Projects from './pages/student/Projects';
import MockTests from './pages/student/MockTests';
import MockInterview from './pages/student/MockInterview';
import Coins from './pages/student/Coins';
import MyLogins from './pages/student/MyLogins';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MyStudents from './pages/teacher/MyStudents';
import StudentLogins from './pages/teacher/StudentLogins';
import FeedbackSummary from './pages/teacher/FeedbackSummary';
import Analytics from './pages/teacher/Analytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllUsers from './pages/admin/AllUsers';
import StudentProgress from './pages/admin/StudentProgress';
import TeacherActivity from './pages/admin/TeacherActivity';
import ActivityTimeline from './pages/admin/ActivityTimeline';

export function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Login Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Dedicated Student Login Routes */}
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student-login" element={<StudentLogin />} />

      {/* Dedicated Faculty / Teacher Login Routes */}
      <Route path="/login/faculty" element={<FacultyLogin />} />
      <Route path="/faculty/login" element={<FacultyLogin />} />
      <Route path="/login/teacher" element={<FacultyLogin />} />
      <Route path="/teacher/login" element={<FacultyLogin />} />
      <Route path="/faculty-login" element={<FacultyLogin />} />

      {/* Dedicated Admin Login Routes */}
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Dedicated Editor Login Routes */}
      <Route path="/login/editor" element={<EditorLogin />} />
      <Route path="/editor/login" element={<EditorLogin />} />
      <Route path="/editor-login" element={<EditorLogin />} />

      {/* Public Standalone Code Editor Routes */}
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/code-editor" element={<EditorPage />} />

      {/* Public Certificate Verification Route */}
      <Route path="/verify/:code" element={<VerifyCertificate />} />

      {/* Change Password Route */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Student Protected Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="risk-status" element={<RiskStatus />} />
        <Route path="faculty-feedback" element={<FacultyFeedback />} />
        <Route path="notes" element={<MissedNotes />} />
        <Route path="course-store" element={<CourseStore />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id/learn" element={<LessonPlayer />} />
        <Route path="practice" element={<PracticeArena />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="resume" element={<Resume />} />
        <Route path="code-editor" element={<CodeEditor />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tests" element={<MockTests />} />
        <Route path="interview" element={<MockInterview />} />
        <Route path="coins" element={<Coins />} />
        <Route path="logins" element={<MyLogins />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="ai-mentor" element={<AIAssistant />} />
      </Route>

      {/* Teacher Protected Portal */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="students" element={<MyStudents />} />
        <Route path="student-logins" element={<StudentLogins />} />
        <Route path="feedback-summary" element={<FeedbackSummary />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Admin Protected Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AllUsers />} />
        <Route path="student-progress" element={<StudentProgress />} />
        <Route path="teacher-activity" element={<TeacherActivity />} />
        <Route path="timeline" element={<ActivityTimeline />} />
      </Route>

      {/* Global AI Assistant Direct Route */}
      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AIAssistant />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
