import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Users,
  Code2,
  ChevronRight,
  UserPlus,
  LogIn as LogInIcon,
  Eye,
  EyeOff,
  Coins,
  Building2
} from 'lucide-react';

export function Login({ initialMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, user } = useAuth();

  // Determine active tab: 'signin' or 'signup'
  const getInitialMode = () => {
    if (initialMode) return initialMode;
    const path = location.pathname.toLowerCase();
    if (path.includes('signup') || path.includes('register')) return 'signup';
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'signup' || params.get('tab') === 'signup') return 'signup';
    return 'signin';
  };

  const [mode, setMode] = useState(getInitialMode);

  // Sync mode if URL changes
  useEffect(() => {
    if (location.pathname.includes('signup') || location.pathname.includes('register')) {
      setMode('signup');
    } else if (location.pathname.includes('login') || location.pathname.includes('signin')) {
      const params = new URLSearchParams(location.search);
      if (params.get('mode') === 'signup') {
        setMode('signup');
      } else {
        setMode('signin');
      }
    }
  }, [location.pathname, location.search]);

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState('student');
  const [signupDepartment, setSignupDepartment] = useState('Computer Science & Engineering');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Status & feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Validation rules for sign up
  const isLengthOk = signupPassword.length >= 6;
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>\-_=+]/.test(signupPassword);
  const passwordsMatch = signupPassword && signupPassword === signupConfirmPassword;

  // Handle Sign In submission
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { user: authedUser, redirectUrl } = await login(email.trim(), password);
      setSuccess(`Welcome back, ${authedUser.name}! Directing to your dashboard...`);
      setTimeout(() => {
        navigate(redirectUrl || `/${authedUser.role}/dashboard`, { replace: true });
      }, 400);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isLengthOk) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    setLoading(true);

    try {
      const { user: newUser, redirectUrl } = await signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: signupRole,
        department: signupDepartment
      });

      setSuccess(`Account created successfully! Welcome to EduPulse AI, ${newUser.name}.`);
      setTimeout(() => {
        navigate(redirectUrl || `/${newUser.role}/dashboard`, { replace: true });
      }, 700);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click demo fill helper
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setMode('signin');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Brand Panel */}
      <div className="md:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract background ambient glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-indigo-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center">
                EduPulse <span className="ml-1.5 px-2 py-0.5 text-xs bg-white/20 rounded-full font-bold">AI</span>
              </h2>
              <p className="text-xs text-indigo-200">Autonomous Student Analytics &amp; Telemetry</p>
            </div>
          </Link>

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
                  <div className="text-[11px] text-indigo-200">Rosters &amp; Triage</div>
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
                  <div className="text-[11px] text-indigo-200">Governance &amp; Audits</div>
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

      {/* Right Authentication Form (Sign In & Sign Up) */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          {/* Header Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'signin'
                ? 'Sign in to access your telemetry dashboard, coursework, or administrative tools.'
                : 'Join the EduPulse AI network to track learning analytics, notes, and challenges.'}
            </p>
          </div>

          {/* Interactive Sign In / Sign Up Mode Switcher Tabs */}
          <div className="p-1 bg-slate-100/90 rounded-2xl flex items-center border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogInIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer relative ${
                mode === 'signup'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-extrabold">
                New
              </span>
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ===================== MODE: SIGN IN ===================== */}
          {mode === 'signin' ? (
            <>
              {/* Quick Portal Switcher Pills */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600">
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

              <form onSubmit={handleSignIn} className="space-y-4">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
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
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to EduPulse'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Switch to sign up */}
              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                      setSuccess('');
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  >
                    Create an account / Sign Up &rarr;
                  </button>
                </p>
              </div>

              {/* Quick Demo Accounts Selection */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>1-Click Demo Profiles</span>
                  <span className="text-[10px] text-indigo-600 font-semibold lowercase">click to test</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('alex.chen@student.edu', 'Alex@2026#CS01')}
                    className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition group cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-indigo-600">Alex Chen (Student)</div>
                    <div className="text-[11px] text-slate-500 truncate">alex.chen@student.edu</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('rahul.sharma@student.edu', 'Rahul@2026#CS05')}
                    className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition group cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-indigo-600">Rahul (Missed Notes)</div>
                    <div className="text-[11px] text-slate-500 truncate">rahul.sharma@student.edu</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('sarah.jenkins@teacher.edu', 'Sarah@2026#Prof')}
                    className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition group cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-emerald-700">Prof. Sarah (Faculty)</div>
                    <div className="text-[11px] text-slate-500 truncate">sarah.jenkins@teacher.edu</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@admin.edu', 'Admin@2026#Edu')}
                    className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition group cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-violet-700">Dr. Arthur (Admin)</div>
                    <div className="text-[11px] text-slate-500 truncate">admin@admin.edu</div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ===================== MODE: SIGN UP ===================== */
            <>
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Email address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Academic Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@university.edu"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Type / Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignupRole('student')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        signupRole === 'student'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignupRole('teacher')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        signupRole === 'teacher'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Faculty</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignupRole('admin')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        signupRole === 'admin'
                          ? 'border-violet-600 bg-violet-50 text-violet-700 ring-2 ring-violet-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-violet-600" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Academic Department</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                    >
                      <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                      <option value="Artificial Intelligence & Data Science">Artificial Intelligence &amp; Data Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electrical & Electronics Engineering">Electrical &amp; Electronics Engineering</option>
                      <option value="Mechanical & Mechatronics">Mechanical &amp; Mechatronics</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Password Checklist */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px]">
                  <div className={`flex items-center space-x-1.5 ${isLengthOk ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isLengthOk ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>At least 6 characters long</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${passwordsMatch ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>Passwords match</span>
                  </div>
                </div>

                {/* Student Welcome Bonus Perk Callout */}
                {signupRole === 'student' && (
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900">Student Sign-Up Bonus</p>
                      <p className="text-[11px] text-amber-700">100 free coins credited to your account upon registration!</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Creating Account...' : 'Create EduPulse Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Switch to sign in */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already have an EduPulse account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccess('');
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  >
                    Sign in here &rarr;
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Quick link to Editor */}
          <div className="pt-2 text-center border-t border-slate-100">
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
