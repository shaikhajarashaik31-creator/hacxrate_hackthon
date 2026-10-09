import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import { Users, AlertTriangle, CheckCircle2, ShieldCheck, Mail, Calendar } from 'lucide-react';

export function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'at_risk' | 'high_achievers'

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await api.get('/teacher/students');
        setStudents(res.data?.students || []);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  if (loading) {
    return <Loader text="Loading your enrolled student roster & analytics..." />;
  }

  const filteredStudents = students.filter((s) => {
    if (filterMode === 'at_risk') {
      return (s.attendance_rate < 80) || (s.average_score < 75);
    }
    if (filterMode === 'high_achievers') {
      return (s.attendance_rate >= 80) && (s.average_score >= 80);
    }
    return true;
  });

  const columns = [
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-400">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <span className="text-xs text-slate-600">{row.department}</span>
      )
    },
    {
      header: 'Attendance Rate',
      accessor: 'attendance_rate',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
            row.attendance_rate >= 80
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.attendance_rate}%
        </span>
      )
    },
    {
      header: 'Avg Score',
      accessor: 'average_score',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
            row.average_score >= 80
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : row.average_score >= 60
              ? 'bg-slate-100 text-slate-700'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.average_score}%
        </span>
      )
    },
    {
      header: 'Enrolled Courses',
      accessor: 'enrolled_courses',
      render: (row) => (
        <span className="text-xs text-slate-600 truncate max-w-[200px] block" title={row.enrolled_courses}>
          {row.enrolled_courses || 'None'}
        </span>
      )
    },
    {
      header: 'Last Login',
      accessor: 'last_login',
      render: (row) => (
        <span className="text-xs font-mono text-slate-500">
          {row.last_login ? new Date(row.last_login).toLocaleDateString() : 'Never'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Enrolled Students Roster</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {students.length} Students Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time attendance rates, performance evaluations, and session activity tracking
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setFilterMode('high_achievers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'high_achievers' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Honors (≥80%)
          </button>
          <button
            onClick={() => setFilterMode('at_risk')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'at_risk' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            At Risk (&lt;80%)
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search students by name, email, or department..."
      />
    </div>
  );
}

export default MyStudents;
