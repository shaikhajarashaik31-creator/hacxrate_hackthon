import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Play,
  Terminal,
  FolderGit2,
  Cpu,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

export function EditorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your credentials to sync projects');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/editor', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 font-sans text-slate-100">
      {/* Left Editor Studio Showcase */}
      <div className="md:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/login" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-500/40 flex items-center justify-center shadow-lg group-hover:bg-amber-500/30 transition">
              <Code2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-white">EduPulse</span>
                <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 font-semibold">STUDIO</span>
              </div>
              <p className="text-xs text-slate-400">Interactive IDE & Project Editor</p>
            </div>
          </Link>

          <Link
            to="/editor"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Editor Directly</span>
          </Link>
        </div>

        {/* Center IDE Showcase */}
        <div className="relative z-10 my-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monaco Multi-Language Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Write, execute, and persist code in 12+ runtimes.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Sign in to auto-save and manage cloud projects, or jump straight into the full sandbox environment with real-time compilation and standard I/O streaming.
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 backdrop-blur-sm">
              <Terminal className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Standard I/O</div>
                <div className="text-[11px] text-slate-400">Custom stdin and stdout logs</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 backdrop-blur-sm">
              <Cpu className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">12+ Languages</div>
                <div className="text-[11px] text-slate-400">JS, Python, C++, Java, Rust, Go</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 backdrop-blur-sm">
              <FolderGit2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Project Cloud Sync</div>
                <div className="text-[11px] text-slate-400">Save and load workspaces</div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 backdrop-blur-sm">
              <Play className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Instant Execution</div>
                <div className="text-[11px] text-slate-400">Low-latency safe sandboxes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Portals */}
        <div className="relative z-10 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
          <span>EduPulse AI Code Studio &copy; 2026</span>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <Link to="/login/student" className="hover:text-slate-200 underline transition">Student</Link>
            <span>&bull;</span>
            <Link to="/login/faculty" className="hover:text-slate-200 underline transition">Faculty</Link>
            <span>&bull;</span>
            <Link to="/login/admin" className="hover:text-slate-200 underline transition">Admin</Link>
          </div>
        </div>
      </div>

      {/* Right Sign In Form & Guest Access */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-950">
        <div className="w-full max-w-md space-y-7">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5" /> All Portals
              </Link>
              <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-full">
                Developer / Studio Access
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Code Studio Sign In</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in to sync your saved coding projects, or launch directly into the sandbox.
            </p>
          </div>

          {/* Quick Launch Guest Button */}
          <Link
            to="/editor"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Open Code Editor Playground (Instant Access)</span>
          </Link>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-950 px-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Or Sign In To Save Work
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">User Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In & Sync Projects'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Test Credentials</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('alex.chen@student.edu', 'Alex@2026#CS01')}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-amber-500 text-left transition"
              >
                <div className="font-semibold text-slate-200">Alex Chen (Student)</div>
                <div className="text-[11px] text-slate-500 truncate">Has saved projects</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('sarah.jenkins@teacher.edu', 'Sarah@2026#Prof')}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-amber-500 text-left transition"
              >
                <div className="font-semibold text-slate-200">Prof. Sarah (Teacher)</div>
                <div className="text-[11px] text-slate-500 truncate">Course Instructor</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorLogin;
