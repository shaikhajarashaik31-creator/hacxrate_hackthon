import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowLeft, Home, LogIn, Code2, Compass } from 'lucide-react';

export function NotFound() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const homeRoute = isAuthenticated && user ? `/${user.role}/dashboard` : '/login';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl font-black tracking-tight text-white">EduPulse</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI
            </span>
          </div>
        </Link>

        <Link
          to="/editor"
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-semibold transition"
        >
          <Code2 className="w-4 h-4 text-amber-400" />
          <span>Code Editor</span>
        </Link>
      </header>

      {/* Center 404 Hero */}
      <main className="relative z-10 max-w-xl w-full mx-auto text-center my-auto py-12 px-4 space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wider uppercase animate-fade-in">
          <Compass className="w-3.5 h-3.5 animate-spin-slow text-indigo-400" />
          <span>Error 404 &bull; Navigation Telemetry Alert</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The page or route you were trying to access does not exist, was moved, or has expired after session sign out.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to={homeRoute}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
          >
            {isAuthenticated ? (
              <>
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Go to Sign In</span>
              </>
            )}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-500 py-4 border-t border-slate-800/60 max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>EduPulse AI &copy; 2026 Academic Telemetry Platform</p>
        <div className="flex items-center space-x-4 text-slate-400">
          <Link to="/login" className="hover:text-indigo-400 transition">Sign In</Link>
          <span>&bull;</span>
          <Link to="/signup" className="hover:text-indigo-400 transition">Sign Up</Link>
          <span>&bull;</span>
          <Link to="/editor" className="hover:text-indigo-400 transition">Code Studio</Link>
        </div>
      </footer>
    </div>
  );
}

export default NotFound;
