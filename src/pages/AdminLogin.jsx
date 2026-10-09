import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Activity,
  Users,
  KeyRound,
  ShieldAlert,
  Code2,
  ChevronLeft,
  Server,
  Fingerprint
} from 'lucide-react';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Administrative credentials are required to continue');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { user, redirectUrl } = await login(email, password);
      if (user.role !== 'admin') {
        navigate(redirectUrl || `/${user.role}/dashboard`, { replace: true });
      } else {
        navigate(redirectUrl || '/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Administrative authentication failed. Unauthorized access prohibited.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 font-sans text-slate-100">
      {/* Left Administration Showcase Banner */}
      <div className="md:w-1/2 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-violet-900/40">
        {/* Cybersecurity neon grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/login" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/10 backdrop-blur-md border border-violet-500/30 flex items-center justify-center shadow-lg group-hover:bg-violet-500/20 transition">
              <ShieldCheck className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-white">EduPulse</span>
                <span className="px-2 py-0.5 text-xs bg-violet-500/30 text-violet-300 rounded-full border border-violet-500/40 font-semibold tracking-wider">ADMIN</span>
              </div>
              <p className="text-xs text-slate-400">Platform Governance & Audit System</p>
            </div>
          </Link>

          <Link
            to="/editor"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-violet-500/30 text-xs font-semibold backdrop-blur-sm transition text-violet-200"
          >
            <Code2 className="w-3.5 h-3.5 text-violet-400" />
            <span>Open Code Editor</span>
          </Link>
        </div>

        {/* Center Admin Security Features */}
        <div className="relative z-10 my-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-900/50 text-violet-200 border border-violet-700/50">
            <Fingerprint className="w-3.5 h-3.5 text-violet-400" />
            <span>Restricted Access Level 0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Institutional governance, auditability, and telemetry.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Complete institutional control across faculty rosters, student progression trends, active IP login sessions, and platform coin circulation mechanics.
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-violet-900/40 text-xs">
            <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-violet-500/20 backdrop-blur-sm">
              <Users className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">User Management</div>
                <div className="text-[11px] text-slate-400">Role administration & resets</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-violet-500/20 backdrop-blur-sm">
              <Activity className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Activity Timeline</div>
                <div className="text-[11px] text-slate-400">Real-time audit log stream</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-violet-500/20 backdrop-blur-sm">
              <Server className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Platform Economy</div>
                <div className="text-[11px] text-slate-400">Total coin treasury metrics</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-violet-500/20 backdrop-blur-sm">
              <KeyRound className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Session Security</div>
                <div className="text-[11px] text-slate-400">JWT token & IP enforcement</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Switchers */}
        <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-4 border-t border-violet-900/40">
          <span>EduPulse AI Governance &copy; 2026</span>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <Link to="/login/student" className="hover:text-slate-200 underline transition">Student Login</Link>
            <span>&bull;</span>
            <Link to="/login/faculty" className="hover:text-slate-200 underline transition">Faculty Login</Link>
          </div>
        </div>
      </div>

      {/* Right Admin Sign In Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-900">
        <div className="w-full max-w-md space-y-7">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5" /> All Portals
              </Link>
              <span className="text-xs px-2.5 py-0.5 bg-violet-950 border border-violet-700/60 text-violet-300 font-bold rounded-full">
                Administrator Access
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">System Admin Console</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Elevated access requires institutional administrator credentials.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Administrative Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authorizing Console...' : 'Authenticate Admin Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Admin Account */}
          <div className="pt-5 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Admin Demo Profile</span>
              <span className="text-[10px] text-violet-400 normal-case font-semibold">1-Click Elevate</span>
            </p>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@admin.edu', 'Admin@2026#Edu')}
              className="w-full text-left p-3.5 rounded-xl border border-violet-900/50 bg-slate-950/70 hover:border-violet-500 hover:bg-violet-950/30 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white group-hover:text-violet-300">Dr. Arthur Pendelton</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-900 text-violet-200 font-bold border border-violet-700">Platform Dean</span>
              </div>
              <div className="text-[11px] text-slate-400">admin@admin.edu &bull; Full governance & user management privileges</div>
            </button>
          </div>

          {/* Switchers */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Other Access Portals:</span>
            <div className="flex items-center space-x-3">
              <Link to="/login/student" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
                Student
              </Link>
              <span>&bull;</span>
              <Link to="/login/faculty" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">
                Faculty
              </Link>
              <span>&bull;</span>
              <Link to="/editor" className="text-amber-400 hover:text-amber-300 font-semibold hover:underline">
                Editor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
