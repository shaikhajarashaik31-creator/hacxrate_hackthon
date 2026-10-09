import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import Loader from '../../components/Loader';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  Activity,
  ArrowRight,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

import usePolling from '../../hooks/usePolling';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdminDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  usePolling(loadAdminDashboard, 15000);

  if (loading) {
    return <Loader text="Loading university platform administration telemetry..." />;
  }

  const { stats, departmentDistribution, recentLogins } = data || {
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalCourses: 0,
      activeUsersToday: 0,
      platformAttendance: 0,
      platformAvgScore: 0,
      totalCertificates: 0
    },
    departmentDistribution: [],
    recentLogins: []
  };

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Admin Executive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-violet-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-300" /> Platform Governance Console
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              EduPulse University Oversight
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100">
              Overseeing <strong>{stats.totalStudents} Students</strong> and <strong>{stats.totalTeachers} Faculty Members</strong> across <strong>{stats.totalCourses} Curricula</strong>. Platform-wide average attendance is <strong className="text-white underline decoration-emerald-400">{stats.platformAttendance}%</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/users"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition shadow-sm flex items-center space-x-1.5"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>User Directory</span>
            </Link>
            <Link
              to="/admin/timeline"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-md flex items-center space-x-1.5"
            >
              <Activity className="w-4 h-4" />
              <span>Global Timeline</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Enrolled undergraduates"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Active Faculty"
          value={stats.totalTeachers}
          subtitle="Professors & instructors"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Users Today"
          value={stats.activeUsersToday}
          subtitle="Logged in past 24h"
          icon={Clock}
          color="purple"
          badge="Live"
        />
        <StatCard
          title="Verified Certificates"
          value={stats.totalCertificates}
          subtitle="Earned in extra courses"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Charts & Logins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Distribution Pie Chart (6 cols) */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Department Enrollment Distribution"
            subtitle="Student breakdown across academic faculties"
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent Platform Logins (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-base font-semibold text-slate-900">Recent User Logins</h4>
              <p className="text-xs text-slate-500">Latest platform authentications</p>
            </div>
            <Link
              to="/admin/timeline"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {recentLogins.map((l, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    l.role === 'admin' ? 'bg-violet-100 text-violet-700' : l.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {l.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{l.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{l.role} · {l.ip || '127.0.0.1'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(l.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>Overall Attendance: <strong className="text-emerald-600">{stats.platformAttendance}%</strong></span>
            <span>Platform Score: <strong className="text-indigo-600">{stats.platformAvgScore}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
