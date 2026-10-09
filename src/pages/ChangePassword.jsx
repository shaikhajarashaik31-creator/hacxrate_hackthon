import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Lock, ShieldAlert, CheckCircle2, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';

export function ChangePassword() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const isValid = hasMinLength && hasNumber && hasSymbol && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValid) {
      setError('Please satisfy all password security requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });

      setSuccess(res.data.message || 'Password updated successfully!');
      await refreshUser();

      setTimeout(() => {
        const dest = user?.role ? `/${user.role}/dashboard` : '/login';
        navigate(dest, { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password. Please verify current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {user?.must_change_password ? 'First Login: Change Password' : 'Change Password'}
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {user?.must_change_password
              ? 'Welcome to EduPulse AI! For security, you must create your personal password before continuing.'
              : 'Update your EduPulse AI account security credentials.'}
          </p>
        </div>

        {/* Notices */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success} Redirecting to your dashboard...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Current / Temporary Password
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 chars, 1 number, 1 symbol"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* Validation Checklist */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              Password Security Rules:
            </p>
            <div className="space-y-1.5">
              <div className={`flex items-center space-x-2 ${hasMinLength ? 'text-emerald-700' : 'text-slate-400'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least 8 characters long</span>
              </div>
              <div className={`flex items-center space-x-2 ${hasNumber ? 'text-emerald-700' : 'text-slate-400'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least one numeric digit (0-9)</span>
              </div>
              <div className={`flex items-center space-x-2 ${hasSymbol ? 'text-emerald-700' : 'text-slate-400'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasSymbol ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>At least one symbol (!@#$%^&*...)</span>
              </div>
              <div className={`flex items-center space-x-2 ${passwordsMatch ? 'text-emerald-700' : 'text-slate-400'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <span>{loading ? 'Securing Account...' : 'Set New Password & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate(user?.role ? `/${user.role}/dashboard` : '/student/dashboard', { replace: true })}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition text-center hover:bg-slate-100/60 rounded-xl cursor-pointer"
          >
            Skip for now &amp; proceed to Dashboard &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
