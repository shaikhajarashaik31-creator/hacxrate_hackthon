import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import ChartCard from '../../components/ChartCard';
import DataTable from '../../components/DataTable';
import { BarChart3, Clock, TrendingUp, Users, BookOpen } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get('/teacher/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load teacher analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return <Loader text="Calculating engagement telemetry and time analytics..." />;
  }

  const { timePerStudent, timePerCourse, testDurations } = data || {
    timePerStudent: [],
    timePerCourse: [],
    testDurations: []
  };

  const testColumns = [
    {
      header: 'Assessment Title',
      accessor: 'test_title',
      render: (row) => <span className="font-bold text-slate-900">{row.test_title}</span>
    },
    {
      header: 'Average Duration',
      accessor: 'avg_duration_minutes',
      render: (row) => <span className="font-mono text-xs text-indigo-600">{row.avg_duration_minutes} mins</span>
    },
    {
      header: 'Average Score',
      accessor: 'avg_score',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          row.avg_score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
        }`}>
          {row.avg_score}%
        </span>
      )
    },
    {
      header: 'Submissions',
      accessor: 'total_submissions',
      render: (row) => <span className="text-xs text-slate-600">{row.total_submissions} attempts</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Faculty Learning Analytics</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Telemetry
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated time spent per student, course engagement, and mock test pacing telemetry
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time spent per course */}
        <ChartCard
          title="Engagement Time Per Course"
          subtitle="Total minutes spent by students on course curriculum"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timePerCourse} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="course_title"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => val.split(' ')[0]}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(val) => [`${val} mins`, 'Study Time']}
              />
              <Bar dataKey="minutes_spent" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Time spent per student */}
        <ChartCard
          title="Student Platform Study Time"
          subtitle="Top engaged students (minutes logged)"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timePerStudent.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="student_name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => val.split(' ')[0]}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(val) => [`${val} mins`, 'Study Time']}
              />
              <Bar dataKey="minutes_spent" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Test Durations & Difficulty Table */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">Mock Test Duration & Score Metrics</h3>
        <DataTable
          columns={testColumns}
          data={testDurations}
          searchPlaceholder="Search test titles..."
        />
      </div>
    </div>
  );
}

export default Analytics;
