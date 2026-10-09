import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import Loader from '../../components/Loader';
import usePolling from '../../hooks/usePolling';
import {
  CalendarCheck,
  TrendingUp,
  Coins,
  BookOpen,
  Award,
  Sparkles,
  Code2,
  FileCheck2,
  ArrowRight,
  Clock,
  Activity,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';

export function StudentDashboard() {
  const [data, setData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const [dashRes, trendRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/trend').catch(() => ({ data: { trend: [] } }))
      ]);

      setData(dashRes.data);
      setTrendData(trendRes.data?.trend || []);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // 15-second live telemetry polling
  usePolling(loadDashboard, 15000);

  if (loading && !data) {
    return <Loader text="Loading student analytics & live telemetry..." />;
  }

  const { stats, charts, recentActivities } = data || {
    stats: { attendanceRate: 0, averageScore: 0, coinBalance: 0, coursesInProgress: 0, totalCertificates: 0 },
    charts: { coursePerformance: [], courseAttendance: [], recentTests: [] },
    recentActivities: []
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-lg shadow-indigo-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" /> Success Telemetry • Live 15s Polling
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back to your learning pulse
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100">
              Your overall attendance is at <strong className="text-white underline decoration-amber-400">{stats.attendanceRate}%</strong> and weighted score is <strong className="text-white underline decoration-emerald-400">{stats.averageScore}%</strong>. Keep up your study streaks to earn more bonus coins!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/student/risk-status"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Risk Status & Recovery</span>
            </Link>
            <Link
              to="/student/notes"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition shadow-sm flex items-center space-x-1.5"
            >
              <span>Missed Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/student/practice"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-md flex items-center space-x-1.5"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Practice Arena</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats.attendanceRate}%`}
          subtitle={stats.attendanceRate >= 80 ? 'Meets 80% honors threshold' : 'Attention: Below 80% mark'}
          icon={CalendarCheck}
          color={stats.attendanceRate >= 80 ? 'emerald' : 'amber'}
          trend={stats.attendanceRate >= 80 ? 4 : -2}
        />
        <StatCard
          title="Weighted Performance"
          value={`${stats.averageScore}%`}
          subtitle="40% Tests · 25% Code · 20% Course · 15% Att"
          icon={TrendingUp}
          color="indigo"
          badge="Live Formula"
        />
        <StatCard
          title="EduPulse Coins"
          value={stats.coinBalance}
          subtitle="Redeemable in Course Store"
          icon={Coins}
          color="amber"
          badge="Reward Treasury"
        />
        <StatCard
          title="Courses Enrolled"
          value={stats.coursesInProgress + (stats.completedCourses || 0)}
          subtitle={`${stats.coursesInProgress} in progress · ${stats.completedCourses || 0} completed`}
          icon={BookOpen}
          color="purple"
        />
      </div>

      {/* Weighted Performance Formula Strip */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 font-bold text-slate-800">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Real-time Weighted Formula Breakdown:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-bold border border-indigo-100">
            Tests (40%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-800 font-bold border border-violet-100">
            Coding Arena (25%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
            Course Lessons (20%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-100">
            Attendance (15%)
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend Line Chart (Requirement 5) */}
        <ChartCard
          title="Performance Evolution History"
          subtitle="Weighted trajectory tracked across assessment milestones"
        >
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="overall_score"
                  name="Weighted Total (%)"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4F46E5' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="test_score"
                  name="Tests (40%)"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="coding_score"
                  name="Coding (25%)"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="attendance_score"
                  name="Attendance (15%)"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={charts.courseAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => val.split(' ')[0]} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Course Scores Bar Chart */}
        <ChartCard
          title="Course Mastery Breakdown"
          subtitle="Current scores across enrolled syllabus"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.coursePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="title"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => val.split(' ')[0]}
                interval={0}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(val) => [`${val}%`, 'Score']}
              />
              <Bar dataKey="score" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Grid: Recent Tests & Telemetry Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mock Tests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Recent Mock Assessments</h4>
              <p className="text-xs text-slate-500">Your latest timed practice sprint scores</p>
            </div>
            <Link
              to="/student/tests"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View all tests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {charts.recentTests && charts.recentTests.length > 0 ? (
              charts.recentTests.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{t.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {t.completed_at ? new Date(t.completed_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                        t.score >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {t.score}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No test attempts logged yet</p>
            )}
          </div>
        </div>

        {/* Real-time Telemetry Activity Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Academic Activity Stream</h4>
              <p className="text-xs text-slate-500">Chronological telemetry of student events</p>
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live</span>
            </div>
          </div>

          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 transition"
                >
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{act.activity}</p>
                    <p className="text-[10px] text-slate-400">
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No telemetry events recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
