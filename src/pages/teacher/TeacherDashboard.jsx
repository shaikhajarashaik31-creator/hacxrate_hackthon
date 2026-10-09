import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import Loader from '../../components/Loader';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  MessagesSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import usePolling from '../../hooks/usePolling';

export function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/teacher/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  usePolling(loadDashboard, 15000);

  if (loading) {
    return <Loader text="Loading faculty telemetry & class metrics..." />;
  }

  const { stats, todayLogins, coursesDistribution } = data || {
    stats: { totalStudents: 0, totalCourses: 0, classAttendanceAvg: 0, averagePerformance: 0, todayActiveCount: 0 },
    todayLogins: [],
    coursesDistribution: []
  };

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 p-6 sm:p-8 text-white shadow-lg shadow-emerald-600/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" /> Faculty Operations Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Class Telemetry & Student Success Monitor
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Managing <strong>{stats.totalCourses} courses</strong> across <strong>{stats.totalStudents} enrolled students</strong>. Class attendance average is at <strong className="text-white underline decoration-amber-400">{stats.classAttendanceAvg}%</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/teacher/feedback-summary"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-sm flex items-center space-x-1.5"
            >
              <MessagesSquare className="w-4 h-4 text-emerald-600" />
              <span>AI Feedback Summary</span>
            </Link>
            <Link
              to="/teacher/students"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-md flex items-center space-x-1.5"
            >
              <Users className="w-4 h-4" />
              <span>View Enrolled Students</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled Students"
          value={stats.totalStudents}
          subtitle={`Across ${stats.totalCourses} courses taught`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Class Attendance Average"
          value={`${stats.classAttendanceAvg}%`}
          subtitle={stats.classAttendanceAvg >= 80 ? 'Class above target threshold' : 'Under 80% mark'}
          icon={CalendarCheck}
          color={stats.classAttendanceAvg >= 80 ? 'emerald' : 'amber'}
          trend={stats.classAttendanceAvg >= 80 ? 3 : -1}
        />
        <StatCard
          title="Average Class Performance"
          value={`${stats.averagePerformance}%`}
          subtitle="Overall academic score"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Active Students Today"
          value={stats.todayActiveCount}
          subtitle="Logged in past 24 hours"
          icon={Clock}
          color="purple"
          badge="Live Today"
        />
      </div>

      {/* Charts & Enrolled Course Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Performance Bar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Course Enrollment & Average Performance"
            subtitle="Student count and scores per course"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={coursesDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => val.split(' ')[0]}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="averageScore" fill="#10B981" radius={[6, 6, 0, 0]} name="Avg Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Today's Logged-in Students List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-base font-semibold text-slate-900">Today's Logged-In Students</h4>
              <p className="text-xs text-slate-500">Live attendance & engagement</p>
            </div>
            <Link
              to="/teacher/student-logins"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {todayLogins.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No student logins recorded yet today.</p>
            ) : (
              todayLogins.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-500">
                    {new Date(s.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>Telemetry active</span>
            <strong className="text-emerald-600">{todayLogins.length} active sessions</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
