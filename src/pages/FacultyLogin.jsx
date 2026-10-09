import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  BarChart3,
  CalendarCheck,
  MessagesSquare,
  ShieldAlert,
  Code2,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

export function FacultyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your faculty email and password');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { user, redirectUrl } = await login(email, password);
      if (user.role !== 'teacher') {
        navigate(redirectUrl || `/${user.role}/dashboard`, { replace: true });
      } else {
        navigate(redirectUrl || '/teacher/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Faculty authentication failed. Verify your staff credentials.');
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
      {/* Left Faculty Showcase Banner */}
      <div className="md:w-1/2 bg-gradient-to-br from-emerald-800 via-teal-700 to-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/login" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:bg-white/20 transition">
              <Users className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-white">EduPulse</span>
                <span className="px-2 py-0.5 text-xs bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/30 font-semibold">FACULTY</span>
              </div>
              <p className="text-xs text-teal-200">Educator Portal & Classroom Analytics</p>
            </div>
          </Link>

          <Link
            to="/editor"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-sm transition text-white"
          >
            <Code2 className="w-3.5 h-3.5 text-teal-300" />
            <span>Open Code Editor</span>
          </Link>
        </div>

        {/* Center Educator Features */}
        <div className="relative z-10 my-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Real-Time Pedagogy & Risk Triage</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Empower educators with predictive student intelligence.
          </h1>

          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-lg">
            Monitor real-time student attendance telemetry, detect at-risk dropouts, automate missed lecture notes for absent cohorts, and evaluate AI feedback sentiment.
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-white/15 text-xs">
            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <ShieldAlert className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">At-Risk Triage</div>
                <div className="text-[11px] text-teal-200">Instant flags for &lt;80% attendance</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <CalendarCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Live Attendance</div>
                <div className="text-[11px] text-teal-200">One-tap bulk lecture marking</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <MessagesSquare className="w-4 h-4 text-sky-300 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Feedback Summary</div>
                <div className="text-[11px] text-teal-200">AI sentiment & course ratings</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <BarChart3 className="w-4 h-4 text-teal-300 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">15s Live Polling</div>
                <div className="text-[11px] text-teal-200">Active engagement telemetry</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Switchers */}
        <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-teal-200/80 pt-4 border-t border-white/10">
          <span>EduPulse AI Faculty Portal &copy; 2026</span>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <Link to="/login/student" className="hover:text-white underline transition">Student Login</Link>
            <span>&bull;</span>
            <Link to="/login/admin" className="hover:text-white underline transition">Admin Login</Link>
          </div>
        </div>
      </div>

      {/* Right Faculty Sign In Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-7">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5" /> All Portals
              </Link>
              <span className="text-xs px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-full">
                Faculty Access
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Sign In</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign into your teacher account to oversee classrooms, attendance, and student metrics.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Faculty Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@teacher.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating Staff...' : 'Access Faculty Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Faculty Accounts */}
          <div className="pt-5 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Verified Faculty Profiles</span>
              <span className="text-[10px] text-emerald-600 normal-case font-semibold">1-Click Auto Fill</span>
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('sarah.jenkins@teacher.edu', 'Sarah@2026#Prof')}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-emerald-700 flex items-center justify-between">
                  <span>Prof. Sarah Jenkins</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">CS Dept Head</span>
                </div>
                <div className="text-[11px] text-slate-500">sarah.jenkins@teacher.edu &bull; 4 students qualifying feedback &ge;80%</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('david.kumar@teacher.edu', 'David@2026#Prof')}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-teal-700 flex items-center justify-between">
                  <span>Dr. David Kumar</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">AI / Data Science</span>
                </div>
                <div className="text-[11px] text-slate-500">david.kumar@teacher.edu &bull; 2 students at-risk cohort &lt;80%</div>
              </button>
            </div>
          </div>

          {/* Switchers */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Other Access Portals:</span>
            <div className="flex items-center space-x-3">
              <Link to="/login/student" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
                Student
              </Link>
              <span>&bull;</span>
              <Link to="/login/admin" className="text-violet-600 hover:text-violet-700 font-semibold hover:underline">
                Admin
              </Link>
              <span>&bull;</span>
              <Link to="/editor" className="text-amber-600 hover:text-amber-700 font-semibold hover:underline">
                Editor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyLogin;
