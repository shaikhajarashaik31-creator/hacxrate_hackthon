import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Coins, User, Menu, Code2 } from 'lucide-react';

export function Navbar({ onToggleSidebar, pageTitle = 'Dashboard' }) {
  const { user, logout } = useAuth();

  const roleBadgeStyle = {
    student: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    teacher: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    admin: 'bg-violet-50 text-violet-700 border-violet-200'
  }[user?.role] || 'bg-slate-100 text-slate-700 border-slate-200';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Track the pulse of every student's success</p>
          </div>
        </div>

        {/* Right: Quick Editor, Coins (Student), Role Badge, Profile, Logout */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Quick Launch Code Editor */}
          <Link
            to="/editor"
            title="Launch Code Editor & Sandbox"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition"
          >
            <Code2 className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Editor</span>
          </Link>

          {/* Student Coins Pill */}
          {user?.role === 'student' && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm animate-pulse-slow">
              <Coins className="w-4 h-4 text-amber-600 fill-amber-400" />
              <span>{user?.coinBalance ?? 0}</span>
              <span className="hidden sm:inline text-amber-700 font-medium text-[11px]">Coins</span>
            </div>
          )}

          {/* Role Badge */}
          <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg border ${roleBadgeStyle}`}>
            {user?.role}
          </span>

          {/* User Avatar & Info */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-indigo-50">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Sign out of EduPulse"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
