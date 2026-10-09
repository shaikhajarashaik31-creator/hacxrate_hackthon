import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import {
  ShieldCheck,
  AlertCircle,
  Award,
  Calendar,
  User,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Printer
} from 'lucide-react';

export function VerifyCertificate() {
  const { code } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verify() {
      try {
        setLoading(true);
        setError(null);
        // Note: verify endpoint is public on /api/verify/:code
        const res = await api.get(`/verify/${code}`);
        setData(res.data);
      } catch (err) {
        console.error('Certificate verification error:', err);
        setError(err.response?.data?.error || 'Certificate could not be verified or does not exist.');
      } finally {
        setLoading(false);
      }
    }
    if (code) {
      verify();
    }
  }, [code]);

  if (loading) {
    return <Loader text="Verifying digital credential authenticity against cryptographic registry..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">
            EP
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">EduPulse AI</span>
            <span className="text-xs text-indigo-400 block -mt-1 font-semibold">Credential Registry</span>
          </div>
        </Link>

        <Link
          to="/login"
          className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center space-x-1"
        >
          <span>Platform Login</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Verification Card */}
      <div className="max-w-3xl mx-auto w-full py-10">
        {error ? (
          <div className="bg-slate-800/80 border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {error}
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-mono text-slate-400">
                Queried ID: {code}
              </span>
            </div>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : data && (
          <div className="bg-slate-800/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8 relative overflow-hidden">
            {/* Top Verification Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-emerald-300 tracking-wide uppercase">
                      Official Verified Credential
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/30 text-emerald-200">
                      AUTHENTIC
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400/80">
                    Validated against EduPulse AI Immutable Ledger
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-xs text-slate-300">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Verification ID</span>
                <span className="font-bold text-emerald-300">{data.certificate_code}</span>
              </div>
            </div>

            {/* Certificate Details Frame */}
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-slate-900 shadow-inner border-4 border-double border-amber-600/50 text-center relative overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award className="w-80 h-80 text-amber-900" />
              </div>

              <div className="relative z-10 space-y-4">
                <p className="text-xs font-extrabold tracking-widest uppercase text-indigo-700">
                  EduPulse AI Academy of Engineering
                </p>

                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900">
                  Certificate of Academic Excellence
                </h1>

                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  This certifies that
                </p>

                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-indigo-900 border-b-2 border-amber-300 inline-block px-8 pb-1">
                  {data.student_name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                  Has successfully completed all required coursework, rigorous modular assessments, and the final certification evaluation for
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {data.course_title}
                </h3>

                <div className="grid grid-cols-2 gap-6 pt-6 max-w-md mx-auto border-t border-slate-200 text-xs">
                  <div>
                    <span className="block text-slate-400 uppercase text-[10px] font-bold">Instructor</span>
                    <strong className="text-slate-800">{data.teacher_name || 'Academic Faculty'}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase text-[10px] font-bold">Issued Date</span>
                    <strong className="text-slate-800">{new Date(data.issued_at).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1 font-semibold">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Student</span>
                </div>
                <p className="text-sm font-bold text-white">{data.student_name}</p>
                <p className="text-[11px] text-slate-400">{data.student_email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1 font-semibold">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Course</span>
                </div>
                <p className="text-sm font-bold text-white truncate">{data.course_title}</p>
                <p className="text-[11px] text-slate-400">{data.category || 'Specialized Curriculum'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1 font-semibold">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Verification Date</span>
                </div>
                <p className="text-sm font-bold text-white">{new Date(data.issued_at).toLocaleDateString()}</p>
                <p className="text-[11px] text-emerald-400">Status: Active & Valid</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                to="/"
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to EduPulse AI</span>
              </Link>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/30"
              >
                <Printer className="w-4 h-4" />
                <span>Print Verification Statement</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        EduPulse AI Digital Credential Verification Authority • Cryptographically Validated Records
      </div>
    </div>
  );
}

export default VerifyCertificate;
