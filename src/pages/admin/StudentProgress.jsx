import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import DataTable from '../../components/DataTable';
import { GraduationCap, Award, BookOpen, Clock, Coins, CheckCircle2 } from 'lucide-react';

export function StudentProgress() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentProgress() {
      try {
        const res = await api.get('/admin/student-progress');
        setStudents(res.data?.students || []);
      } catch (err) {
        console.error('Failed to load student progress:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentProgress();
  }, []);

  if (loading) {
    return <Loader text="Aggregating student progress milestones & time tracking..." />;
  }

  const columns = [
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.name}</span>
          <div className="text-[11px] text-slate-400">{row.department}</div>
        </div>
      )
    },
    {
      header: 'Attendance Rate',
      accessor: 'attendanceRate',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
            row.attendanceRate >= 80
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.attendanceRate}%
        </span>
      )
    },
    {
      header: 'Completed Courses',
      accessor: 'completedCourses',
      render: (row) => (
        <span className="font-semibold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          {row.completedCourses} completed
        </span>
      )
    },
    {
      header: 'In-Progress Courses',
      accessor: 'inProgressCourses',
      render: (row) => (
        <span className="font-semibold text-xs text-indigo-700">
          {row.inProgressCourses} active
        </span>
      )
    },
    {
      header: 'Certificates',
      accessor: 'certificates',
      render: (row) => (
        <span className="font-bold text-xs text-amber-700">
          {row.certificates} issued
        </span>
      )
    },
    {
      header: 'Mock Tests Taken',
      accessor: 'testAttempts',
      render: (row) => (
        <span className="text-xs text-slate-700">
          {row.testAttempts} tests (avg {row.avgTestScore}%)
        </span>
      )
    },
    {
      header: 'Coin Balance',
      accessor: 'coins',
      render: (row) => (
        <span className="font-bold text-xs text-amber-600 font-mono">
          {row.coins} coins
        </span>
      )
    },
    {
      header: 'Platform Study Time',
      accessor: 'totalPlatformMinutes',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 font-semibold">
          {Math.round(row.totalPlatformMinutes / 60 * 10) / 10} hrs ({row.totalPlatformMinutes}m)
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
            <span>Student Academic Trajectory</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {students.length} Undergraduates
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive audit of course completions, certificates, assessments, coins, and total study telemetry
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchPlaceholder="Search student trajectory records..."
      />
    </div>
  );
}

export default StudentProgress;
