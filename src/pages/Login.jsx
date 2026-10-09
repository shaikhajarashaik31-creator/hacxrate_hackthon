import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  GraduationCap,
  Users,
  Code2,
  ChevronRight
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { user, redirectUrl } = await login(email, password);
      navigate(redirectUrl || `/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Left Brand Panel */}
      <div className="md:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-indigo-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center">
                EduPulse <span className="ml-1.5 px-2 py-0.5 text-xs bg-white/20 rounded-full">AI</span>
              </h2>
              <p className="text-xs text-indigo-200">Autonomous Student Analytics & Telemetry</p>
            </div>
          </div>

          <Link
            to="/editor"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-sm transition text-white"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Editor</span>
          </Link>
        </div>

        {/* Center Tagline & Highlights */}
        <div className="relative z-10 my-8 space-y-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-100 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" /> Hackathon Edition 2026
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Track the pulse of every student's success.
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-lg">
            Harness real-time attendance telemetry, AI handwritten missed lecture note synthesis, instant ATS resume evaluation, and interactive code sandboxes in one unified platform.
          </p>

          {/* Quick Access Portal Cards */}
          <div className="pt-2">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2.5">
              Direct Role Access Portals:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <Link
                to="/login/student"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <GraduationCap className="w-4 h-4 text-sky-300" />
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 transition" />
                </div>
                <div>
                  <div className="font-bold text-white">Student Hub</div>
                  <div className="text-[11px] text-indigo-200">Notes, Coins, Practice</div>
                </div>
              </Link>

              <Link
                to="/login/faculty"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Users className="w-4 h-4 text-emerald-300" />
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 transition" />
                </div>
                <div>
                  <div className="font-bold text-white">Faculty Portal</div>
                  <div className="text-[11px] text-indigo-200">Rosters & Triage</div>
                </div>
              </Link>

              <Link
                to="/login/admin"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-violet-300" />
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 transition" />
                </div>
                <div>
                  <div className="font-bold text-white">Admin Console</div>
                  <div className="text-[11px] text-indigo-200">Governance & Audits</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 flex items-center justify-between text-xs text-indigo-200/70 pt-2 border-t border-white/10">
          <span>EduPulse AI Platform &copy; 2026</span>
          <Link to="/editor" className="text-indigo-200 hover:text-white underline transition">
            Launch Standalone Editor
          </Link>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Sign in</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your role portal above or log in directly with your account credentials.
            </p>
          </div>

          {/* Quick Portal Switcher Pills */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <Link
              to="/login/student"
              className="py-1.5 px-2 rounded-lg text-center hover:bg-white hover:text-indigo-600 hover:shadow-xs transition flex items-center justify-center space-x-1"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </Link>
            <Link
              to="/login/faculty"
              className="py-1.5 px-2 rounded-lg text-center hover:bg-white hover:text-emerald-600 hover:shadow-xs transition flex items-center justify-center space-x-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Faculty</span>
            </Link>
            <Link
              to="/login/admin"
              className="py-1.5 px-2 rounded-lg text-center hover:bg-white hover:text-violet-600 hover:shadow-xs transition flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.edu or @teacher.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to EduPulse'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              1-Click Demo Accounts (Unique Individual Passwords)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('alex.chen@student.edu', 'Alex@2026#CS01')}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-600">Alex Chen (Student)</div>
                <div className="text-[11px] text-slate-500">alex.chen@student.edu</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('rahul.sharma@student.edu', 'Rahul@2026#CS05')}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-600">Rahul (Missed Notes)</div>
                <div className="text-[11px] text-slate-500">rahul.sharma@student.edu</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('sarah.jenkins@teacher.edu', 'Sarah@2026#Prof')}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-emerald-700">Prof. Sarah (Faculty)</div>
                <div className="text-[11px] text-slate-500">sarah.jenkins@teacher.edu</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@admin.edu', 'Admin@2026#Edu')}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-violet-700">Dr. Arthur (Admin)</div>
                <div className="text-[11px] text-slate-500">admin@admin.edu</div>
              </button>
            </div>
          </div>

          {/* Quick link to Editor */}
          <div className="pt-2 text-center">
            <Link
              to="/editor"
              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 space-x-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Or try the Interactive Code Editor directly &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
