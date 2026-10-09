import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  CalendarCheck,
  FileCheck2,
  Code2,
  GraduationCap,
  FileText,
  BotMessageSquare,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sliders,
  Printer,
  ChevronRight,
  Info,
  HelpCircle,
  Award
} from 'lucide-react';

export function RiskStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // What-If Simulator state
  const [simTest, setSimTest] = useState(70);
  const [simCoding, setSimCoding] = useState(65);
  const [simCourse, setSimCourse] = useState(60);
  const [simAttendance, setSimAttendance] = useState(75);

  useEffect(() => {
    fetchRiskStatus();
  }, []);

  const fetchRiskStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/risk-status');
      setData(res.data);
      if (res.data?.breakdown) {
        setSimTest(res.data.breakdown.tests?.score || 70);
        setSimCoding(res.data.breakdown.coding?.accuracy || 65);
        setSimCourse(res.data.breakdown.courseProgress?.progress || 60);
        setSimAttendance(res.data.breakdown.attendance?.rate || 75);
      }
    } catch (err) {
      console.error('Failed to load risk status:', err);
      setError('Unable to load risk diagnostics. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate simulated overall score and status
  const simStanding = Math.min(100, Math.max(0, Math.round(
    (simTest * 0.40) +
    (simCoding * 0.25) +
    (simCourse * 0.20) +
    (simAttendance * 0.15)
  )));

  let simLevel = 'good';
  let simTitle = 'Good Standing';
  let simBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';

  if (simAttendance < 75 || simStanding < 65) {
    simLevel = 'critical';
    simTitle = 'Critical Academic Risk';
    simBadgeClass = 'bg-rose-50 text-rose-700 border-rose-300';
  } else if (simAttendance < 80 || simStanding < 75) {
    simLevel = 'moderate';
    simTitle = 'Moderate Risk';
    simBadgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
  } else if (simStanding >= 85 && simAttendance >= 90) {
    simLevel = 'honors';
    simTitle = 'Honors / Excellence';
    simBadgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-300';
  }

  if (loading) return <Loader fullScreen message="Evaluating student academic telemetry & risk factors..." />;

  const isAtRisk = data?.riskLevel === 'critical' || data?.riskLevel === 'moderate';

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
              Student Risk Status & Recovery Engine
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              40/25/20/15 Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time diagnostic analysis of attendance, mock tests, code submissions, and an actionable roadmap to recover good academic standing.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="self-start sm:self-auto no-print inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold shadow-xs transition"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Advisory Report</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Status Hero Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden transition-all ${
          data?.riskLevel === 'critical'
            ? 'bg-gradient-to-br from-rose-900 via-rose-800 to-slate-900 text-white border-rose-700/50 shadow-rose-900/10'
            : data?.riskLevel === 'moderate'
            ? 'bg-gradient-to-br from-amber-900 via-amber-800 to-slate-900 text-white border-amber-700/50 shadow-amber-900/10'
            : 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-700/50 shadow-emerald-900/10'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md flex items-center space-x-1.5 ${
                  data?.riskLevel === 'critical'
                    ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                    : data?.riskLevel === 'moderate'
                    ? 'bg-amber-500/30 text-amber-200 border-amber-400/40'
                    : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                }`}
              >
                {data?.riskLevel === 'critical' ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : data?.riskLevel === 'moderate' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{data?.riskTitle || 'Academic Standing'}</span>
              </span>

              {isAtRisk && (
                <span className="animate-pulse px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white">
                  Action Required
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {data?.riskLevel === 'critical'
                ? 'Academic Alert: Immediate Intervention Recommended'
                : data?.riskLevel === 'moderate'
                ? 'Moderate Risk: Action Needed to Restore Standing'
                : 'Excellent Standing: Performing at Institutional Benchmark'}
            </h2>

            <p className="text-sm text-slate-200/90 leading-relaxed">
              {data?.riskLevel === 'critical'
                ? `Your standing is currently ${data?.standing}% with an attendance rate of ${data?.attendanceRate}%. Institutional policies require minimum 80% attendance and 75% performance to avoid academic probation. Follow the 5-step recovery plan below.`
                : data?.riskLevel === 'moderate'
                ? `Your standing is currently ${data?.standing}% with an attendance rate of ${data?.attendanceRate}%. You are near the 80% benchmark boundary. Completing the recommended tasks will swiftly lift you into safe standing.`
                : `Your standing is currently ${data?.standing}% with an attendance rate of ${data?.attendanceRate}%. You are well clear of academic risk thresholds and on track for graduation honors.`}
            </p>
          </div>

          {/* Quick Metrics Circle */}
          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 flex-shrink-0">
            <div className="text-center pr-4 border-r border-white/20">
              <div className="text-3xl sm:text-4xl font-black text-white">{data?.standing}%</div>
              <div className="text-[11px] text-slate-200 uppercase tracking-wider font-semibold mt-0.5">Weighted Standing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-white">{data?.attendanceRate}%</div>
              <div className="text-[11px] text-slate-200 uppercase tracking-wider font-semibold mt-0.5">Class Attendance</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Pillars Diagnostic Cards (40/25/20/15) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <span>4-Pillar Performance Diagnostics</span>
            <span className="text-xs font-normal text-slate-500">(Formula: 40% Tests + 25% Code + 20% Lessons + 15% Attendance)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Mock Tests (40%) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-50 text-indigo-700">40% Weight</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{data?.breakdown?.tests?.score || 0}%</div>
              <div className="text-xs font-semibold text-slate-700">Mock Tests Average</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Target: 80% &bull; {data?.breakdown?.tests?.count || 0} Attempts Taken
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (data?.breakdown?.tests?.score || 0) < 70 ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, data?.breakdown?.tests?.score || 0)}%` }}
              />
            </div>
            <div className="text-[11px] font-medium text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Status:</span>
              <span className={(data?.breakdown?.tests?.score || 0) < 70 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {(data?.breakdown?.tests?.score || 0) < 70 ? 'Deficit (-10% shortfall)' : 'Healthy'}
              </span>
            </div>
          </div>

          {/* Pillar 2: Coding Practice (25%) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-sky-300 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-sky-50 text-sky-700">25% Weight</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{data?.breakdown?.coding?.accuracy || 0}%</div>
              <div className="text-xs font-semibold text-slate-700">Code Arena Accuracy</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Target: 80% &bull; {data?.breakdown?.coding?.solved || 0} Solved Problems
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (data?.breakdown?.coding?.accuracy || 0) < 70 ? 'bg-amber-500' : 'bg-sky-600'
                }`}
                style={{ width: `${Math.min(100, data?.breakdown?.coding?.accuracy || 0)}%` }}
              />
            </div>
            <div className="text-[11px] font-medium text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Status:</span>
              <span className={(data?.breakdown?.coding?.accuracy || 0) < 70 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                {(data?.breakdown?.coding?.accuracy || 0) < 70 ? 'Practice Needed' : 'On Track'}
              </span>
            </div>
          </div>

          {/* Pillar 3: Course Progress (20%) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-300 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-50 text-purple-700">20% Weight</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{data?.breakdown?.courseProgress?.progress || 0}%</div>
              <div className="text-xs font-semibold text-slate-700">Course Completion</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Target: 80% &bull; {data?.breakdown?.courseProgress?.count || 0} Enrolled Courses
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-600"
                style={{ width: `${Math.min(100, data?.breakdown?.courseProgress?.progress || 0)}%` }}
              />
            </div>
            <div className="text-[11px] font-medium text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Status:</span>
              <span className="text-purple-600 font-bold">+5 Coins / Lesson</span>
            </div>
          </div>

          {/* Pillar 4: Class Attendance (15%) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-50 text-emerald-700">15% Weight</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{data?.attendanceRate || 0}%</div>
              <div className="text-xs font-semibold text-slate-700">Attendance Rate</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Min: 80% &bull; {data?.absentClasses || 0} Absent Lectures
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (data?.attendanceRate || 0) < 80 ? 'bg-rose-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, data?.attendanceRate || 0)}%` }}
              />
            </div>
            <div className="text-[11px] font-medium text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Threshold:</span>
              <span className={(data?.attendanceRate || 0) < 80 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {(data?.attendanceRate || 0) < 80 ? 'Below 80% Required' : 'Compliant'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 ACTIONABLE ROADMAP: HOW TO IMPROVE FROM RISK STATE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Remedial Masterplan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            How to Improve from Risk State — 5-Step Action Recovery Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Target the highest-impact recovery levers first. Follow these sequenced steps to rapidly eliminate performance deficits and secure good academic standing.
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1: Attendance & Missed Notes Remediation */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-indigo-600/20">
                1
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Recover Missed Lectures with Handwritten Notes
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    Fast Knowledge Catch-Up
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Every absent lecture creates knowledge gaps that drag down mock tests. Access AI-synthesized 5-page handwritten lecture notes with diagrams for missed dates, review them, and toggle <strong>"Mark as Revised"</strong>.
                  {data?.classesNeededFor80 > 0 && (
                    <span className="block mt-1 font-semibold text-rose-600">
                      &bull; You need to attend the next {data.classesNeededFor80} consecutive classes without absence to cross 80%.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Link
              to="/student/notes"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex-shrink-0 self-start md:self-auto"
            >
              <FileText className="w-4 h-4" />
              <span>Review Missed Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 2: Mock Tests Score Elevation (40% Weight - Highest Leverage) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-emerald-600/20">
                2
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Retake & Boost Mock Tests (Highest ROI Lever)
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    40% Direct Weight
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Mock tests carry the largest weight (40%) in your standing. Gaining just <strong>+10%</strong> on a mock test boosts your overall standing by <strong>+4.0%</strong> directly. Retake low-scoring assessments to immediately lift your grade.
                </p>
              </div>
            </div>

            <Link
              to="/student/tests"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition flex-shrink-0 self-start md:self-auto"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Take Mock Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 3: Coding Practice Sprint */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-sky-600/20">
                3
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Solve 3-5 Problems in the Practice Arena
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                    25% Weight + Coin Bonus
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Solve Easy & Medium level problems in the 40-question arena. First-time problem solves earn +10 to +25 Spark Coins and directly raise your submission accuracy score.
                </p>
              </div>
            </div>

            <Link
              to="/student/practice"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition flex-shrink-0 self-start md:self-auto"
            >
              <Code2 className="w-4 h-4" />
              <span>Solve Code Challenges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 4: Advance Enrolled Course Lessons */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-purple-600/20">
                4
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Complete Enrolled Sequential Lessons & Certification
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                    20% Weight + 100 Coin Passing Bonus
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Complete your sequential reading modules in enrolled courses. Each completed lesson awards +5 coins. Passing the final 70% quiz earns an official certificate and +100 bonus coins.
                </p>
              </div>
            </div>

            <Link
              to="/student/courses"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition flex-shrink-0 self-start md:self-auto"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Resume Course Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 5: Consult 1-on-1 AI Mentor */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 hover:border-indigo-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-indigo-600/20">
                5
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-indigo-950 text-sm sm:text-base">
                    Generate a Personalized 7-Day Study Plan with AI Mentor
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-bold">
                    Gemini 1.5 Flash
                  </span>
                </div>
                <p className="text-xs text-indigo-800/80 max-w-2xl leading-relaxed">
                  Ask the AI Mentor: <em>"My attendance is low and I struggled on algorithms. Generate an hour-by-hour 7-day remedial study plan to get me back on track."</em>
                </p>
              </div>
            </div>

            <Link
              to="/student/ai-assistant"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-700/20 transition flex-shrink-0 self-start md:self-auto"
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>Chat with AI Mentor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 🎛️ INTERACTIVE WHAT-IF RECOVERY SIMULATOR */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Interactive "What-If" Standing Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Slide target metrics to see how improving individual components will elevate your overall standing and exit risk state.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex-shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Projected Standing</div>
              <div className="text-2xl font-black text-indigo-400">{simStanding}%</div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${simBadgeClass}`}>
              {simTitle}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Mock Tests */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Mock Tests Score (40% Weight)</span>
              <span className="text-indigo-400 font-mono text-sm">{simTest}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={simTest}
              onChange={(e) => setSimTest(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline: 40%</span>
              <span>Contribution: {(simTest * 0.40).toFixed(1)} pts</span>
              <span>Target: 100%</span>
            </div>
          </div>

          {/* Slider 2: Coding Arena */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Coding Arena Accuracy (25% Weight)</span>
              <span className="text-sky-400 font-mono text-sm">{simCoding}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={simCoding}
              onChange={(e) => setSimCoding(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline: 40%</span>
              <span>Contribution: {(simCoding * 0.25).toFixed(1)} pts</span>
              <span>Target: 100%</span>
            </div>
          </div>

          {/* Slider 3: Course Completion */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Course Lessons Progress (20% Weight)</span>
              <span className="text-purple-400 font-mono text-sm">{simCourse}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={simCourse}
              onChange={(e) => setSimCourse(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline: 40%</span>
              <span>Contribution: {(simCourse * 0.20).toFixed(1)} pts</span>
              <span>Target: 100%</span>
            </div>
          </div>

          {/* Slider 4: Attendance */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Class Attendance Rate (15% Weight)</span>
              <span className="text-emerald-400 font-mono text-sm">{simAttendance}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={simAttendance}
              onChange={(e) => setSimAttendance(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Threshold: 80%</span>
              <span>Contribution: {(simAttendance * 0.15).toFixed(1)} pts</span>
              <span>Target: 100%</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Simulation Insight: Raising your mock test score to <strong>85%</strong> and maintaining <strong>85% attendance</strong> pushes your standing to <strong>{Math.round((85 * 0.4) + (simCoding * 0.25) + (simCourse * 0.2) + (85 * 0.15))}%</strong>!
            </span>
          </div>
          <button
            onClick={() => {
              setSimTest(85);
              setSimAttendance(85);
              setSimCoding(80);
              setSimCourse(80);
            }}
            className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-[11px] font-semibold transition"
          >
            Apply Recommended Targets
          </button>
        </div>
      </div>

      {/* Subject-Specific Risk Matrix */}
      {data?.subjects && data.subjects.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Subject-Specific Vulnerability Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of attendance and academic score across each of your enrolled courses.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Course / Subject</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Academic Score</th>
                  <th className="py-3 px-4">Lesson Progress</th>
                  <th className="py-3 px-4 text-right">Risk Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.subjects.map((sub) => (
                  <tr key={sub.course_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {sub.subject_name}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className={sub.attendance < 80 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {sub.attendance}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className={sub.score < 65 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {sub.score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${sub.progress_percent || 0}%` }} />
                        </div>
                        <span className="text-[11px] font-mono">{sub.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {sub.status === 'critical' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Critical Alert
                        </span>
                      ) : sub.status === 'needs_attention' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Needs Attention
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          On Track
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskStatus;
