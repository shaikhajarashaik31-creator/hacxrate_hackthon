import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import {
  MessagesSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Star,
  Users,
  Filter,
  AlertTriangle,
  Target,
  ArrowRight,
  UserCheck,
  UserX
} from 'lucide-react';

export function FeedbackSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeedbackSummary() {
      try {
        setLoading(true);
        const res = await api.get('/teacher/feedback-summary');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load feedback summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeedbackSummary();
  }, []);

  if (loading) {
    return <Loader text="Evaluating honors cohort feedback against strict 80/80 threshold..." />;
  }

  const {
    insufficientCohort,
    message,
    summary,
    eligibleCount = 0,
    totalFeedbackCount = 0,
    includedCount = 0,
    excludedCount = 0,
    includedStudents = [],
    eligibleComments = []
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>High-Achiever Feedback Synthesis</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Strict 80/80 Filter
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Synthesizes student reviews strictly from high-achievers with Attendance ≥ 80% AND Course Score ≥ 80%
          </p>
        </div>

        {/* Filter Stats Pill */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center min-w-[100px]">
            <p className="text-[10px] uppercase font-bold text-emerald-700">Eligible (≥80%)</p>
            <p className="text-xl font-black">{includedCount} Students</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-center min-w-[100px]">
            <p className="text-[10px] uppercase font-bold text-slate-400">Filtered Out</p>
            <p className="text-xl font-black text-slate-500">{excludedCount} (&lt;80%)</p>
          </div>
        </div>
      </div>

      {/* Filter Explanation Notice */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start space-x-3 text-indigo-900 text-xs">
        <Filter className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Algorithmic Noise Gate Applied:</strong>
          <span className="text-indigo-800 ml-1">
            To eliminate disengaged or irregular feedback bias, responses are filtered live. Only students with both <strong>Attendance ≥ 80%</strong> and <strong>Performance ≥ 80%</strong> qualify. Exactly <strong>{includedCount} of {totalFeedbackCount}</strong> total feedback submissions met this criteria.
          </span>
        </div>
      </div>

      {/* CASE 1: Insufficient Cohort Threshold (< 3 students) */}
      {insufficientCohort ? (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-black text-amber-900 tracking-tight">
              Cohort Threshold Not Met ({includedCount} of 3 Required)
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
              {message || `Only ${includedCount} student(s) met the dual honors threshold (Attendance ≥ 80% and Performance ≥ 80%). EduPulse AI requires a minimum cohort of 3 qualifying students to generate a representative, statistically valid teaching synthesis.`}
            </p>
          </div>

          {/* Included Students Chips */}
          {includedStudents.length > 0 && (
            <div className="pt-2 max-w-md mx-auto">
              <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-2">
                Currently Qualifying Students:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {includedStudents.map((name, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold shadow-xs flex items-center space-x-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw comments of qualifying students */}
          {eligibleComments.length > 0 && (
            <div className="pt-6 border-t border-amber-200/80 text-left max-w-2xl mx-auto space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Individual Qualifying Student Submissions ({eligibleComments.length}):
              </h4>
              <div className="space-y-2">
                {eligibleComments.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-white border border-amber-200 text-xs space-y-1">
                    <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                      <span className="text-slate-800 font-bold">{c.student_name} ({c.course_title})</span>
                      <span className="text-emerald-700 font-bold">Att: {c.attendance_rate}% • Score: {c.score}%</span>
                    </div>
                    <p className="text-slate-700 italic">"{c.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : summary ? (
        /* CASE 2: Sufficient Cohort (>= 3 students) - Full Executive Synthesis */
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Executive Teaching Synthesis</h3>
                <p className="text-xs text-slate-500">Based on {includedCount} verified high-performing students</p>
              </div>
            </div>

            {summary.executiveSummary && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-800 text-xs sm:text-sm leading-relaxed italic">
                "{summary.executiveSummary}"
              </div>
            )}

            {/* Strengths & Improvement Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Pedagogical Strengths</span>
                </h4>
                <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                  {summary.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Refinement Opportunities</span>
                </h4>
                <ul className="space-y-2 text-xs text-amber-950 font-medium">
                  {summary.areasToImprove?.map((area, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 5 Structured Action Points for Teachers */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">5 Structured Pedagogical Action Points</h3>
                  <p className="text-xs text-slate-500">Concrete steps formulated to elevate lecture engagement and student outcomes</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800">
                5 Targets
              </span>
            </div>

            <div className="space-y-3">
              {(summary.actionPoints || []).map((ap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 transition flex items-start space-x-3.5 group"
                >
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:scale-105 transition">
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {ap}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Included Students List */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Included Qualifying Cohort ({includedStudents.length} Students)
            </h3>
            <div className="flex flex-wrap gap-2">
              {includedStudents.map((name, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-1.5"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>{name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default FeedbackSummary;
