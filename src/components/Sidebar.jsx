import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  BookOpen,
  Award,
  Sparkles,
  Code2,
  FolderGit2,
  FileCheck2,
  Mic,
  Clock,
  BotMessageSquare,
  Users,
  MessagesSquare,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Activity,
  X
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/student/risk-status', label: 'Risk Status', icon: ShieldAlert, badge: 'Triage' },
    { to: '/student/faculty-feedback', label: 'Faculty Feedback', icon: MessagesSquare, badge: 'Eval' },
    { to: '/student/notes', label: 'Notebook', icon: FileText, badge: 'Ink' },
    { to: '/student/courses', label: 'My Courses', icon: GraduationCap },
    { to: '/student/practice', label: 'Practice Arena', icon: Code2, badge: '40 Qs' },
    { to: '/student/tests', label: 'Mock Tests', icon: FileCheck2 },
    { to: '/student/interview', label: 'Mock Interview', icon: Mic, badge: 'AI' },
    { to: '/student/resume', label: 'Resume', icon: Sparkles, badge: 'ATS' },
    { to: '/student/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/student/code-editor', label: 'Code Editor', icon: Code2 },
    { to: '/student/coins', label: 'Coins', icon: Award, badge: 'Rewards' },
    { to: '/student/certificates', label: 'Certificates', icon: ShieldCheck },
    { to: '/student/ai-assistant', label: 'AI Mentor', icon: BotMessageSquare, badge: 'GPT' },
    { to: '/student/logins', label: 'My Logins', icon: Clock }
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/students', label: 'My Students', icon: Users },
    { to: '/teacher/student-logins', label: 'Student Logins', icon: Clock },
    { to: '/teacher/feedback-summary', label: 'Feedback Summary', icon: MessagesSquare, badge: 'AI' },
    { to: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/editor', label: 'Code Editor', icon: Code2, badge: 'IDE' }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'All Users', icon: Users },
    { to: '/admin/student-progress', label: 'Student Progress', icon: GraduationCap },
    { to: '/admin/teacher-activity', label: 'Teacher Activity', icon: ShieldCheck },
    { to: '/admin/timeline', label: 'Activity Timeline', icon: Activity },
    { to: '/editor', label: 'Code Studio', icon: Code2, badge: 'IDE' }
  ];

  let links = [];
  if (user?.role === 'teacher') links = teacherLinks;
  else if (user?.role === 'admin') links = adminLinks;
  else links = studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white">EduPulse</span>
              <span className="text-xs font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {user?.role === 'admin' ? 'Administration' : user?.role === 'teacher' ? 'Faculty Portal' : 'Student Hub'}
          </p>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-400/20 text-indigo-300">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer profile snippet */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role} Portal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
